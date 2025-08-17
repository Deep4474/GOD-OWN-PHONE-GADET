-- Reset everything first
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user cascade;
drop trigger if exists update_profiles_updated_at on public.profiles;
drop function if exists public.update_profile_updated_at cascade;
drop table if exists public.profiles cascade;

-- Create profiles table with minimal required fields
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    full_name text,
    role text default 'customer',
    created_at timestamptz default now()
);

-- Basic function to handle new user registration
create or replace function public.handle_new_user()
returns trigger
security definer
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql;

-- Create trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable RLS
alter table public.profiles enable row level security;

-- Set up RLS policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.profiles to authenticated;
grant select on public.profiles to anon;
