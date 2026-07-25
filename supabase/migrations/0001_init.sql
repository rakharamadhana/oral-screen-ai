-- Oral Screen AI — initial schema
-- Tables backing the scan history (Riwayat) and user profile (Profil).
--
-- RLS is enabled with permissive demo policies (single-user / anon) so the
-- client anon key works out of the box. TODO: once Supabase Auth is added,
-- replace these with policies scoped to auth.uid().

create extension if not exists "pgcrypto";

-- ---------- profiles ----------
create table if not exists public.profiles (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  email         text,
  medical_id    text,
  phone         text,
  birth_date    text,
  member_since  text,
  avatar_url    text,
  verified      boolean not null default false,
  notifications jsonb not null default '{"exams":true,"education":true,"updates":false}'::jsonb,
  created_at    timestamptz not null default now()
);

-- ---------- scans ----------
create table if not exists public.scans (
  id              uuid primary key default gen_random_uuid(),
  ref_code        text not null,
  created_at      timestamptz not null default now(),
  risk_level      text not null check (risk_level in ('Rendah', 'Sedang', 'Tinggi')),
  top_probability numeric not null default 0,
  region_results  jsonb not null default '[]'::jsonb,
  thumbnail       text
);

create index if not exists scans_created_at_idx on public.scans (created_at desc);

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.scans enable row level security;

-- Demo policies: allow anon read/write. Tighten to auth.uid() with real auth.
drop policy if exists "demo_all_profiles" on public.profiles;
create policy "demo_all_profiles" on public.profiles
  for all using (true) with check (true);

drop policy if exists "demo_all_scans" on public.scans;
create policy "demo_all_scans" on public.scans
  for all using (true) with check (true);
