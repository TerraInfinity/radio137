#!/usr/bin/env node
/**
 * Deploy-time database migrator (node-postgres, `pg`).
 *
 * Runs during `npm run build` — on every Vercel deploy — applying pending files
 * in ../migrations to DATABASE_URL. Each file is applied in one transaction and
 * recorded in a `_migrations` table, so it runs once and is safe to re-run.
 *
 * The read is non-recursive, so the opt-in auth schema under migrations/auth/
 * is not applied to an app that never asked for sign-in.
 *
 * No DATABASE_URL (local / preview builds) -> skip; the PGLite fallback applies
 * the same files at startup instead (see src/lib/db.ts).
 */
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import dns from "node:dns";
import pg from "pg";
import { pendingMigrations } from "./migration-plan.mjs";

const databaseUrl = (process.env.DATABASE_URL || "").trim();
if (!databaseUrl) {
  console.log(
    "[migrate] DATABASE_URL not set — skipping (the PGLite fallback migrates itself).",
  );
  process.exit(0);
}

// Same as src/lib/db.ts: db.*.supabase.co is often IPv6-only; Vercel then
// fails with ENOTFOUND / ENETUNREACH. Prefer A records. Production should
// still use the Supabase pooler (*.pooler.supabase.com) on Vercel.
dns.setDefaultResultOrder("ipv4first");

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "migrations");

function sqlStatements(text) {
  const stripped = text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((line) => (line.trim().startsWith("--") ? "" : line))
    .join("\n");
  return stripped
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
}

function isIgnorable(err) {
  const code = err?.code;
  const message = String(err?.message || "");
  return (
    code === "42701" ||
    code === "42P07" ||
    code === "42710" ||
    /already exists/i.test(message)
  );
}

function isNetworkError(err) {
  const code = err?.code;
  const message = String(err?.message || err || "");
  return (
    code === "ENOTFOUND" ||
    code === "ENETUNREACH" ||
    code === "EAI_AGAIN" ||
    code === "ECONNREFUSED" ||
    code === "ETIMEDOUT" ||
    code === "EHOSTUNREACH" ||
    code === "ENETDOWN" ||
    code === "ECONNRESET" ||
    /ENOTFOUND|ENETUNREACH|ENETDOWN|EAI_AGAIN|getaddrinfo|connect (e|timed out)|timeout expired/i.test(message)
  );
}

async function connect(pool, attempts = 3) {
  let last;
  for (let i = 0; i < attempts; i++) {
    try {
      return await pool.connect();
    } catch (err) {
      last = err;
      await new Promise((resolve) => setTimeout(resolve, 400 * (i + 1)));
    }
  }
  throw last;
}

async function main() {
  let entries;
  try {
    entries = await readdir(migrationsDir);
  } catch {
    console.log("[migrate] no migrations/ directory — nothing to do.");
    return;
  }
  if (pendingMigrations(entries, []).length === 0) {
    console.log("[migrate] no migrations — nothing to do.");
    return;
  }

  const pool = new pg.Pool({
    connectionString: databaseUrl,
    max: 1,
    connectionTimeoutMillis: 20000,
  });
  const client = await connect(pool);
  try {
    await client.query(
      "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
    );
    const applied = (await client.query("SELECT name FROM _migrations")).rows.map(
      (r) => r.name,
    );

    let count = 0;
    for (const { name } of pendingMigrations(entries, applied)) {
      const text = await readFile(join(migrationsDir, name), "utf8");
      try {
        await client.query("BEGIN");
        for (const stmt of sqlStatements(text)) {
          try {
            await client.query(stmt);
          } catch (err) {
            if (!isIgnorable(err)) throw err;
          }
        }
        await client.query(
          "INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
          [name],
        );
        await client.query("COMMIT");
      } catch (err) {
        console.error(`[migrate] error applying ${name}`);
        try {
          await client.query("ROLLBACK");
        } catch {
          // ROLLBACK fails when the connection died — keep the original error.
        }
        throw err;
      }
      console.log(`[migrate] applied ${name}`);
      count += 1;
    }
    console.log(count ? `[migrate] done — ${count} migration(s) applied.` : "[migrate] up to date.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  if (isNetworkError(err)) {
    console.warn(
      "[migrate] database unreachable — skipping (runtime getSql will migrate when it can connect):",
      err?.message || err,
    );
    process.exit(0);
  }
  console.error("[migrate] failed:", err?.message || err);
  for (const key of ["code", "detail", "hint", "position", "where"]) {
    if (err?.[key] != null) console.error(`[migrate]   ${key}: ${err[key]}`);
  }
  process.exit(1);
});
