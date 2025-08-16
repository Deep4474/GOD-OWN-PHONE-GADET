-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing tables if they exist (to avoid conflicts)
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.products cascade;
drop table if exists public.categories cascade;
drop table if exists public.profiles cascade;

-- Create profiles table
create table public.profiles (
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
create table public.categories (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null unique,
    description text
);
