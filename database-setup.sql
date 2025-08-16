-- Create products table
create table public.products (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    description text,
    price decimal(10,2) not null,
    image_url text,
    stock integer default 0,
    category_id uuid references categories(id)
);

-- Create users table
create table public.users (
    id uuid references auth.users primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    email text unique not null,
    name text,
    verified boolean default false,
    role text default 'customer'
);

-- Create categories table
create table public.categories (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    description text
);

-- Create orders table
create table public.orders (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users,
    product_id uuid references products(id),
    quantity integer not null,
    delivery_option text not null,
    email text not null,
    name text not null,
    phone text,
    address text,
    status text default 'pending',
    total_amount decimal(10,2) not null
);

-- Set up row level security (RLS)
alter table public.products enable row level security;
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.orders enable row level security;

-- Products policies
create policy "Products are viewable by everyone" 
on public.products for select 
to anon
using (true);

create policy "Products are editable by authenticated users with admin role" 
on public.products for all 
to authenticated
using (
    exists (
        select 1 from public.users 
        where users.id = auth.uid() 
        and users.role = 'admin'
    )
);

-- Users policies
create policy "Users can view their own data" 
on public.users for select 
to authenticated
using (auth.uid() = id);

create policy "Users can update their own data" 
on public.users for update 
to authenticated
using (auth.uid() = id);

-- Orders policies
create policy "Users can view their own orders" 
on public.orders for select 
to authenticated
using (user_id = auth.uid());

create policy "Users can create their own orders" 
on public.orders for insert 
to authenticated
with check (true);

-- Sample data for categories
insert into public.categories (name, description) values
('Phones', 'Smartphones and feature phones'),
('Cases', 'Phone cases and covers'),
('Chargers', 'Power adapters and charging cables'),
('Audio', 'Headphones, earbuds, and speakers'),
('Accessories', 'Other phone accessories');

-- Sample data for products
insert into public.products (name, description, price, image_url, stock, category_id) values
('iPhone Case', 'Premium protective case for iPhone', 5000.00, 'https://example.com/iphone-case.jpg', 50, (select id from categories where name = 'Cases')),
('Fast Charger', 'Quick charging power adapter', 3500.00, 'https://example.com/charger.jpg', 30, (select id from categories where name = 'Chargers')),
('Wireless Earbuds', 'High-quality wireless earbuds', 15000.00, 'https://example.com/earbuds.jpg', 20, (select id from categories where name = 'Audio'));
