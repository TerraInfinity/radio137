import { r as getSql } from "./db-B_31co1Y.mjs";
import { a as glaumKey, c as monthFromNow, i as foldGlaum, n as cleanAdminWord, r as cleanGuestWord, t as GLAUM_DEFAULT_WORDS } from "./glaum-words-DJcoXeXq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/glaum-words.server-DPLPKuaM.js
function mapRow(row) {
	return {
		id: row.id,
		word: row.word,
		normalized: row.normalized,
		permanent: Boolean(row.permanent),
		hidden: Boolean(row.hidden),
		authorId: row.author_id,
		authorName: row.author_name,
		createdAt: typeof row.created_at === "string" ? row.created_at : row.created_at.toISOString(),
		expiresAt: row.expires_at ? typeof row.expires_at === "string" ? row.expires_at : row.expires_at.toISOString() : null
	};
}
async function listGlaumLexicon() {
	const sql = await getSql();
	try {
		await sql`update radio_glaum_words set hidden = true where hidden = false and permanent = false and expires_at is not null and expires_at <= now()`;
		const mapped = (await sql`
      select id, word, normalized, permanent, hidden, author_id, author_name, created_at, expires_at
      from radio_glaum_words
      order by permanent desc, id desc
    `).map(mapRow);
		const hidden = new Set(mapped.filter((row) => row.hidden).flatMap((row) => [row.normalized, foldGlaum(row.word)].filter(Boolean)));
		const now = Date.now();
		const live = mapped.filter((row) => {
			if (row.hidden) return false;
			if (row.permanent) return true;
			if (!row.expiresAt) return false;
			return new Date(row.expiresAt).getTime() > now;
		});
		const defaults = GLAUM_DEFAULT_WORDS.filter((word) => !hidden.has(glaumKey(word)) && !hidden.has(foldGlaum(word)));
		const extras = live.map((row) => row.word);
		const seen = /* @__PURE__ */ new Set();
		const pool = [];
		for (const word of [...defaults, ...extras]) {
			const key = glaumKey(word);
			const letters = foldGlaum(word);
			if (!key || seen.has(key) || letters && seen.has(`#${letters}`)) continue;
			seen.add(key);
			if (letters) seen.add(`#${letters}`);
			pool.push(word);
		}
		return {
			pool,
			permanent: live.filter((row) => row.permanent),
			guest: live.filter((row) => !row.permanent),
			hidden: [...hidden]
		};
	} catch {
		return {
			pool: [...GLAUM_DEFAULT_WORDS],
			permanent: [],
			guest: [],
			hidden: []
		};
	}
}
async function addGuestGlaumWord(user, raw) {
	const clean = cleanGuestWord(raw);
	if (!clean.ok) throw new Error(clean.error);
	const normalized = glaumKey(clean.word);
	const letters = foldGlaum(clean.word);
	const sql = await getSql();
	if (((await sql`
    select count(*)::int as count from radio_glaum_words
    where hidden = false and permanent = false and author_id = ${user.id}
      and expires_at is not null and expires_at > now()
  `)[0]?.count ?? 0) >= 1) throw new Error("You already have a lantern word floating this month.");
	if ((await sql`
    select id, word from radio_glaum_words where hidden = false
      and (permanent = true or (expires_at is not null and expires_at > now()))
  `).some((row) => glaumKey(row.word) === normalized || letters && foldGlaum(row.word) === letters)) throw new Error("That word already floats.");
	const expires = monthFromNow();
	return mapRow((await sql`
    insert into radio_glaum_words (word, normalized, permanent, hidden, author_id, author_name, expires_at)
    values (${clean.word}, ${normalized}, false, false, ${user.id}, ${user.name || user.email}, ${expires})
    returning id, word, normalized, permanent, hidden, author_id, author_name, created_at, expires_at
  `)[0]);
}
async function addAdminGlaumWord(user, raw) {
	const clean = cleanAdminWord(raw);
	if (!clean.ok) throw new Error(clean.error);
	const normalized = glaumKey(clean.word);
	const sql = await getSql();
	const existing = await sql`
    select id, word, normalized, permanent, hidden, author_id, author_name, created_at, expires_at
    from radio_glaum_words where normalized = ${normalized} or word = ${clean.word} order by id desc limit 1
  `;
	if (existing[0]) return mapRow((await sql`
      update radio_glaum_words
      set word = ${clean.word}, permanent = true, hidden = false, expires_at = null,
          author_id = ${user.id}, author_name = ${user.email}
      where id = ${existing[0].id}
      returning id, word, normalized, permanent, hidden, author_id, author_name, created_at, expires_at
    `)[0]);
	return mapRow((await sql`
    insert into radio_glaum_words (word, normalized, permanent, hidden, author_id, author_name, expires_at)
    values (${clean.word}, ${normalized}, true, false, ${user.id}, ${user.email}, null)
    returning id, word, normalized, permanent, hidden, author_id, author_name, created_at, expires_at
  `)[0]);
}
async function hideGlaumWord(id) {
	await (await getSql())`update radio_glaum_words set hidden = true where id = ${id}`;
}
async function hideGlaumDefault(word) {
	const clean = cleanAdminWord(word);
	if (!clean.ok) throw new Error(clean.error);
	const normalized = glaumKey(clean.word);
	const sql = await getSql();
	await sql`update radio_glaum_words set hidden = true where normalized = ${normalized} or word = ${clean.word}`;
	if (!(await sql`select id from radio_glaum_words where normalized = ${normalized} limit 1`)[0]) await sql`
      insert into radio_glaum_words (word, normalized, permanent, hidden, expires_at)
      values (${clean.word}, ${normalized}, true, true, null)
    `;
}
//#endregion
export { addAdminGlaumWord, addGuestGlaumWord, hideGlaumDefault, hideGlaumWord, listGlaumLexicon };
