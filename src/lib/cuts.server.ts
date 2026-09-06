import { getSql } from "@/lib/db";
import type { CutGroup } from "@/lib/cuts";
import type { RadioUser } from "@/lib/sso.server";

type Row = { member_id: string; canonical_id: string };

export async function listCutGroups(): Promise<CutGroup[]> {
  const sql = await getSql();
  try {
    const rows = await sql<Row>`select member_id, canonical_id from radio_cut_members`;
    const bags = new Map<string, string[]>();
    for (const row of rows) {
      const list = bags.get(row.canonical_id) ?? [];
      list.push(row.member_id);
      bags.set(row.canonical_id, list);
    }
    return [...bags.entries()].map(([canonicalId, memberIds]) => ({
      canonicalId,
      memberIds: [...new Set([canonicalId, ...memberIds])],
    }));
  } catch {
    return [];
  }
}

async function relatedIds(ids: string[]): Promise<string[]> {
  const sql = await getSql();
  const all = new Set(ids);
  const rows = await sql<Row>`select member_id, canonical_id from radio_cut_members`;
  let growing = true;
  while (growing) {
    growing = false;
    for (const row of rows) {
      if (all.has(row.member_id) || all.has(row.canonical_id)) {
        if (!all.has(row.member_id)) {
          all.add(row.member_id);
          growing = true;
        }
        if (!all.has(row.canonical_id)) {
          all.add(row.canonical_id);
          growing = true;
        }
      }
    }
  }
  return [...all];
}

export async function mergeCuts(user: RadioUser, canonicalId: string, memberIds: string[]): Promise<CutGroup[]> {
  const sql = await getSql();
  const ids = await relatedIds([canonicalId, ...memberIds.filter(Boolean)]);
  for (const id of ids) {
    await sql`
      insert into radio_cut_members (member_id, canonical_id, editor_id, editor_email, updated_at)
      values (${id}, ${canonicalId}, ${user.id}, ${user.email}, now())
      on conflict (member_id) do update set
        canonical_id = excluded.canonical_id,
        editor_id = excluded.editor_id,
        editor_email = excluded.editor_email,
        updated_at = now()
    `;
  }
  return listCutGroups();
}

export async function mergeCutClusters(
  user: RadioUser,
  clusters: Array<{ canonicalId: string; memberIds: string[] }>,
): Promise<CutGroup[]> {
  for (const cluster of clusters) {
    await mergeCuts(user, cluster.canonicalId, cluster.memberIds);
  }
  return listCutGroups();
}

export async function unmergeCut(user: RadioUser, memberId: string): Promise<CutGroup[]> {
  const sql = await getSql();
  const rows = await sql<Row>`select member_id, canonical_id from radio_cut_members where member_id = ${memberId} or canonical_id = ${memberId}`;
  const canonical = rows.find((row) => row.member_id === memberId)?.canonical_id ?? memberId;
  await sql`delete from radio_cut_members where member_id = ${memberId}`;
  if (canonical === memberId) {
    const leftover = rows.map((row) => row.member_id).filter((id) => id !== memberId);
    const next = leftover[0];
    if (next) {
      for (const id of leftover) {
        await sql`
          insert into radio_cut_members (member_id, canonical_id, editor_id, editor_email, updated_at)
          values (${id}, ${next}, ${user.id}, ${user.email}, now())
          on conflict (member_id) do update set
            canonical_id = excluded.canonical_id,
            editor_id = excluded.editor_id,
            editor_email = excluded.editor_email,
            updated_at = now()
        `;
      }
    }
  }
  return listCutGroups();
}

export async function dissolveCut(canonicalId: string): Promise<CutGroup[]> {
  const sql = await getSql();
  await sql`delete from radio_cut_members where canonical_id = ${canonicalId} or member_id = ${canonicalId}`;
  return listCutGroups();
}
