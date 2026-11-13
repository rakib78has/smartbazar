'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gift, ShoppingBag, Truck, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

interface MobileBottomNavProps {
  onOpenSpinWheel?: () => void;
}

export function MobileBottomNav({ onOpenSpinWheel }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { isCustomerLoggedIn, customer } = useCustomerAuth();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200/80 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden">
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors ${
            pathname === '/'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">হোম</span>
        </Link>

        {/* Offers / Spin Wheel */}
        <button
          onClick={onOpenSpinWheel}
          className="flex flex-col items-center justify-center gap-1 py-1 text-gray-500 dark:text-gray-400 hover:text-amber-500 transition-colors"
        >
          <Gift className="w-5 h-5 text-amber-500" />
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">অফার</span>
        </button>

        {/* Cart */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center gap-1 py-1 text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px]">কার্ট</span>
        </button>

        {/* Track Order */}
        <Link
          href="/track-order"
          className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors ${
            pathname === '/track-order'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px]">ট্র্যাক</span>
        </Link>

        {/* Customer Account / Profile */}
        <Link
          href={isCustomerLoggedIn ? '/account' : '/login'}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors ${
            pathname === '/account' || pathname === '/login' || pathname === '/register'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] truncate max-w-[50px]">
            {isCustomerLoggedIn && customer ? customer.name.split(' ')[0] : 'অ্যাকাউন্ট'}
          </span>
        </Link>
      </div>
    </nav>
  );
}
