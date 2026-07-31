create or replace function public.sync_legacy_property_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.id := coalesce(new.id, gen_random_uuid());
  new.code := coalesce(nullif(new.code, ''), 'RCV-' || upper(substr(replace(new.id::text, '-', ''), 1, 12)));
  new.broker_id := coalesce(new.broker_id, new.agent_id::text, '');
  new.description := coalesce(nullif(new.description, ''), new.title, 'Imóvel sem descrição');
  new.type := coalesce(nullif(new.type, ''), 'apartment');
  new.price := coalesce(new.price, 0);
  new.bedrooms := coalesce(new.bedrooms, 0);
  new.bathrooms := coalesce(new.bathrooms, 0);
  new.suites := coalesce(new.suites, 0);
  new.parking_spaces := coalesce(new.parking_spaces, 0);
  new.area := coalesce(new.area, 0);
  new.neighborhood_name := coalesce(nullif(new.neighborhood_name, ''), nullif(new.neighborhood, ''), 'Não informado');
  new.neighborhood := coalesce(nullif(new.neighborhood, ''), new.neighborhood_name);
  new.city := coalesce(nullif(new.city, ''), nullif(new.location, ''), 'São Paulo');
  new.location := coalesce(nullif(new.location, ''), new.city);
  new.state := coalesce(nullif(new.state, ''), 'SP');
  new.address := coalesce(new.address, '');
  new.images := coalesce(new.images, '[]'::jsonb);
  new.featured := coalesce(new.featured, new.is_featured, false);
  new.is_featured := coalesce(new.is_featured, new.featured, false);
  new.status := coalesce(nullif(new.status, ''), 'available');
  new.is_active := coalesce(new.is_active, new.status <> 'inactive');
  new.property_status := coalesce(
    nullif(new.property_status, ''),
    case when new.property_stage = 'under_construction' then 'construction' else 'ready' end
  );
  new.youtube_url := coalesce(new.youtube_url, new.video_url, '');
  new.video_url := coalesce(new.video_url, nullif(new.youtube_url, ''), '');
  new.virtual_tour_url := coalesce(new.virtual_tour_url, new.tour_url, '');
  new.tour_url := coalesce(new.tour_url, nullif(new.virtual_tour_url, ''), '');
  new.floor_plans := coalesce(new.floor_plans, '[]'::jsonb);
  new.plans_urls := coalesce(new.plans_urls, new.floor_plans, '[]'::jsonb);
  new.business_type := coalesce(nullif(new.business_type, ''), new.purpose, 'sale');
  new.purpose := coalesce(nullif(new.purpose, ''), new.business_type, 'sale');
  new.amenities := coalesce(new.amenities, to_jsonb(coalesce(new.characteristics, '{}'::text[])));
  new.characteristics := coalesce(
    new.characteristics,
    array(select jsonb_array_elements_text(coalesce(new.amenities, '[]'::jsonb))),
    '{}'::text[]
  );
  new.approval_status := coalesce(nullif(new.approval_status, ''), 'approved');
  new.property_stage := coalesce(nullif(new.property_stage, ''), 'ready');
  new.meta_title := coalesce(new.meta_title, new.title, 'Imóvel RC Vend');
  new.meta_description := coalesce(new.meta_description, left(regexp_replace(new.description, '<[^>]+>', '', 'g'), 300), 'Imóvel RC Vend');
  new.created_at := coalesce(new.created_at, now());
  new.updated_at := coalesce(new.updated_at, now());
  return new;
end;
$$;

drop trigger if exists properties_sync_legacy_columns on public.properties;
create trigger properties_sync_legacy_columns
before insert or update on public.properties
for each row execute function public.sync_legacy_property_columns();
