import { getSql } from "@/lib/db";

export type ChatMessage = {
  id: number;
  channelSlug: string;
  author: string;
  body: string;
  createdAt: string;
};

export type TrackStats = { trackId: string; views: number; likes: number };

export async function listChat(channelSlug: string, limit = 40): Promise<ChatMessage[]> {
  const sql = await getSql();
  const rows = await sql<{
    id: number;
    channel_slug: string;
    author: string;
    body: string;
    created_at: string | Date;
  }>`
    select id, channel_slug, author, body, created_at
    from radio_chat
    where channel_slug = ${channelSlug}
    order by id desc
    limit ${limit}
  `;
  return rows
    .slice()
    .reverse()
    .map((row) => ({
      id: Number(row.id),
      channelSlug: row.channel_slug,
      author: row.author,
      body: row.body,
      createdAt: typeof row.created_at === "string" ? row.created_at : row.created_at.toISOString(),
    }));
}

export async function insertChat(channelSlug: string, author: string, body: string, userId: string | null) {
  const sql = await getSql();
  const rows = await sql<{ id: number }>`
    insert into radio_chat (channel_slug, author, body, user_id)
    values (${channelSlug}, ${author}, ${body}, ${userId})
    returning id
  `;
  return rows[0]?.id ?? 0;
}

export async function bumpView(trackId: string): Promise<TrackStats> {
  const sql = await getSql();
  const rows = await sql<{ track_id: string; views: number; likes: number }>`
    insert into radio_track_stats (track_id, views, likes, updated_at)
    values (${trackId}, 1, 0, now())
    on conflict (track_id) do update set views = radio_track_stats.views + 1, updated_at = now()
    returning track_id, views, likes
  `;
  return { trackId: rows[0].track_id, views: Number(rows[0].views), likes: Number(rows[0].likes) };
}

export async function bumpLike(trackId: string, liked: boolean): Promise<TrackStats> {
  const sql = await getSql();
  const delta = liked ? 1 : -1;
  const rows = await sql<{ track_id: string; views: number; likes: number }>`
    insert into radio_track_stats (track_id, views, likes, updated_at)
    values (${trackId}, 0, ${liked ? 1 : 0}, now())
    on conflict (track_id) do update set
      likes = greatest(0, radio_track_stats.likes + ${delta}),
      updated_at = now()
    returning track_id, views, likes
  `;
  return { trackId: rows[0].track_id, views: Number(rows[0].views), likes: Number(rows[0].likes) };
}

export async function listFavorites(userId: string): Promise<string[]> {
  const sql = await getSql();
  const rows = await sql<{ track_id: string }>`
    select track_id from radio_favorites where user_id = ${userId} order by created_at desc
  `;
  return rows.map((row) => row.track_id);
}

export async function toggleFavorite(userId: string, trackId: string): Promise<string[]> {
  const sql = await getSql();
  const existing = await sql<{ track_id: string }>`
    select track_id from radio_favorites where user_id = ${userId} and track_id = ${trackId}
  `;
  if (existing.length) {
    await sql`delete from radio_favorites where user_id = ${userId} and track_id = ${trackId}`;
  } else {
    await sql`insert into radio_favorites (user_id, track_id) values (${userId}, ${trackId})`;
  }
  return listFavorites(userId);
}
