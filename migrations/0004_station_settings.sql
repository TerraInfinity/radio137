-- Shuffle + claimable overlays for C station settings.
-- Single statement so Neon pooled connections can apply it during `npm run build`.
alter table if exists radio_station_edits
  add column if not exists shuffle text,
  add column if not exists claimable boolean;
