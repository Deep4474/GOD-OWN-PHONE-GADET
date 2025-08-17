-- Add more products with real images
INSERT INTO public.products (name, description, price, image_url, stock, category_id) VALUES
    ('iPhone 14', 'Apple iPhone 14 with A15 Bionic chip', 899.99, 
    'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&w=800&q=80', 
    30, (SELECT id FROM categories WHERE name = 'Phones')),
    
    ('Samsung Galaxy S23', 'Samsung flagship with advanced camera', 999.99, 
    'https://images.unsplash.com/photo-1678775476880-7a1f37dc9aa6?auto=format&fit=crop&w=800&q=80', 
    25, (SELECT id FROM categories WHERE name = 'Phones')),
    
    ('Silicone Case', 'Soft touch silicone protective case', 24.99, 
    'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?auto=format&fit=crop&w=800&q=80', 
    150, (SELECT id FROM categories WHERE name = 'Cases')),
    
    ('20W USB-C Charger', 'Fast charging power adapter', 29.99, 
    'https://images.unsplash.com/photo-1583863622394-bf6aa0a67d91?auto=format&fit=crop&w=800&q=80', 
    100, (SELECT id FROM categories WHERE name = 'Chargers')),
    
    ('Wireless Earbuds', 'True wireless stereo earbuds with noise cancellation', 159.99, 
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80', 
    40, (SELECT id FROM categories WHERE name = 'Audio'))
ON CONFLICT (id) DO NOTHING;
