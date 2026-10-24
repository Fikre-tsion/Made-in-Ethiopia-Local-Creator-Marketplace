create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  location text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  category text,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.shops enable row level security;
alter table public.products enable row level security;

-- Profiles
create policy "Users can read own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy "Users can update own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Public marketplace can read shop details.
create policy "Anyone can view shops"
on public.shops for select to anon, authenticated
using (true);

create policy "Users can create own shops"
on public.shops for insert to authenticated
with check ((select auth.uid()) = owner_id);

create policy "Owners can update own shops"
on public.shops for update to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "Owners can delete own shops"
on public.shops for delete to authenticated
using ((select auth.uid()) = owner_id);

-- Public marketplace can read products.
create policy "Anyone can view products"
on public.products for select to anon, authenticated
using (true);

create policy "Creators can add products to own shops"
on public.products for insert to authenticated
with check (
  (select auth.uid()) = creator_id
  and exists (
    select 1 from public.shops
    where shops.id = shop_id
      and shops.owner_id = (select auth.uid())
  )
);

create policy "Creators can update own products"
on public.products for update to authenticated
using ((select auth.uid()) = creator_id)
with check (
  (select auth.uid()) = creator_id
  and exists (
    select 1 from public.shops
    where shops.id = shop_id
      and shops.owner_id = (select auth.uid())
  )
);

create policy "Creators can delete own products"
on public.products for delete to authenticated
using ((select auth.uid()) = creator_id);

-- Automatically create a profile when a new auth user is created.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
