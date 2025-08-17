-- Drop existing trigger and function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Create updated function to handle new user registration
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql as $$
begin
    insert into public.profiles (
        id,
        email,
        full_name,
        phone_number,
        role
    )
    values (
        new.id,
        new.email,
        coalesce(
            (new.raw_user_meta_data->>'full_name'),
            (new.raw_app_meta_data->>'full_name'),
            new.email
        ),
        coalesce(
            (new.raw_user_meta_data->>'phone_number'),
            (new.raw_app_meta_data->>'phone_number')
        ),
        coalesce(
            (new.raw_user_meta_data->>'role'),
            (new.raw_app_meta_data->>'role'),
            'customer'
        )
    );
    return new;
end;
$$;

-- Create new trigger
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Grant necessary permissions
grant execute on function public.handle_new_user() to authenticated;
grant execute on function public.handle_new_user() to anon;
