'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types/user';
import {
  getCurrentCustomer,
  loginCustomer,
  registerCustomer,
  logoutCustomer,
  updateCustomerProfile,
} from '@/lib/user-auth';

interface CustomerAuthContextType {
  customer: UserProfile | null;
  isCustomerLoggedIn: boolean;
  login: (phoneOrEmail: string, pass: string) => { success: boolean; message: string; user?: UserProfile };
  register: (data: {
    name: string;
    phone: string;
    password: string;
    email?: string;
    address?: string;
    deliveryZone?: 'inside_dhaka' | 'outside_dhaka';
  }) => { success: boolean; message: string; user?: UserProfile };
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<UserProfile | null>(null);

  useEffect(() => {
    const user = getCurrentCustomer();
    if (user) {
      setCustomer(user);
    }
  }, []);

  const login = (phoneOrEmail: string, pass: string) => {
    const res = loginCustomer(phoneOrEmail, pass);
    if (res.success && res.user) {
      setCustomer(res.user);
    }
    return res;
  };

  const register = (data: {
    name: string;
    phone: string;
    password: string;
    email?: string;
    address?: string;
    deliveryZone?: 'inside_dhaka' | 'outside_dhaka';
  }) => {
    const res = registerCustomer(data);
    if (res.success && res.user) {
      setCustomer(res.user);
    }
    return res;
  };

  const logout = () => {
    logoutCustomer();
    setCustomer(null);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    const updated = updateCustomerProfile(data);
    if (updated) {
      setCustomer(updated);
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isCustomerLoggedIn: !!customer,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
