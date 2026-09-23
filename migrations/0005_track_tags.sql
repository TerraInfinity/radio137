-- Per-cut tags so songs are searchable on their own.
alter table if exists radio_track_edits
  add column if not exists tags text;
