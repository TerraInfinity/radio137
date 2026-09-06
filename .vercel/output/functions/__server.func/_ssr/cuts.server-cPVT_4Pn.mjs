import { r as getSql } from "./db-BsyRipWH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cuts.server-cPVT_4Pn.js
async function listCutGroups() {
	const sql = await getSql();
	try {
		const rows = await sql`select member_id, canonical_id from radio_cut_members`;
		const bags = /* @__PURE__ */ new Map();
		for (const row of rows) {
			const list = bags.get(row.canonical_id) ?? [];
			list.push(row.member_id);
			bags.set(row.canonical_id, list);
		}
		return [...bags.entries()].map(([canonicalId, memberIds]) => ({
			canonicalId,
			memberIds: [.../* @__PURE__ */ new Set([canonicalId, ...memberIds])]
		}));
	} catch {
		return [];
	}
}
async function relatedIds(ids) {
	const sql = await getSql();
	const all = new Set(ids);
	const rows = await sql`select member_id, canonical_id from radio_cut_members`;
	let growing = true;
	while (growing) {
		growing = false;
		for (const row of rows) if (all.has(row.member_id) || all.has(row.canonical_id)) {
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
	return [...all];
}
async function mergeCuts(user, canonicalId, memberIds) {
	const sql = await getSql();
	const ids = await relatedIds([canonicalId, ...memberIds.filter(Boolean)]);
	for (const id of ids) await sql`
      insert into radio_cut_members (member_id, canonical_id, editor_id, editor_email, updated_at)
      values (${id}, ${canonicalId}, ${user.id}, ${user.email}, now())
      on conflict (member_id) do update set
        canonical_id = excluded.canonical_id,
        editor_id = excluded.editor_id,
        editor_email = excluded.editor_email,
        updated_at = now()
    `;
	return listCutGroups();
}
async function mergeCutClusters(user, clusters) {
	for (const cluster of clusters) await mergeCuts(user, cluster.canonicalId, cluster.memberIds);
	return listCutGroups();
}
async function unmergeCut(user, memberId) {
	const sql = await getSql();
	const rows = await sql`select member_id, canonical_id from radio_cut_members where member_id = ${memberId} or canonical_id = ${memberId}`;
	const canonical = rows.find((row) => row.member_id === memberId)?.canonical_id ?? memberId;
	await sql`delete from radio_cut_members where member_id = ${memberId}`;
	if (canonical === memberId) {
		const leftover = rows.map((row) => row.member_id).filter((id) => id !== memberId);
		const next = leftover[0];
		if (next) for (const id of leftover) await sql`
          insert into radio_cut_members (member_id, canonical_id, editor_id, editor_email, updated_at)
          values (${id}, ${next}, ${user.id}, ${user.email}, now())
          on conflict (member_id) do update set
            canonical_id = excluded.canonical_id,
            editor_id = excluded.editor_id,
            editor_email = excluded.editor_email,
            updated_at = now()
        `;
	}
	return listCutGroups();
}
async function dissolveCut(canonicalId) {
	await (await getSql())`delete from radio_cut_members where canonical_id = ${canonicalId} or member_id = ${canonicalId}`;
	return listCutGroups();
}
//#endregion
export { dissolveCut, listCutGroups, mergeCutClusters, mergeCuts, unmergeCut };
