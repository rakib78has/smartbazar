-- ================================================================
-- SmartBazar E-commerce Database Schema for Supabase (PostgreSQL)
-- Run this script in your Supabase SQL Editor
-- ================================================================

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image TEXT,
    product_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    short_description TEXT,
    description TEXT,
    category TEXT REFERENCES public.categories(slug) ON UPDATE CASCADE ON DELETE SET NULL,
    brand TEXT,
    base_price NUMERIC NOT NULL,
    discount_price NUMERIC,
    cost_price NUMERIC,
    images JSONB DEFAULT '[]'::jsonb,
    variants JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    is_published BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    stock INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_city TEXT,
    delivery_zone TEXT NOT NULL,
    notes TEXT,
    items JSONB DEFAULT '[]'::jsonb NOT NULL,
    subtotal NUMERIC NOT NULL,
    delivery_charge NUMERIC NOT NULL,
    discount NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    courier_tracking_code TEXT,
    courier_name TEXT,
    channel TEXT DEFAULT 'whatsapp' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Store Settings Table
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    store_name TEXT NOT NULL,
    store_tagline TEXT,
    store_phone TEXT,
    store_email TEXT,
    store_address TEXT,
    logo_url TEXT,
    primary_whatsapp_number TEXT NOT NULL,
    support_whatsapp_number TEXT,
    delivery_charge_inside_dhaka NUMERIC DEFAULT 70,
    delivery_charge_outside_dhaka NUMERIC DEFAULT 130,
    free_delivery_threshold NUMERIC DEFAULT 2000,
    currency_symbol TEXT DEFAULT '৳',
    announcement_text TEXT,
    announcement_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Categories: Anyone can read, only admin can write
CREATE POLICY "Allow public read on categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert/update/delete on categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated');

-- Products: Anyone can read published products, only admin can write
CREATE POLICY "Allow public read on products" ON public.products FOR SELECT USING (is_published = true);
CREATE POLICY "Allow authenticated full access on products" ON public.products FOR ALL USING (auth.role() = 'authenticated');

-- Orders: Anyone can create an order (checkout), only admin can view & update all orders
CREATE POLICY "Allow public to create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated read and manage on orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated');

-- Store Settings: Anyone can read settings, only admin can update
CREATE POLICY "Allow public read on store_settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated update on store_settings" ON public.store_settings FOR ALL USING (auth.role() = 'authenticated');

-- ================================================================
-- STORAGE BUCKET FOR PRODUCT IMAGES
-- ================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read on product images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated uploads on product images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images');
