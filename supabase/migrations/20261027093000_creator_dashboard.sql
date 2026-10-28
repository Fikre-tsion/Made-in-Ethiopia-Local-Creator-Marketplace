create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  bio text,
  location text,
  contact_email text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null,
  category text not null,
  price numeric(12, 2) not null check (price >= 0),
  quantity integer not null default 0 check (quantity >= 0),
  image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_creator_id_idx on public.products (creator_id);
create index if not exists products_publication_idx on public.products (status);

alter table public.profiles enable row level security;
alter table public.products enable row level security;

create policy "Public can read creator profiles"
  on public.profiles for select using (true);
create policy "Creators manage their own profile"
  on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Public can read published products"
  on public.products for select using (status = 'published' or auth.uid() = creator_id);
create policy "Creators insert their own products"
  on public.products for insert with check (auth.uid() = creator_id);
create policy "Creators update their own products"
  on public.products for update using (auth.uid() = creator_id) with check (auth.uid() = creator_id);
create policy "Creators delete their own products"
  on public.products for delete using (auth.uid() = creator_id);

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

create policy "Public can read product images"
  on storage.objects for select using (bucket_id = 'products');
create policy "Creators upload product images"
  on storage.objects for insert with check (bucket_id = 'products' and auth.uid() is not null);
create policy "Creators update product images"
  on storage.objects for update using (bucket_id = 'products' and auth.uid() = owner_id);
create policy "Creators delete product images"
  on storage.objects for delete using (bucket_id = 'products' and auth.uid() = owner_id);
