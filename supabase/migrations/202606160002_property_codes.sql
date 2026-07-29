create sequence if not exists public.property_code_seq;

create or replace function public.generate_property_code()
returns text
language plpgsql
as $$
declare
  next_code bigint;
begin
  next_code := nextval('public.property_code_seq');
  return 'VM-' || lpad(next_code::text, 6, '0');
end;
$$;

alter table public.properties
add column if not exists code text;

with numbered_properties as (
  select
    id,
    row_number() over (order by created_at, id) as row_number
  from public.properties
  where code is null
)
update public.properties properties
set code = 'VM-' || lpad(numbered_properties.row_number::text, 6, '0')
from numbered_properties
where properties.id = numbered_properties.id;

select setval(
  'public.property_code_seq',
  greatest(
    coalesce((select max(substring(code from '^VM-([0-9]+)$')::bigint) from public.properties), 0),
    1
  ),
  true
);

alter table public.properties
alter column code set default public.generate_property_code();

alter table public.properties
alter column code set not null;

create unique index if not exists properties_code_idx on public.properties (code);
