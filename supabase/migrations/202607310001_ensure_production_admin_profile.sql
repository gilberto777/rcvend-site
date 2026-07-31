create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  whatsapp text,
  creci text,
  role text not null default 'agent' check (role in ('admin', 'agent', 'agency', 'developer', 'owner')),
  status text not null default 'pending' check (status in ('pending', 'active', 'suspended', 'rejected')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles read own" on public.profiles;
create policy "Profiles read own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

insert into public.profiles (id, full_name, email, role, status)
select
  id,
  'Gilberto Fernandes',
  email,
  'admin',
  'active'
from auth.users
where lower(email) = lower('gilbertof.corretor@gmail.com')
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  role = 'admin',
  status = 'active',
  updated_at = now();
