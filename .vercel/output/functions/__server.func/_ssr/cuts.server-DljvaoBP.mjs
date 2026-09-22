import { r as getSql } from "./db-B_31co1Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cuts.server-DljvaoBP.js
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
	const { hideSameStationMergedCopies } = await import("./catalog-edits.server-KLXNzPRk.mjs").then((n) => n.n);
	await hideSameStationMergedCopies(user, canonicalId, ids);
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
async function listCutSkips() {
	const sql = await getSql();
	try {
		return (await sql`select pair_key, left_id, right_id from radio_cut_skips`).map((row) => row.pair_key);
	} catch {
		return [];
	}
}
async function skipCutPairs(user, memberIds) {
	const sql = await getSql();
	const { clusterSkipKeys } = await import("./similar-cuts-BE0d4_OA.mjs").then((n) => n.r).then((n) => n.r);
	const keys = clusterSkipKeys(memberIds);
	for (const key of keys) {
		const [left, right] = key.split("|");
		if (!left || !right) continue;
		await sql`
      insert into radio_cut_skips (pair_key, left_id, right_id, editor_id, editor_email, created_at)
      values (${key}, ${left}, ${right}, ${user.id}, ${user.email}, now())
      on conflict (pair_key) do nothing
    `;
	}
	return listCutSkips();
}
//#endregion
export { dissolveCut, listCutGroups, listCutSkips, mergeCutClusters, mergeCuts, skipCutPairs, unmergeCut };
