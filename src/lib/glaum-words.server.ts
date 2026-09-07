import { getSql } from "@/lib/db";
import {
  cleanAdminWord,
  cleanGuestWord,
  foldGlaum,
  GLAUM_DEFAULT_WORDS,
  monthFromNow,
} from "@/lib/glaum-words";
import type { RadioUser } from "@/lib/sso.server";

export type GlaumWordRow = {
  id: number;
  word: string;
  normalized: string;
  permanent: boolean;
  hidden: boolean;
  authorId: string | null;
  authorName: string | null;
  createdAt: string;
  expiresAt: string | null;
};

type Row = {
  id: number;
  word: string;
  normalized: string;
  permanent: boolean;
  hidden: boolean;
  author_id: string | null;
  author_name: string | null;
  created_at: Date | string;
  expires_at: Date | string | null;
};

function mapRow(row: Row): GlaumWordRow {
  return {
    id: row.id,
    word: row.word,
    normalized: row.normalized,
    permanent: Boolean(row.permanent),
    hidden: Boolean(row.hidden),
    authorId: row.author_id,
    authorName: row.author_name,
    createdAt: typeof row.created_at === "string" ? row.created_at : row.created_at.toISOString(),
    expiresAt: row.expires_at ? (typeof row.expires_at === "string" ? row.expires_at : row.expires_at.toISOString()) : null,
  };
}

export async function listGlaumLexicon(): Promise<{
  pool: string[];
  permanent: GlaumWordRow[];
  guest: GlaumWordRow[];
  hidden: string[];
}> {
  const sql = await getSql();
  try {
    await sql`update radio_glaum_words set hidden = true where hidden = false and permanent = false and expires_at is not null and expires_at <= now()`;
    const rows = await sql<Row>`
      select id, word, normalized, permanent, hidden, author_id, author_name, created_at, expires_at
      from radio_glaum_words
      order by permanent desc, id desc
    `;
    const mapped = rows.map(mapRow);
    const hidden = new Set(mapped.filter((row) => row.hidden).map((row) => row.normalized));
    const now = Date.now();
    const live = mapped.filter((row) => {
      if (row.hidden) return false;
      if (row.permanent) return true;
      if (!row.expiresAt) return false;
      return new Date(row.expiresAt).getTime() > now;
    });
    const defaults = GLAUM_DEFAULT_WORDS.filter((word) => !hidden.has(foldGlaum(word)));
    const extras = live.map((row) => row.word);
    const seen = new Set<string>();
    const pool: string[] = [];
    for (const word of [...defaults, ...extras]) {
      const key = foldGlaum(word);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      pool.push(word);
    }
    return {
      pool,
      permanent: live.filter((row) => row.permanent),
      guest: live.filter((row) => !row.permanent),
      hidden: [...hidden],
    };
  } catch {
    return { pool: [...GLAUM_DEFAULT_WORDS], permanent: [], guest: [], hidden: [] };
  }
}

export async function addGuestGlaumWord(user: RadioUser, raw: string) {
  const clean = cleanGuestWord(raw);
  if (!clean.ok) throw new Error(clean.error);
  const normalized = foldGlaum(clean.word);
  const sql = await getSql();
  const open = await sql<{ count: number }>`
    select count(*)::int as count from radio_glaum_words
    where hidden = false and permanent = false and author_id = ${user.id}
      and expires_at is not null and expires_at > now()
  `;
  if ((open[0]?.count ?? 0) >= 1) {
    throw new Error("You already have a lantern word floating this month.");
  }
  const clash = await sql<{ id: number }>`
    select id from radio_glaum_words where normalized = ${normalized} and hidden = false
      and (permanent = true or (expires_at is not null and expires_at > now()))
    limit 1
  `;
  if (clash[0]) throw new Error("That word already floats.");
  const expires = monthFromNow();
  const rows = await sql<Row>`
    insert into radio_glaum_words (word, normalized, permanent, hidden, author_id, author_name, expires_at)
    values (${clean.word}, ${normalized}, false, false, ${user.id}, ${user.name || user.email}, ${expires})
    returning id, word, normalized, permanent, hidden, author_id, author_name, created_at, expires_at
  `;
  return mapRow(rows[0]);
}

export async function addAdminGlaumWord(user: RadioUser, raw: string) {
  const clean = cleanAdminWord(raw);
  if (!clean.ok) throw new Error(clean.error);
  const normalized = foldGlaum(clean.word);
  const sql = await getSql();
  const existing = await sql<Row>`
    select id, word, normalized, permanent, hidden, author_id, author_name, created_at, expires_at
    from radio_glaum_words where normalized = ${normalized} order by id desc limit 1
  `;
  if (existing[0]) {
    const rows = await sql<Row>`
      update radio_glaum_words
      set word = ${clean.word}, permanent = true, hidden = false, expires_at = null,
          author_id = ${user.id}, author_name = ${user.email}
      where id = ${existing[0].id}
      returning id, word, normalized, permanent, hidden, author_id, author_name, created_at, expires_at
    `;
    return mapRow(rows[0]);
  }
  const rows = await sql<Row>`
    insert into radio_glaum_words (word, normalized, permanent, hidden, author_id, author_name, expires_at)
    values (${clean.word}, ${normalized}, true, false, ${user.id}, ${user.email}, null)
    returning id, word, normalized, permanent, hidden, author_id, author_name, created_at, expires_at
  `;
  return mapRow(rows[0]);
}

export async function hideGlaumWord(id: number) {
  const sql = await getSql();
  await sql`update radio_glaum_words set hidden = true where id = ${id}`;
}

export async function hideGlaumDefault(word: string) {
  const clean = cleanAdminWord(word);
  if (!clean.ok) throw new Error(clean.error);
  const normalized = foldGlaum(clean.word);
  const sql = await getSql();
  await sql`update radio_glaum_words set hidden = true where normalized = ${normalized}`;
  const left = await sql<{ id: number }>`select id from radio_glaum_words where normalized = ${normalized} limit 1`;
  if (!left[0]) {
    await sql`
      insert into radio_glaum_words (word, normalized, permanent, hidden, expires_at)
      values (${clean.word}, ${normalized}, true, true, null)
    `;
  }
}
