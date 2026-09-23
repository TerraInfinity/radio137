-- Guest lantern words expire after a month. Admin words can be permanent.
create table if not exists radio_glaum_words (
  id serial primary key,
  word text not null,
  normalized text not null,
  permanent boolean not null default false,
  hidden boolean not null default false,
  author_id text,
  author_name text,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);
create index if not exists radio_glaum_words_live_idx on radio_glaum_words (hidden, permanent, expires_at);
create unique index if not exists radio_glaum_words_norm_live_idx on radio_glaum_words (normalized) where hidden = false;
