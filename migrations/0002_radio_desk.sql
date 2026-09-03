-- Station playlist edits (C desk). Catalog JSON is the seed; these tables overlay it.
create table if not exists radio_track_edits (
  id serial primary key,
  channel_slug text not null,
  track_id text not null,
  hidden boolean not null default false,
  deleted_r2 boolean not null default false,
  added boolean not null default false,
  sort_order integer,
  title text,
  artist text,
  duration_sec integer,
  audio_url text,
  cover_url text,
  r2_key text,
  r2_bucket text,
  editor_id text not null,
  editor_email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (channel_slug, track_id)
);
create index if not exists radio_track_edits_slug_idx on radio_track_edits (channel_slug);

create table if not exists radio_station_edits (
  slug text primary key,
  added boolean not null default false,
  hidden boolean not null default false,
  name text,
  description text,
  energy text,
  category text,
  cover text,
  kind text,
  mode text,
  featured boolean,
  featured_rank integer,
  enabled boolean,
  nsfw boolean,
  tags text,
  editor_id text not null,
  editor_email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
