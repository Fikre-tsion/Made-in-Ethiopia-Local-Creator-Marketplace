insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'creator-images',
  'creator-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can view creator images" on storage.objects;
create policy "Anyone can view creator images"
  on storage.objects for select
  using (bucket_id = 'creator-images');

drop policy if exists "Creators upload to their own folder" on storage.objects;
create policy "Creators upload to their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'creator-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'creator'
    )
  );

drop policy if exists "Creators update their own images" on storage.objects;
create policy "Creators update their own images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'creator-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Creators delete their own images" on storage.objects;
create policy "Creators delete their own images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'creator-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
