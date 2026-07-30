create table if not exists public.promotional_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  mobile_image_url text,
  image_storage_path text,
  mobile_image_storage_path text,
  alt_text text not null,
  link_url text not null default '/',
  sort_order integer not null default 0 check (sort_order >= 0),
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promotional_banners_valid_period check (
    starts_at is null or ends_at is null or starts_at < ends_at
  )
);

drop trigger if exists promotional_banners_set_updated_at on public.promotional_banners;
create trigger promotional_banners_set_updated_at
before update on public.promotional_banners
for each row execute function public.set_updated_at();

create index if not exists promotional_banners_publication_idx
on public.promotional_banners (is_active, sort_order, starts_at, ends_at);

alter table public.promotional_banners enable row level security;

drop policy if exists "Public read active promotional banners" on public.promotional_banners;
create policy "Public read active promotional banners"
on public.promotional_banners
for select
using (
  is_active = true
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

drop policy if exists "Admins manage promotional banners" on public.promotional_banners;
create policy "Admins manage promotional banners"
on public.promotional_banners
for all
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('promotional-banners', 'promotional-banners', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read promotional banner files" on storage.objects;
create policy "Public read promotional banner files"
on storage.objects
for select
using (bucket_id = 'promotional-banners');

drop policy if exists "Admins upload promotional banner files" on storage.objects;
create policy "Admins upload promotional banner files"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'promotional-banners' and public.is_admin());

drop policy if exists "Admins update promotional banner files" on storage.objects;
create policy "Admins update promotional banner files"
on storage.objects
for update
to authenticated
using (bucket_id = 'promotional-banners' and public.is_admin())
with check (bucket_id = 'promotional-banners' and public.is_admin());

drop policy if exists "Admins delete promotional banner files" on storage.objects;
create policy "Admins delete promotional banner files"
on storage.objects
for delete
to authenticated
using (bucket_id = 'promotional-banners' and public.is_admin());

insert into public.promotional_banners (
  id,
  title,
  image_url,
  alt_text,
  link_url,
  sort_order,
  is_active
)
values (
  '70000000-0000-0000-0000-000000000001',
  'Lançamento exclusivo em São Paulo',
  '/banners/lancamento-exclusivo-sao-paulo.png',
  'Lançamento exclusivo em São Paulo com apartamentos a partir de R$ 299.900',
  '/imoveis?purpose=launch',
  0,
  true
)
on conflict (id) do update
set title = excluded.title,
    image_url = excluded.image_url,
    alt_text = excluded.alt_text,
    link_url = excluded.link_url,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active;
