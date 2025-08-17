-- Create an admin user in the profiles table
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';  -- Replace with your actual admin email

-- Verify admin was created
SELECT * FROM public.profiles WHERE role = 'admin';
