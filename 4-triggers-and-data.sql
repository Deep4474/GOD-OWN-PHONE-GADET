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

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger for new user registration
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
on conflict (name) do nothing;

-- Insert sample products with real images
insert into public.products (name, description, price, image_url, stock, category_id) values
    ('iPhone 15 Pro Max', 'Latest iPhone with A17 Pro chip and advanced camera system', 1199.99, 
    'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&w=800&q=80', 
    50, (select id from categories where name = 'Phones')),
    
    ('Samsung Galaxy S24 Ultra', 'Premium Android flagship with S Pen', 1299.99, 
    'https://images.unsplash.com/photo-1678775476880-7a1f37dc9aa6?auto=format&fit=crop&w=800&q=80', 
    45, (select id from categories where name = 'Phones')),
    
    ('Premium Phone Case', 'Durable protective case', 29.99, 
    'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?auto=format&fit=crop&w=800&q=80', 
    100, (select id from categories where name = 'Cases')),
    
    ('Fast Wireless Charger', 'Quick charging wireless pad', 49.99, 
    'https://images.unsplash.com/photo-1583863622394-bf6aa0a67d91?auto=format&fit=crop&w=800&q=80', 
    75, (select id from categories where name = 'Chargers')),
    
    ('Premium Earbuds', 'High-quality wireless earbuds', 199.99, 
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80', 
    30, (select id from categories where name = 'Audio'))
on conflict (id) do nothing;
