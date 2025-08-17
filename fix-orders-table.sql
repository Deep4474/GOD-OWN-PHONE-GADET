-- Drop and recreate orders table to match actual structure
drop table if exists public.orders cascade;

create table public.orders (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    quantity integer not null check (quantity > 0),
    product_id uuid references public.products(id),
    delivery_option text not null,
    email text not null,
    name text not null,
    phone text not null,
    total_amount decimal(10,2) not null check (total_amount >= 0),
    status text default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled'))
);

-- Enable RLS
alter table public.orders enable row level security;

-- Create policies
create policy "Users can view own orders"
    on orders for select
    using ( auth.uid() in (
        select user_id from profiles where email = orders.email
    ));

create policy "Users can create orders"
    on orders for insert
    with check ( true );  -- Anyone can create an order

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant select on public.orders to anon, authenticated;
grant insert on public.orders to anon, authenticated;
