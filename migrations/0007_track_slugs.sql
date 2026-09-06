-- Public song URL + extra endings. Display title and R2 key stay their own fields.
alter table if exists radio_track_edits
  add column if not exists slug text,
  add column if not exists aliases text;
