-- Public URL ending + root aliases for stations (same idea as radio_track_edits).
alter table if exists radio_station_edits
  add column if not exists public_slug text,
  add column if not exists aliases text;
