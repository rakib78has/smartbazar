'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, CheckCircle2 } from 'lucide-react';
import { initialProducts } from '@/lib/mock-data';
import { Product } from '@/types/product';

interface RecentSale {
  customerName: string;
  city: string;
  timeAgo: string;
  product: Product;
}

const LOCATIONS = [
  { name: 'রাহুল আহমেদ', city: 'মিরপুর, ঢাকা' },
  { name: 'সুমাইয়া তাসনিম', city: 'ধানমন্ডি, ঢাকা' },
  { name: 'আরিফুল ইসলাম', city: 'জিইসি মোড়, চট্টগ্রাম' },
  { name: 'নাফিসা বিনতে', city: 'উত্তরা, ঢাকা' },
  { name: 'তানভীর হাসান', city: 'জিন্দাবাজার, সিলেট' },
  { name: 'মাহমুদ আলম', city: 'গুলশান, ঢাকা' },
  { name: 'সাদিয়া জাহান', city: 'মতিহার, রাজশাহী' },
];

export function SocialProofPopup({ onOpenProduct }: { onOpenProduct?: (p: Product) => void }) {
  const [currentSale, setCurrentSale] = useState<RecentSale | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    const showRandomSale = () => {
      const randomLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const randomProd = initialProducts[Math.floor(Math.random() * initialProducts.length)];
      const randomMins = Math.floor(Math.random() * 8) + 1;

      setCurrentSale({
        customerName: randomLoc.name,
        city: randomLoc.city,
        timeAgo: `${randomMins} মিনিট আগে`,
        product: randomProd,
      });
      setIsVisible(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5500);
    };

    // First popup after 4 seconds
    const initialTimer = setTimeout(showRandomSale, 4000);

    // Subsequent popups every 22 seconds
    const interval = setInterval(showRandomSale, 22000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isDismissed]);

  if (!isVisible || !currentSale || isDismissed) return null;

  return (
    <div
      onClick={() => onOpenProduct && onOpenProduct(currentSale.product)}
      className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-40 bg-white/95 backdrop-blur-md border border-gray-100 hover:border-emerald-200 rounded-2xl p-3 shadow-xl max-w-[320px] sm:max-w-sm flex items-center gap-3 cursor-pointer animate-in slide-in-from-bottom duration-300 group transition-all"
    >
      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
        <img
          src={currentSale.product.images[0]}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
        </div>
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-1 text-[11px] font-bold text-gray-800">
          <span>{currentSale.customerName}</span>
          <span className="text-gray-400 font-normal">• {currentSale.city}</span>
        </div>
        <p className="text-xs text-gray-700 truncate font-medium">
          এইমাত্র <span className="font-bold text-emerald-700">{currentSale.product.name}</span> অর্ডার করেছেন!
        </p>
        <span className="text-[10px] text-gray-400">{currentSale.timeAgo}</span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(false);
          setIsDismissed(true);
        }}
        className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors self-start"
        title="বন্ধ করুন"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
