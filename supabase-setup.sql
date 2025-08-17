-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table (replaces users table)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    email text unique not null,
    full_name text,
    phone_number text,
    role text default 'customer',
    verified boolean default false
);

-- Create categories table
create table if not exists public.categories (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    description text
);

-- Create products table
create table if not exists public.products (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    description text,
    price decimal(10,2) not null,
    image_url text,
    stock integer default 0,
    category_id uuid references categories(id)
);

-- Create orders table
create table if not exists public.orders (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users,
    status text default 'pending',
    total_amount decimal(10,2) not null,
    delivery_address text,
    delivery_option text,
    phone text,
    payment_status text default 'pending'
);

-- Create order items table
create table if not exists public.order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references orders(id),
    product_id uuid references products(id),
    quantity integer not null,
    price_at_time decimal(10,2) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
    on profiles for select
    using ( true );

create policy "Users can insert their own profile"
    on profiles for insert
    with check ( auth.uid() = id );

create policy "Users can update own profile"
    on profiles for update
    using ( auth.uid() = id );

-- Products policies
create policy "Products are viewable by everyone"
    on products for select
    using ( true );

create policy "Admins can modify products"
    on products for all
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

-- Categories policies
create policy "Categories are viewable by everyone"
    on categories for select
    using ( true );

create policy "Admins can modify categories"
    on categories for all
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

-- Orders policies
create policy "Users can view own orders"
    on orders for select
    using ( auth.uid() = user_id );

create policy "Users can create own orders"
    on orders for insert
    with check ( auth.uid() = user_id );

-- Order items policies
create policy "Users can view own order items"
    on order_items for select
    using (
        exists (
            select 1 from orders
            where orders.id = order_items.order_id
            and orders.user_id = auth.uid()
        )
    );

create policy "Users can create own order items"
    on order_items for insert
    with check (
        exists (
            select 1 from orders
            where orders.id = order_items.order_id
            and orders.user_id = auth.uid()
        )
    );

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, full_name)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', new.email)
    );
    return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user registration
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Insert sample categories
insert into public.categories (name, description) values
    ('Phones', 'Smartphones and feature phones'),
    ('Cases', 'Phone cases and protective covers'),
    ('Chargers', 'Power adapters and charging accessories'),
    ('Audio', 'Headphones, earbuds, and speakers'),
    ('Accessories', 'Other phone accessories')
on conflict (id) do nothing;

-- Insert sample products
insert into public.products (name, description, price, image_url, stock, category_id) values
    ('iPhone 15 Pro Max', 'Latest iPhone with A17 Pro chip and advanced camera system', 1199.99, 'https://example.com/iphone15.jpg', 50, (select id from categories where name = 'Phones')),
    ('Samsung Galaxy S24 Ultra', 'Premium Android flagship with S Pen', 1299.99, 'https://example.com/s24.jpg', 45, (select id from categories where name = 'Phones')),
    ('Premium Phone Case', 'Durable protective case', 29.99, 'https://example.com/case.jpg', 100, (select id from categories where name = 'Cases')),
    ('Fast Wireless Charger', 'Quick charging wireless pad', 49.99, 'https://example.com/charger.jpg', 75, (select id from categories where name = 'Chargers')),
    ('Premium Earbuds', 'High-quality wireless earbuds', 199.99, 'https://example.com/earbuds.jpg', 30, (select id from categories where name = 'Audio'))
on conflict (id) do nothing;
