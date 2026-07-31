begin;

alter table public.properties
  add column if not exists id uuid not null default gen_random_uuid(),
  add column if not exists organization_id uuid,
  add column if not exists agent_id uuid,
  add column if not exists developer_id uuid,
  add column if not exists neighborhood_id uuid,
  add column if not exists purpose text,
  add column if not exists property_stage text,
  add column if not exists approval_status text,
  add column if not exists condo_fee numeric(14, 2),
  add column if not exists iptu numeric(14, 2),
  add column if not exists address_number text,
  add column if not exists complement text,
  add column if not exists neighborhood_name text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists latitude numeric(10, 7),
  add column if not exists longitude numeric(10, 7),
  add column if not exists cover_image text,
  add column if not exists characteristics text[] not null default '{}',
  add column if not exists is_featured boolean not null default false,
  add column if not exists is_active boolean not null default true,
  add column if not exists tour_url text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.properties'::regclass
      and conname = 'properties_id_key'
  ) then
    alter table public.properties add constraint properties_id_key unique (id);
  end if;
end
$$;

update public.properties p
set
  purpose = coalesce(p.purpose, case when p.business_type = 'rent' then 'rent' else 'sale' end),
  property_stage = coalesce(
    p.property_stage,
    case when p.property_status = 'construction' then 'under_construction' else 'ready' end
  ),
  approval_status = coalesce(p.approval_status, 'approved'),
  neighborhood_name = coalesce(nullif(p.neighborhood_name, ''), p.neighborhood, 'Não informado'),
  city = coalesce(nullif(p.city, ''), nullif(p.location, ''), 'São Paulo'),
  state = coalesce(nullif(p.state, ''), 'SP'),
  latitude = coalesce(p.latitude, p.lat),
  longitude = coalesce(p.longitude, p.lng),
  is_featured = coalesce(p.is_featured, p.featured, false),
  is_active = case when p.status = 'inactive' then false else coalesce(p.is_active, true) end,
  tour_url = coalesce(nullif(p.tour_url, ''), nullif(p.virtual_tour_url, '')),
  cover_image = coalesce(
    nullif(p.cover_image, ''),
    case
      when jsonb_typeof(p.images) = 'array' and jsonb_array_length(p.images) > 0
      then 'https://pryjdlxncqfrotgvxhwj.supabase.co/storage/v1/object/public/property-images/' || (p.images ->> 0)
      else null
    end
  ),
  characteristics = case
    when cardinality(p.characteristics) > 0 then p.characteristics
    when jsonb_typeof(p.amenities) = 'array' then array(select jsonb_array_elements_text(p.amenities))
    else '{}'
  end;

update public.properties
set status = case
  when status = 'active' then 'available'
  when status in ('available', 'reserved', 'sold', 'rented', 'inactive') then status
  else 'inactive'
end;

alter table public.properties
  alter column purpose set default 'sale',
  alter column purpose set not null,
  alter column property_stage set default 'ready',
  alter column property_stage set not null,
  alter column approval_status set default 'approved',
  alter column approval_status set not null,
  alter column neighborhood_name set not null,
  alter column city set default 'São Paulo',
  alter column city set not null,
  alter column state set default 'SP',
  alter column state set not null;

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  image_url text not null,
  storage_path text,
  alt_text text,
  order_index int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists property_images_property_order_idx
  on public.property_images (property_id, order_index);

insert into public.property_images (property_id, image_url, storage_path, alt_text, order_index, is_cover)
select
  p.id,
  case
    when image.value ~ '^https?://' then image.value
    else 'https://pryjdlxncqfrotgvxhwj.supabase.co/storage/v1/object/public/property-images/' || image.value
  end,
  image.value,
  p.title,
  image.ordinality::int - 1,
  image.ordinality = 1
from public.properties p
cross join lateral jsonb_array_elements_text(
  case when jsonb_typeof(p.images) = 'array' then p.images else '[]'::jsonb end
) with ordinality as image(value, ordinality)
on conflict (property_id, order_index) do nothing;

create table if not exists public.property_floor_plans (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  image_url text not null,
  storage_path text,
  title text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists property_floor_plans_property_order_idx
  on public.property_floor_plans (property_id, order_index);

insert into public.property_floor_plans (property_id, image_url, storage_path, title, order_index)
select
  p.id,
  case
    when plan.value ~ '^https?://' then plan.value
    else 'https://pryjdlxncqfrotgvxhwj.supabase.co/storage/v1/object/public/property-images/' || plan.value
  end,
  plan.value,
  'Planta ' || plan.ordinality,
  plan.ordinality::int - 1
from public.properties p
cross join lateral jsonb_array_elements_text(
  case
    when jsonb_typeof(p.floor_plans) = 'array' and jsonb_array_length(p.floor_plans) > 0 then p.floor_plans
    when jsonb_typeof(p.plans_urls) = 'array' then p.plans_urls
    else '[]'::jsonb
  end
) with ordinality as plan(value, ordinality)
on conflict (property_id, order_index) do nothing;

create table if not exists public.property_features (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  icon text,
  created_at timestamptz not null default now(),
  unique (property_id, name)
);

insert into public.property_features (property_id, name)
select p.id, feature.value
from public.properties p
cross join lateral jsonb_array_elements_text(
  case when jsonb_typeof(p.amenities) = 'array' then p.amenities else '[]'::jsonb end
) as feature(value)
on conflict (property_id, name) do nothing;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  organization_id uuid,
  agent_id uuid,
  full_name text not null,
  email text,
  phone text,
  whatsapp text,
  message text,
  source text not null default 'site',
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'active'
  )
$$;

alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.property_floor_plans enable row level security;
alter table public.property_features enable row level security;
alter table public.leads enable row level security;

drop policy if exists "RCVend public reads approved properties" on public.properties;
create policy "RCVend public reads approved properties" on public.properties
for select using (is_active = true and approval_status = 'approved' and status <> 'inactive');

drop policy if exists "RCVend admins manage properties" on public.properties;
create policy "RCVend admins manage properties" on public.properties
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "RCVend public reads property images" on public.property_images;
create policy "RCVend public reads property images" on public.property_images for select using (true);
drop policy if exists "RCVend admins manage property images" on public.property_images;
create policy "RCVend admins manage property images" on public.property_images
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "RCVend public reads floor plans" on public.property_floor_plans;
create policy "RCVend public reads floor plans" on public.property_floor_plans for select using (true);
drop policy if exists "RCVend admins manage floor plans" on public.property_floor_plans;
create policy "RCVend admins manage floor plans" on public.property_floor_plans
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "RCVend public reads property features" on public.property_features;
create policy "RCVend public reads property features" on public.property_features for select using (true);
drop policy if exists "RCVend admins manage property features" on public.property_features;
create policy "RCVend admins manage property features" on public.property_features
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "RCVend visitors create leads" on public.leads;
create policy "RCVend visitors create leads" on public.leads
for insert to anon, authenticated with check (true);
drop policy if exists "RCVend admins manage leads" on public.leads;
create policy "RCVend admins manage leads" on public.leads
for all to authenticated using (public.is_admin()) with check (public.is_admin());

notify pgrst, 'reload schema';

commit;
