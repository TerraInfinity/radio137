-- Admin unallocate holding area. Hidden on origin station; R2 untouched.
create table if not exists radio_review_queue (
  id serial primary key,
  track_id text not null,
  channel_slug text not null,
  audio_url text,
  title text,
  artist text,
  r2_key text,
  cover_url text,
  status text not null default 'open',
  editor_id text,
  editor_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists radio_review_open_idx on radio_review_queue (status, id desc);
