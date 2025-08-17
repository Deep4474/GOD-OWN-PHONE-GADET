-- Add additional security settings and CORS configuration
-- Make sure RLS is enabled for all relevant tables
alter table if exists public.profiles enable row level security;
alter table if exists public.products enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.order_items enable row level security;
alter table if exists public.categories enable row level security;

-- Grant necessary schema permissions
grant usage on schema public to anon, authenticated;

-- Grant table permissions
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant select on public.products to anon, authenticated;
grant select on public.categories to anon, authenticated;
grant select, insert on public.orders to authenticated;
grant select, insert on public.order_items to authenticated;
