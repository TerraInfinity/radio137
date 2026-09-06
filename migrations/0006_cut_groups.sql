-- Directory identity: many station copies (and R2 folders) can point at one cut.
-- Files are never deleted by a merge.
create table if not exists radio_cut_members (
  member_id text primary key,
  canonical_id text not null,
  editor_id text not null,
  editor_email text not null,
  updated_at timestamptz not null default now()
);
create index if not exists radio_cut_members_canonical_idx on radio_cut_members (canonical_id);
