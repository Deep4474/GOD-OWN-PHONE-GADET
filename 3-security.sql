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
