import { supabase, isSupabaseConfigured } from './supabase';
import { Product } from '@/types/product';
import { Order, OrderStatus } from '@/types/order';
import { StoreSettings } from '@/types/store';
import { initialProducts, initialOrders, initialStoreSettings } from './mock-data';

export async function fetchProducts(): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          shortDescription: item.short_description,
          description: item.description,
          category: item.category,
          brand: item.brand,
          basePrice: Number(item.base_price),
          discountPrice: item.discount_price ? Number(item.discount_price) : undefined,
          costPrice: item.cost_price ? Number(item.cost_price) : undefined,
          images: item.images || [],
          variants: item.variants || [],
          tags: item.tags || [],
          isPublished: item.is_published,
          isFeatured: item.is_featured,
          stock: item.stock,
          rating: Number(item.rating || 5),
          reviewsCount: item.reviews_count || 0,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage', err);
    }
  }

  // Fallback to localStorage or seed
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('smartbazar_admin_products');
      if (saved) return JSON.parse(saved);
    } catch {}
  }
  return initialProducts;
}

export async function saveProductToDb(product: Product): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('products').insert([
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          short_description: product.shortDescription,
          description: product.description,
          category: product.category,
          brand: product.brand,
          base_price: product.basePrice,
          discount_price: product.discountPrice,
          cost_price: product.costPrice,
          images: product.images,
          variants: product.variants,
          tags: product.tags,
          is_published: product.isPublished,
          is_featured: product.isFeatured,
          stock: product.stock,
          rating: product.rating,
          reviews_count: product.reviewsCount,
        },
      ]);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase insert failed', err);
    }
  }
  return false;
}

export async function deleteProductFromDb(productId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (!error) return true;
    } catch {}
  }
  return false;
}

export async function fetchOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          orderNumber: item.order_number,
          customerName: item.customer_name,
          customerPhone: item.customer_phone,
          deliveryAddress: item.delivery_address,
          deliveryCity: item.delivery_city,
          deliveryZone: item.delivery_zone,
          notes: item.notes,
          items: item.items || [],
          subtotal: Number(item.subtotal),
          deliveryCharge: Number(item.delivery_charge),
          discount: Number(item.discount || 0),
          total: Number(item.total),
          status: item.status as OrderStatus,
          courierTrackingCode: item.courier_tracking_code,
          courierName: item.courier_name,
          channel: item.channel || 'whatsapp',
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));
      }
    } catch {}
  }

  // Fallback to localStorage or seed
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('smartbazar_orders');
      if (saved) return JSON.parse(saved);
    } catch {}
  }
  return initialOrders;
}

export async function saveOrderToDb(order: Order): Promise<boolean> {
  // Always persist locally
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('smartbazar_orders');
      const existing: Order[] = saved ? JSON.parse(saved) : initialOrders;
      const filtered = existing.filter((o) => o.id !== order.id);
      localStorage.setItem('smartbazar_orders', JSON.stringify([order, ...filtered]));
    } catch {}
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('orders').insert([
        {
          id: order.id,
          order_number: order.orderNumber,
          customer_name: order.customerName,
          customer_phone: order.customerPhone,
          delivery_address: order.deliveryAddress,
          delivery_city: order.deliveryCity,
          delivery_zone: order.deliveryZone,
          notes: order.notes,
          items: order.items,
          subtotal: order.subtotal,
          delivery_charge: order.deliveryCharge,
          discount: order.discount,
          total: order.total,
          status: order.status,
          courier_tracking_code: order.courierTrackingCode,
          courier_name: order.courierName,
          channel: order.channel,
        },
      ]);
      if (!error) return true;
    } catch {}
  }
  return true;
}

export async function updateOrderStatusInDb(orderId: string, status: OrderStatus): Promise<boolean> {
  // Update in localStorage
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('smartbazar_orders');
      const existing: Order[] = saved ? JSON.parse(saved) : initialOrders;
      const updated = existing.map((o) =>
        o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
      );
      localStorage.setItem('smartbazar_orders', JSON.stringify(updated));
    } catch {}
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (!error) return true;
    } catch {}
  }
  return true;
}

/**
 * Uploads an image file to Supabase Storage bucket 'product-images' and returns the public URL
 */
export async function uploadImageFile(file: File): Promise<string | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error } = await supabase.storage.from('product-images').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) {
        console.error('Image upload failed:', error);
        return null;
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.error('Image upload error:', err);
    }
  }
  return null;
}
