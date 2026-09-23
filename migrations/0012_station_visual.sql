-- Motion art for station cards / heroes (mp4/webm) kept separate from still cover.
alter table if exists radio_station_edits
  add column if not exists animation_url text,
  add column if not exists video_url text;
