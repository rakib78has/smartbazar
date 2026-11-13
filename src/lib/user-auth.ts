// Customer User Authentication & Profile Store (100% Free-Tier Offline-First)

import { UserProfile } from '@/types/user';

const USERS_STORAGE_KEY = 'smartbazar_registered_customers';
const SESSION_STORAGE_KEY = 'smartbazar_customer_session';

// Seed initial demo customer for testing
const initialCustomer: UserProfile = {
  id: 'usr-demo-1',
  name: 'তানভীর আহমেদ',
  phone: '01712345678',
  email: 'tanveer@example.com',
  password: 'customer123',
  defaultAddress: 'বাড়ি # ১২, রোড # ৪, সেক্টর-৩, উত্তরা',
  deliveryCity: 'ঢাকা',
  deliveryZone: 'inside_dhaka',
  createdAt: '2026-11-01T10:00:00Z',
};

/**
 * Get all registered customers
 */
export function getRegisteredCustomers(): UserProfile[] {
  if (typeof window === 'undefined') return [initialCustomer];
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([initialCustomer]));
      return [initialCustomer];
    }
    return JSON.parse(raw);
  } catch {
    return [initialCustomer];
  }
}

/**
 * Register a new customer
 */
export function registerCustomer(data: {
  name: string;
  phone: string;
  password: string;
  email?: string;
  address?: string;
  deliveryZone?: 'inside_dhaka' | 'outside_dhaka';
}): { success: boolean; message: string; user?: UserProfile } {
  const cleanPhone = data.phone.replace(/[\s\-\(\)]/g, '');
  if (!cleanPhone || cleanPhone.length < 11) {
    return { success: false, message: 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)' };
  }
  if (!data.name.trim() || data.name.trim().length < 2) {
    return { success: false, message: 'আপনার সম্পূর্ণ নাম লিখুন' };
  }
  if (!data.password || data.password.length < 6) {
    return { success: false, message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' };
  }

  const existing = getRegisteredCustomers();
  const phoneExists = existing.some(
    (u) => u.phone.replace(/\D/g, '') === cleanPhone.replace(/\D/g, '')
  );

  if (phoneExists) {
    return { success: false, message: 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা আছে!' };
  }

  const newUser: UserProfile = {
    id: `usr-${Date.now()}`,
    name: data.name.trim(),
    phone: cleanPhone,
    email: data.email?.trim() || '',
    password: data.password,
    defaultAddress: data.address?.trim() || '',
    deliveryZone: data.deliveryZone || 'inside_dhaka',
    createdAt: new Date().toISOString(),
  };

  const updated = [newUser, ...existing];
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));
  } catch {}

  return { success: true, message: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!', user: newUser };
}

/**
 * Customer login
 */
export function loginCustomer(
  phoneOrEmail: string,
  password: string
): { success: boolean; message: string; user?: UserProfile } {
  const cleanInput = phoneOrEmail.trim().replace(/[\s\-\(\)]/g, '');
  const customers = getRegisteredCustomers();

  const user = customers.find((u) => {
    const phoneMatch = u.phone.replace(/\D/g, '') === cleanInput.replace(/\D/g, '');
    const emailMatch = u.email && u.email.toLowerCase() === phoneOrEmail.trim().toLowerCase();
    return (phoneMatch || emailMatch) && u.password === password;
  });

  if (!user) {
    return { success: false, message: 'ভুল মোবাইল নম্বর বা পাসওয়ার্ড!' };
  }

  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch {}

  return { success: true, message: 'লগইন সফল হয়েছে!', user };
}

/**
 * Get current logged in customer
 */
export function getCurrentCustomer(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Customer logout
 */
export function logoutCustomer(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {}
}

/**
 * Update customer profile & default address
 */
export function updateCustomerProfile(data: Partial<UserProfile>): UserProfile | null {
  const current = getCurrentCustomer();
  if (!current) return null;

  const updated: UserProfile = {
    ...current,
    ...data,
  };

  try {
    // Update active session
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));

    // Update in registered users list
    const customers = getRegisteredCustomers();
    const updatedList = customers.map((c) => (c.id === updated.id ? updated : c));
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedList));
  } catch {}

  return updated;
}
