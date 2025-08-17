-- Drop and recreate profiles table with proper structure
drop table if exists public.profiles;

create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    created_at timestamptz default timezone('utc'::text, now()) not null,
    updated_at timestamptz default timezone('utc'::text, now()) not null,
    email text unique not null,
    full_name text,
    phone_number text,
    role text default 'customer' check (role in ('customer', 'admin')),
    verified boolean default false
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies
create policy "Public read access for profiles"
    on profiles for select
    using ( true );

create policy "Users can insert their own profile"
    on profiles for insert
    with check ( auth.uid() = id );

create policy "Users can update their own profile"
    on profiles for update
    using ( auth.uid() = id )
    with check ( auth.uid() = id );

-- Permissions
grant usage on schema public to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;

-- Create an updated trigger function
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql as $$
declare
    default_role text := 'customer';
begin
    insert into public.profiles (
        id,
        email,
        full_name,
        phone_number,
        role,
        created_at,
        updated_at
    )
    values (
        new.id,
        new.email,
        coalesce(
            new.raw_user_meta_data->>'full_name',
            new.raw_app_meta_data->>'full_name',
            split_part(new.email, '@', 1)
        ),
        coalesce(
            new.raw_user_meta_data->>'phone_number',
            new.raw_app_meta_data->>'phone_number'
        ),
        coalesce(
            new.raw_user_meta_data->>'role',
            new.raw_app_meta_data->>'role',
            default_role
        ),
        now(),
        now()
    );
    return new;
exception
    when others then
        raise log 'Error in handle_new_user: %', SQLERRM;
        return new;
end;
$$;

-- Recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Grant necessary permissions
grant execute on function public.handle_new_user() to authenticated;
grant execute on function public.handle_new_user() to anon;

-- Create or replace the updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- Create trigger for updated_at
drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
    before update on public.profiles
    for each row execute function public.handle_updated_at();
