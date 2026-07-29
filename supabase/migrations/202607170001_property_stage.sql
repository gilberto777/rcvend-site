do $$ begin
  create type public.property_stage as enum ('launch', 'under_construction', 'ready');
exception when duplicate_object then null;
end $$;

alter table public.properties
  add column if not exists property_stage public.property_stage;

update public.properties
set property_stage = case
  when purpose = 'launch' then 'launch'::public.property_stage
  else 'ready'::public.property_stage
end
where property_stage is null;

alter table public.properties
  alter column property_stage set default 'ready',
  alter column property_stage set not null;

create index if not exists properties_property_stage_idx
  on public.properties (property_stage);
