alter table public.profiles
  add column if not exists role text not null default 'customer'
  check (role in ('creator', 'customer'));

insert into public.profiles (id, display_name, contact_email, role)
select
  users.id,
  nullif(users.raw_user_meta_data ->> 'full_name', ''),
  users.email,
  case when users.raw_user_meta_data ->> 'role' = 'creator' then 'creator' else 'customer' end
from auth.users as users
on conflict (id) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested_role text := new.raw_user_meta_data ->> 'role';
begin
  insert into public.profiles (id, display_name, contact_email, role)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    case when requested_role = 'creator' then 'creator' else 'customer' end
  )
  on conflict (id) do update set
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    contact_email = coalesce(public.profiles.contact_email, excluded.contact_email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role
    and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Profile roles cannot be changed by the account owner';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_profile_role_change on public.profiles;
create trigger prevent_profile_role_change
  before update on public.profiles
  for each row execute procedure public.prevent_profile_role_change();
