create table if not exists public.property_floor_plans (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  image_url text not null,
  storage_path text,
  title text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists property_floor_plans_property_id_order_index_idx
on public.property_floor_plans (property_id, order_index);

alter table public.property_floor_plans enable row level security;

drop policy if exists "Public read floor plans for approved properties" on public.property_floor_plans;
create policy "Public read floor plans for approved properties" on public.property_floor_plans
for select using (
  exists (
    select 1
    from public.properties p
    where p.id = property_floor_plans.property_id
      and p.is_active = true
      and p.approval_status = 'approved'
      and p.status = 'available'
  )
);

drop policy if exists "Managers manage property floor plans" on public.property_floor_plans;
create policy "Managers manage property floor plans" on public.property_floor_plans
for all to authenticated
using (public.can_manage_property(property_id))
with check (public.can_manage_property(property_id));
