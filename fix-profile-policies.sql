-- Drop existing policies if any
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies
create policy "Public read access for profiles"
    on profiles for select
    using ( true );

create policy "Insert access for authenticated users"
    on profiles for insert
    with check ( auth.uid() = id );

create policy "Update access for profile owners"
    on profiles for update
    using ( auth.uid() = id );

create policy "Users can update their own profile"
    on profiles for update
    using ( auth.uid() = id )
    with check ( auth.uid() = id );

-- Grant table access
grant usage on schema public to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
