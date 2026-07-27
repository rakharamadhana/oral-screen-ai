-- Make profiles and scans per-user, tied to Supabase Auth (auth.users).
--
-- Before this, the app was single-user/demo: one seeded "Andi Setiawan" profile
-- row and unowned scans, surfaced to EVERY logged-in user via `.limit(1)` reads
-- and permissive (`using (true)`) RLS. This migration makes the data per-account:
--   * removes the demo seed rows (the demo persona now lives client-side only,
--     used by the offline demo account),
--   * links profiles.id -> auth.users.id and scans.user_id -> auth.users.id,
--   * auto-creates a profile row on signup (handle_new_user trigger),
--   * backfills profiles for users who registered before the trigger existed,
--   * replaces permissive RLS with auth.uid()-scoped policies.

-- 1. Drop demo seed data (unowned). Safe: no rows are tied to a real account yet.
delete from public.scans;
delete from public.profiles where id = '00000000-0000-0000-0000-000000000001';

-- 2. Link a profile's primary key to its auth user.
alter table public.profiles
  add constraint profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade;

-- 3. Give scans an owner. Default to the caller so client inserts can omit it,
--    and cascade-delete a user's scans when the account is removed.
alter table public.scans
  add column if not exists user_id uuid references auth.users (id) on delete cascade;
delete from public.scans where user_id is null; -- defensive; table already emptied above
alter table public.scans alter column user_id set not null;
alter table public.scans alter column user_id set default auth.uid();
create index if not exists scans_user_id_created_at_idx on public.scans (user_id, created_at desc);

-- 4. Create a profile row automatically whenever a new auth user signs up.
--    security definer so it can write past RLS during the auth transaction.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, medical_id, member_since, verified)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      split_part(new.email, '@', 1)
    ),
    new.email,
    'OSA-' || upper(substr(replace(new.id::text, '-', ''), 1, 6)),
    to_char(now(), 'Mon YYYY'),
    (new.email_confirmed_at is not null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Backfill profiles for users who registered before the trigger existed.
insert into public.profiles (id, full_name, email, medical_id, member_since, verified)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data ->> 'display_name', ''),
    nullif(u.raw_user_meta_data ->> 'full_name', ''),
    split_part(u.email, '@', 1)
  ),
  u.email,
  'OSA-' || upper(substr(replace(u.id::text, '-', ''), 1, 6)),
  to_char(now(), 'Mon YYYY'),
  (u.email_confirmed_at is not null)
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 6. Replace permissive demo RLS with owner-scoped policies.
drop policy if exists "demo_all_profiles" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "demo_all_scans" on public.scans;
create policy "scans_select_own" on public.scans
  for select using (auth.uid() = user_id);
create policy "scans_insert_own" on public.scans
  for insert with check (auth.uid() = user_id);
create policy "scans_delete_own" on public.scans
  for delete using (auth.uid() = user_id);
