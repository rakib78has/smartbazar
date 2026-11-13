'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { OrderItem } from '@/types/order';
import { initialStoreSettings } from '@/lib/mock-data';
import { StoreSettings } from '@/types/store';
import { Coupon, initialCoupons } from '@/types/coupon';
import { trackPixelEvent } from '@/lib/analytics';

export interface CartItem extends OrderItem {
  maxStock: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryZone: 'inside_dhaka' | 'outside_dhaka';
  setDeliveryZone: (zone: 'inside_dhaka' | 'outside_dhaka') => void;
  deliveryCharge: number;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isQuickBuyOpen: boolean;
  setIsQuickBuyOpen: (open: boolean) => void;
  quickBuyItem: CartItem | null;
  setQuickBuyItem: (item: CartItem | null) => void;
  wishlist: string[]; // product IDs
  toggleWishlist: (productId: string) => void;
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: StoreSettings) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryZone, setDeliveryZone] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState(false);
  const [quickBuyItem, setQuickBuyItem] = useState<CartItem | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(initialStoreSettings);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);

  // Load cart & wishlist from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('smartbazar_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem('smartbazar_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const savedSettings = localStorage.getItem('smartbazar_settings');
      if (savedSettings) setStoreSettings(JSON.parse(savedSettings));
    } catch {
      // ignore JSON parse errors in SSR/local
    }
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smartbazar_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smartbazar_wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === newItem.productId && item.variantId === newItem.variantId
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(updated[existingIndex].quantity + newItem.quantity, newItem.maxStock);
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      }
      return [...prev, newItem];
    });
    if (storeSettings.enableMetaPixelTracking !== false) {
      trackPixelEvent('AddToCart', {
        productName: newItem.productName,
        productId: newItem.productId,
        price: newItem.price,
        quantity: newItem.quantity,
      });
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.productId === productId && item.variantId === variantId))
    );
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          return { ...item, quantity: Math.min(quantity, item.maxStock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const updateStoreSettings = (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
    try {
      localStorage.setItem('smartbazar_settings', JSON.stringify(newSettings));
    } catch {}
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Free delivery logic if subtotal >= freeDeliveryThreshold
  const deliveryCharge =
    subtotal >= storeSettings.freeDeliveryThreshold
      ? 0
      : deliveryZone === 'inside_dhaka'
      ? storeSettings.deliveryChargeInsideDhaka
      : storeSettings.deliveryChargeOutsideDhaka;

  // Coupon calculation
  let couponDiscount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrderAmount) {
    if (appliedCoupon.discountType === 'fixed') {
      couponDiscount = appliedCoupon.discountValue;
    } else {
      couponDiscount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    }
  }

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === cleanCode && c.isActive);

    if (!found) {
      return { success: false, message: 'অকার্যকর কুপন কোড!' };
    }
    if (subtotal < found.minOrderAmount) {
      return {
        success: false,
        message: `এই কুপনটি পেতে কমপক্ষে ৳${found.minOrderAmount} টাকার অর্ডার করতে হবে।`,
      };
    }
    setAppliedCoupon(found);
    return { success: true, message: `অভিনন্দন! কুপন প্রয়োগ করা হয়েছে।` };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const total = Math.max(0, subtotal + deliveryCharge - couponDiscount);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        deliveryZone,
        setDeliveryZone,
        deliveryCharge,
        appliedCoupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        total,
        isCartOpen,
        setIsCartOpen,
        isQuickBuyOpen,
        setIsQuickBuyOpen,
        quickBuyItem,
        setQuickBuyItem,
        wishlist,
        toggleWishlist,
        storeSettings,
        updateStoreSettings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
