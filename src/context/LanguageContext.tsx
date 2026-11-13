'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'bn' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  bn: {
    home: 'হোম',
    cart: 'কার্ট',
    wishlist: 'পছন্দের তালিকা',
    trackOrder: 'ট্র্যাক অর্ডার',
    help: 'সহায়তা',
    adminPanel: 'অ্যাডমিন প্যানেল',
    searchPlaceholder: 'পণ্য সার্চ করুন (যেমন: টি-শার্ট, ওয়াচ)...',
    allProducts: 'সব পণ্য',
    heroTag: '১০০% ক্যাশ অন ডেলিভারি এবং সহজ রিটার্ন',
    heroTitle: 'সেরা মানের পণ্য, সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন!',
    heroSubtitle: 'পছন্দের সাইজ ও কালার বেছে নিন, কোনো জটিল রেজিস্ট্রেশন বা পেমেন্ট গেটওয়ের ঝামেলা ছাড়াই এক ক্লিকে অর্ডার কনফার্ম করুন।',
    freeDelivery: 'সারা দেশে হোম ডেলিভারি',
    inspectBeforePay: 'দেখে শুনে মূল্য পরিশোধ',
    easyReturn: '৭ দিনের রিপ্লেসমেন্ট',
    spinWheel: 'ভাগ্যের চাকা',
    orderNow: 'অর্ডার করুন',
    details: 'বিস্তারিত',
    inStock: 'স্টকে আছে',
    outOfStock: 'স্টক শেষ',
    subtotal: 'সাবটোটাল',
    deliveryCharge: 'ডেলিভারি চার্জ',
    total: 'সর্বমোট',
    applyCoupon: 'কুপন প্রয়োগ করুন',
    emptyCart: 'আপনার কার্ট খালি',
    themeToggle: 'ডার্ক মোড পরিবর্তন করুন',
    langToggle: 'ভাষা পরিবর্তন করুন',
  },
  en: {
    home: 'Home',
    cart: 'Cart',
    wishlist: 'Wishlist',
    trackOrder: 'Track Order',
    help: 'Support',
    adminPanel: 'Admin Panel',
    searchPlaceholder: 'Search products (e.g. T-Shirt, Watch)...',
    allProducts: 'All Products',
    heroTag: '100% Cash on Delivery & Easy Returns',
    heroTitle: 'Premium Products, Order Directly on WhatsApp!',
    heroSubtitle: 'Choose your preferred size and color, order in one click without complicated account registration.',
    freeDelivery: 'Home Delivery Nationwide',
    inspectBeforePay: 'Cash on Delivery Guarantee',
    easyReturn: '7-Day Easy Replacement',
    spinWheel: 'Spin & Win',
    orderNow: 'Order Now',
    details: 'Details',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    subtotal: 'Subtotal',
    deliveryCharge: 'Delivery Charge',
    total: 'Total',
    applyCoupon: 'Apply Coupon',
    emptyCart: 'Your cart is empty',
    themeToggle: 'Toggle Dark Mode',
    langToggle: 'Switch Language',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('bn');

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('smartbazar_language') as Language;
      if (savedLang === 'bn' || savedLang === 'en') {
        setLanguageState(savedLang);
      }
    } catch {}
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('smartbazar_language', lang);
    } catch {}
  };

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
