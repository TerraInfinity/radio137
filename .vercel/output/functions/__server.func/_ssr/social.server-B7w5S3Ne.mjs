import { r as getSql } from "./db-BsyRipWH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/social.server-B7w5S3Ne.js
async function listChat(channelSlug, limit = 40) {
	return (await (await getSql())`
    select id, channel_slug, author, body, created_at
    from radio_chat
    where channel_slug = ${channelSlug}
    order by id desc
    limit ${limit}
  `).slice().reverse().map((row) => ({
		id: Number(row.id),
		channelSlug: row.channel_slug,
		author: row.author,
		body: row.body,
		createdAt: typeof row.created_at === "string" ? row.created_at : row.created_at.toISOString()
	}));
}
async function insertChat(channelSlug, author, body, userId) {
	return (await (await getSql())`
    insert into radio_chat (channel_slug, author, body, user_id)
    values (${channelSlug}, ${author}, ${body}, ${userId})
    returning id
  `)[0]?.id ?? 0;
}
async function bumpView(trackId) {
	const rows = await (await getSql())`
    insert into radio_track_stats (track_id, views, likes, updated_at)
    values (${trackId}, 1, 0, now())
    on conflict (track_id) do update set views = radio_track_stats.views + 1, updated_at = now()
    returning track_id, views, likes
  `;
	return {
		trackId: rows[0].track_id,
		views: Number(rows[0].views),
		likes: Number(rows[0].likes)
	};
}
async function bumpLike(trackId, liked) {
	const rows = await (await getSql())`
    insert into radio_track_stats (track_id, views, likes, updated_at)
    values (${trackId}, 0, ${liked ? 1 : 0}, now())
    on conflict (track_id) do update set
      likes = greatest(0, radio_track_stats.likes + ${liked ? 1 : -1}),
      updated_at = now()
    returning track_id, views, likes
  `;
	return {
		trackId: rows[0].track_id,
		views: Number(rows[0].views),
		likes: Number(rows[0].likes)
	};
}
async function listFavorites(userId) {
	return (await (await getSql())`
    select track_id from radio_favorites where user_id = ${userId} order by created_at desc
  `).map((row) => row.track_id);
}
async function toggleFavorite(userId, trackId) {
	const sql = await getSql();
	if ((await sql`
    select track_id from radio_favorites where user_id = ${userId} and track_id = ${trackId}
  `).length) await sql`delete from radio_favorites where user_id = ${userId} and track_id = ${trackId}`;
	else await sql`insert into radio_favorites (user_id, track_id) values (${userId}, ${trackId})`;
	return listFavorites(userId);
}
//#endregion
export { bumpLike, bumpView, insertChat, listChat, listFavorites, toggleFavorite };
