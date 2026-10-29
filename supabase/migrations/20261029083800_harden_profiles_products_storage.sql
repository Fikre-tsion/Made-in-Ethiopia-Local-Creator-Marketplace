-- Hardening migration for profiles, products, and product storage.

-- Profiles: expose only creator profiles (or the current user's own row).
drop policy if exists "Public can read creator profiles" on public.profiles;
drop policy if exists "Creators manage their own profile" on public.profiles;

create policy "Read creator profiles or own profile"
  on public.profiles for select
  using (role = 'creator' or auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Contact email is opt-in and must not default to the auth login email.
update public.profiles
set contact_email = null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text := new.raw_user_meta_data ->> 'role';
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    case when requested_role = 'creator' then 'creator' else 'customer' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Products: only creators may insert or update their own products.
drop policy if exists "Creators insert their own products" on public.products;
drop policy if exists "Creators update their own products" on public.products;

create policy "Creators insert their own products"
  on public.products for insert
  with check (
    auth.uid() = creator_id
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'creator'
    )
  );

create policy "Creators update their own products"
  on public.products for update
  using (auth.uid() = creator_id)
  with check (
    auth.uid() = creator_id
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'creator'
    )
  );

-- Storage: uploads must be in the creator's own top-level folder.
drop policy if exists "Creators upload product images" on storage.objects;

create policy "Creators upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'products'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'creator'
    )
  );

drop policy if exists "Creators update product images" on storage.objects;

create policy "Creators update product images"
  on storage.objects for update
  using (bucket_id = 'products' and auth.uid()::text = owner_id);

drop policy if exists "Creators delete product images" on storage.objects;

create policy "Creators delete product images"
  on storage.objects for delete
  using (bucket_id = 'products' and auth.uid()::text = owner_id);

update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'products';
