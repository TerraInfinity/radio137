import { r as getSql } from "./db-B_31co1Y.mjs";
import { l as r2KeyFromAudioUrl } from "./file-path-C0hfvhIH.mjs";
import { r as hideTrack, s as restoreTrack } from "./catalog-edits.server-KLXNzPRk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/review.server-Dl4_mnUk.js
function mapRow(row) {
	return {
		id: row.id,
		trackId: row.track_id,
		channelSlug: row.channel_slug,
		audioUrl: row.audio_url,
		title: row.title,
		artist: row.artist,
		r2Key: row.r2_key,
		coverUrl: row.cover_url,
		status: row.status,
		editorEmail: row.editor_email,
		createdAt: typeof row.created_at === "string" ? row.created_at : row.created_at.toISOString()
	};
}
async function listReviewQueue(status = "open") {
	const sql = await getSql();
	try {
		return (await sql`
      select id, track_id, channel_slug, audio_url, title, artist, r2_key, cover_url, status, editor_email, created_at
      from radio_review_queue
      where status = ${status}
      order by id desc
      limit 200
    `).map(mapRow);
	} catch {
		return [];
	}
}
async function countOpenReview() {
	const sql = await getSql();
	try {
		return (await sql`select count(*)::int as count from radio_review_queue where status = 'open'`)[0]?.count ?? 0;
	} catch {
		return 0;
	}
}
async function unallocateTrack(user, input) {
	const edit = await hideTrack(user, input.channelSlug, input.trackId, input.audioUrl ?? void 0);
	const sql = await getSql();
	const key = input.audioUrl ? r2KeyFromAudioUrl(input.audioUrl) : null;
	try {
		const open = await sql`
      select id from radio_review_queue
      where track_id = ${input.trackId} and channel_slug = ${input.channelSlug} and status = 'open'
      limit 1
    `;
		if (open[0]) await sql`
        update radio_review_queue
        set title = coalesce(${input.title ?? null}, title),
            artist = coalesce(${input.artist ?? null}, artist),
            audio_url = coalesce(${input.audioUrl ?? null}, audio_url),
            cover_url = coalesce(${input.coverUrl ?? null}, cover_url),
            r2_key = coalesce(${key}, r2_key),
            editor_id = ${user.id},
            editor_email = ${user.email},
            updated_at = now()
        where id = ${open[0].id}
      `;
		else await sql`
        insert into radio_review_queue (
          track_id, channel_slug, audio_url, title, artist, r2_key, cover_url, status, editor_id, editor_email
        ) values (
          ${input.trackId}, ${input.channelSlug}, ${input.audioUrl ?? null}, ${input.title ?? null},
          ${input.artist ?? null}, ${key}, ${input.coverUrl ?? null}, 'open', ${user.id}, ${user.email}
        )
      `;
	} catch (error) {
		const message = error instanceof Error ? error.message : "";
		if (!/radio_review_queue|does not exist/i.test(message)) throw error;
	}
	return edit;
}
async function setReviewStatus(id, status) {
	await (await getSql())`update radio_review_queue set status = ${status}, updated_at = now() where id = ${id}`;
}
async function restoreReviewItem(user, id) {
	const row = (await (await getSql())`
    select id, track_id, channel_slug, audio_url, title, artist, r2_key, cover_url, status, editor_email, created_at
    from radio_review_queue where id = ${id} limit 1
  `)[0];
	if (!row) throw new Error("Review item missing");
	await restoreTrack(user, row.channel_slug, row.track_id);
	await setReviewStatus(id, "restored");
	return mapRow(row);
}
async function getReviewItem(id) {
	const rows = await (await getSql())`
    select id, track_id, channel_slug, audio_url, title, artist, r2_key, cover_url, status, editor_email, created_at
    from radio_review_queue where id = ${id} limit 1
  `;
	return rows[0] ? mapRow(rows[0]) : null;
}
//#endregion
export { countOpenReview, getReviewItem, listReviewQueue, restoreReviewItem, setReviewStatus, unallocateTrack };
