-- Station chat, likes/views, favorites, listener points.
create table if not exists radio_chat (
  id serial primary key,
  channel_slug text not null,
  author text not null,
  body text not null,
  user_id text,
  created_at timestamptz not null default now()
);
create index if not exists radio_chat_slug_idx on radio_chat (channel_slug, id desc);

create table if not exists radio_track_stats (
  track_id text primary key,
  views integer not null default 0,
  likes integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists radio_favorites (
  user_id text not null,
  track_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

create table if not exists radio_listener_stats (
  user_id text primary key,
  points integer not null default 0,
  glaumules integer not null default 0,
  updated_at timestamptz not null default now()
);
