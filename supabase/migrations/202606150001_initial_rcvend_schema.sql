create extension if not exists "pgcrypto";

do $$ begin
  create type public.user_role as enum ('admin', 'agent', 'agency_owner', 'developer');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.user_status as enum ('pending', 'active', 'blocked');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.property_purpose as enum ('sale', 'rent', 'launch');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.property_type as enum ('apartment', 'studio', 'house', 'penthouse', 'land', 'commercial');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.property_status as enum ('available', 'reserved', 'sold', 'rented', 'inactive');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.approval_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.lead_status as enum ('new', 'contacted', 'visiting', 'proposal', 'converted', 'lost');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  whatsapp text,
  creci text,
  role public.user_role not null default 'agent',
  status public.user_status not null default 'pending',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type text not null default 'agency' check (type in ('agency', 'independent_agent', 'developer', 'team', 'owner')),
  phone text,
  whatsapp text,
  email text,
  website text,
  city text,
  state text default 'SP',
  status public.user_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.user_role not null default 'agent',
  created_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);

create table if not exists public.neighborhoods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  city text not null default 'Sao Paulo',
  state text not null default 'SP',
  description text,
  image_url text,
  meta_title text,
  meta_description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, city, state)
);

create table if not exists public.developers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  website text,
  phone text,
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  agent_id uuid references public.profiles(id) on delete set null,
  developer_id uuid references public.developers(id) on delete set null,
  neighborhood_id uuid references public.neighborhoods(id) on delete set null,
  title text not null,
  slug text not null unique,
  description text not null,
  purpose public.property_purpose not null,
  type public.property_type not null,
  status public.property_status not null default 'available',
  approval_status public.approval_status not null default 'pending',
  price numeric(14,2) not null check (price >= 0),
  condo_fee numeric(14,2),
  iptu numeric(14,2),
  area numeric(10,2) not null check (area >= 0),
  bedrooms int not null default 0 check (bedrooms >= 0),
  bathrooms int not null default 0 check (bathrooms >= 0),
  suites int not null default 0 check (suites >= 0),
  parking_spaces int not null default 0 check (parking_spaces >= 0),
  address text,
  address_number text,
  complement text,
  neighborhood_name text not null,
  city text not null,
  state text not null default 'SP',
  latitude numeric(10,7),
  longitude numeric(10,7),
  cover_image text,
  characteristics text[] not null default '{}',
  is_featured boolean not null default false,
  is_active boolean not null default true,
  meta_title text,
  meta_description text,
  video_url text,
  tour_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.property_features (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  icon text,
  created_at timestamptz not null default now(),
  unique (property_id, name)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  agent_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  whatsapp text,
  message text,
  source text not null default 'site',
  status public.lead_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  meta_title text,
  meta_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at before update on public.organizations for each row execute function public.set_updated_at();

drop trigger if exists neighborhoods_set_updated_at on public.neighborhoods;
create trigger neighborhoods_set_updated_at before update on public.neighborhoods for each row execute function public.set_updated_at();

drop trigger if exists developers_set_updated_at on public.developers;
create trigger developers_set_updated_at before update on public.developers for each row execute function public.set_updated_at();

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at before update on public.properties for each row execute function public.set_updated_at();

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at before update on public.leads for each row execute function public.set_updated_at();

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at before update on public.blog_posts for each row execute function public.set_updated_at();

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false)
$$;

create or replace function public.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_organization_id
      and om.profile_id = auth.uid()
  )
$$;

create or replace function public.can_manage_property(target_property_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.properties p
    where p.id = target_property_id
      and (
        public.is_admin()
        or p.agent_id = auth.uid()
        or (p.organization_id is not null and public.is_organization_member(p.organization_id))
      )
  )
$$;

create index if not exists properties_slug_idx on public.properties (slug);
create index if not exists properties_city_idx on public.properties (city);
create index if not exists properties_neighborhood_name_idx on public.properties (neighborhood_name);
create index if not exists properties_purpose_idx on public.properties (purpose);
create index if not exists properties_type_idx on public.properties (type);
create index if not exists properties_status_idx on public.properties (status);
create index if not exists properties_approval_status_idx on public.properties (approval_status);
create index if not exists properties_is_active_idx on public.properties (is_active);
create index if not exists properties_is_featured_idx on public.properties (is_featured);
create index if not exists properties_price_idx on public.properties (price);
create index if not exists properties_organization_id_idx on public.properties (organization_id);
create index if not exists properties_agent_id_idx on public.properties (agent_id);
create unique index if not exists property_images_property_id_order_index_idx on public.property_images (property_id, order_index);
create index if not exists leads_property_id_idx on public.leads (property_id);
create index if not exists leads_agent_id_idx on public.leads (agent_id);
create index if not exists leads_organization_id_idx on public.leads (organization_id);
create index if not exists neighborhoods_slug_idx on public.neighborhoods (slug);
create index if not exists blog_posts_slug_idx on public.blog_posts (slug);

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.neighborhoods enable row level security;
alter table public.developers enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.property_features enable row level security;
alter table public.leads enable row level security;
alter table public.blog_posts enable row level security;

drop policy if exists "Profiles read own or admin" on public.profiles;
create policy "Profiles read own or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());

drop policy if exists "Profiles update own or admin" on public.profiles;
create policy "Profiles update own or admin" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read active organizations" on public.organizations;
create policy "Public read active organizations" on public.organizations for select using (status = 'active');

drop policy if exists "Members read own organizations" on public.organizations;
create policy "Members read own organizations" on public.organizations for select using (public.is_organization_member(id) or public.is_admin());

drop policy if exists "Admins manage organizations" on public.organizations;
create policy "Admins manage organizations" on public.organizations for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Members read own memberships" on public.organization_members;
create policy "Members read own memberships" on public.organization_members for select using (profile_id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage memberships" on public.organization_members;
create policy "Admins manage memberships" on public.organization_members for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read active neighborhoods" on public.neighborhoods;
create policy "Public read active neighborhoods" on public.neighborhoods for select using (is_active = true);

drop policy if exists "Admins manage neighborhoods" on public.neighborhoods;
create policy "Admins manage neighborhoods" on public.neighborhoods for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read active developers" on public.developers;
create policy "Public read active developers" on public.developers for select using (is_active = true);

drop policy if exists "Admins manage developers" on public.developers;
create policy "Admins manage developers" on public.developers for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read approved active properties" on public.properties;
create policy "Public read approved active properties" on public.properties
for select using (is_active = true and approval_status = 'approved' and status = 'available');

drop policy if exists "Agents read own properties" on public.properties;
create policy "Agents read own properties" on public.properties
for select using (agent_id = auth.uid() or (organization_id is not null and public.is_organization_member(organization_id)) or public.is_admin());

drop policy if exists "Agents create own properties" on public.properties;
create policy "Agents create own properties" on public.properties
for insert to authenticated
with check (agent_id = auth.uid() or (organization_id is not null and public.is_organization_member(organization_id)) or public.is_admin());

drop policy if exists "Agents update own pending properties" on public.properties;
create policy "Agents update own pending properties" on public.properties
for update to authenticated
using (
  public.is_admin()
  or (
    approval_status <> 'approved'
    and (agent_id = auth.uid() or (organization_id is not null and public.is_organization_member(organization_id)))
  )
)
with check (
  public.is_admin()
  or (
    approval_status <> 'approved'
    and (agent_id = auth.uid() or (organization_id is not null and public.is_organization_member(organization_id)))
  )
);

drop policy if exists "Admins delete properties" on public.properties;
create policy "Admins delete properties" on public.properties for delete using (public.is_admin());

drop policy if exists "Public read images for approved properties" on public.property_images;
create policy "Public read images for approved properties" on public.property_images
for select using (
  exists (
    select 1
    from public.properties p
    where p.id = property_images.property_id
      and p.is_active = true
      and p.approval_status = 'approved'
      and p.status = 'available'
  )
);

drop policy if exists "Managers manage property images" on public.property_images;
create policy "Managers manage property images" on public.property_images
for all to authenticated
using (public.can_manage_property(property_id))
with check (public.can_manage_property(property_id));

drop policy if exists "Public read features for approved properties" on public.property_features;
create policy "Public read features for approved properties" on public.property_features
for select using (
  exists (
    select 1
    from public.properties p
    where p.id = property_features.property_id
      and p.is_active = true
      and p.approval_status = 'approved'
      and p.status = 'available'
  )
);

drop policy if exists "Managers manage property features" on public.property_features;
create policy "Managers manage property features" on public.property_features
for all to authenticated
using (public.can_manage_property(property_id))
with check (public.can_manage_property(property_id));

drop policy if exists "Public insert leads" on public.leads;
create policy "Public insert leads" on public.leads for insert with check (true);

drop policy if exists "Agents read own leads" on public.leads;
create policy "Agents read own leads" on public.leads
for select to authenticated
using (
  public.is_admin()
  or agent_id = auth.uid()
  or (organization_id is not null and public.is_organization_member(organization_id))
  or (property_id is not null and public.can_manage_property(property_id))
);

drop policy if exists "Agents update own leads" on public.leads;
create policy "Agents update own leads" on public.leads
for update to authenticated
using (
  public.is_admin()
  or agent_id = auth.uid()
  or (organization_id is not null and public.is_organization_member(organization_id))
  or (property_id is not null and public.can_manage_property(property_id))
)
with check (
  public.is_admin()
  or agent_id = auth.uid()
  or (organization_id is not null and public.is_organization_member(organization_id))
  or (property_id is not null and public.can_manage_property(property_id))
);

drop policy if exists "Public read published blog posts" on public.blog_posts;
create policy "Public read published blog posts" on public.blog_posts for select using (status = 'published' and published_at <= now());

drop policy if exists "Admins manage blog posts" on public.blog_posts;
create policy "Admins manage blog posts" on public.blog_posts for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read property image files" on storage.objects;
create policy "Public read property image files" on storage.objects
for select using (bucket_id = 'property-images');

drop policy if exists "Authenticated upload property image files" on storage.objects;
create policy "Authenticated upload property image files" on storage.objects
for insert to authenticated
with check (bucket_id = 'property-images');

drop policy if exists "Managers update property image files" on storage.objects;
create policy "Managers update property image files" on storage.objects
for update to authenticated
using (
  bucket_id = 'property-images'
  and (
    public.is_admin()
    or exists (
      select 1
      from public.property_images pi
      where pi.storage_path = storage.objects.name
        and public.can_manage_property(pi.property_id)
    )
  )
)
with check (bucket_id = 'property-images');

drop policy if exists "Managers delete property image files" on storage.objects;
create policy "Managers delete property image files" on storage.objects
for delete to authenticated
using (
  bucket_id = 'property-images'
  and (
    public.is_admin()
    or exists (
      select 1
      from public.property_images pi
      where pi.storage_path = storage.objects.name
        and public.can_manage_property(pi.property_id)
    )
  )
);
