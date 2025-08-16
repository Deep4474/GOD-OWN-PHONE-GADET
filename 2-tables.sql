-- Create products table
create table public.products (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    description text,
    price decimal(10,2) not null check (price >= 0),
    image_url text,
    stock integer default 0 check (stock >= 0),
    category_id uuid references public.categories(id)
);

-- Create orders table
create table public.orders (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users not null,
    status text default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount decimal(10,2) not null check (total_amount >= 0),
    delivery_address text not null,
    delivery_option text not null,
    phone text not null,
    payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded'))
);

-- Create order items table
create table public.order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references public.orders(id) on delete cascade,
    product_id uuid references public.products(id) on delete restrict,
    quantity integer not null check (quantity > 0),
    price_at_time decimal(10,2) not null check (price_at_time >= 0)
);
