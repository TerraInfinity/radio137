-- Admin skip list: similar-song pairs marked as not the same stay hidden.
create table if not exists radio_cut_skips (
  pair_key text primary key,
  left_id text not null,
  right_id text not null,
  editor_id text not null,
  editor_email text not null,
  created_at timestamptz not null default now()
);
create index if not exists radio_cut_skips_left_idx on radio_cut_skips (left_id);
create index if not exists radio_cut_skips_right_idx on radio_cut_skips (right_id);
