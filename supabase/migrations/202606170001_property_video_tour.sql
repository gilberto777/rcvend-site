alter table public.properties
add column if not exists video_url text,
add column if not exists tour_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-videos',
  'property-videos',
  true,
  524288000,
  array['video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read property video files" on storage.objects;
create policy "Public read property video files" on storage.objects
for select using (bucket_id = 'property-videos');

drop policy if exists "Authenticated upload property video files" on storage.objects;
create policy "Authenticated upload property video files" on storage.objects
for insert to authenticated
with check (bucket_id = 'property-videos');

drop policy if exists "Authenticated update property video files" on storage.objects;
create policy "Authenticated update property video files" on storage.objects
for update to authenticated
using (bucket_id = 'property-videos')
with check (bucket_id = 'property-videos');

drop policy if exists "Authenticated delete property video files" on storage.objects;
create policy "Authenticated delete property video files" on storage.objects
for delete to authenticated
using (bucket_id = 'property-videos');
