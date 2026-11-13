'use client';

import React, { useState, useEffect } from 'react';
import { History, ArrowRight } from 'lucide-react';
import { Product } from '@/types/product';
import { initialProducts } from '@/lib/mock-data';

interface RecentlyViewedProps {
  onOpenDetails: (product: Product) => void;
}

export function RecentlyViewed({ onOpenDetails }: RecentlyViewedProps) {
  const [viewedProducts, setViewedProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('smartbazar_recently_viewed');
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        // Match with initialProducts or DB products
        const matched = ids
          .map((id) => initialProducts.find((p) => p.id === id))
          .filter(Boolean) as Product[];
        setViewedProducts(matched.slice(0, 6));
      }
    } catch {}
  }, []);

  if (viewedProducts.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
            আপনি সম্প্রতি দেখেছেন
          </h3>
        </div>
        <span className="text-xs text-gray-400">{viewedProducts.length} টি পণ্য</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none">
        {viewedProducts.map((p) => {
          const price = p.discountPrice || p.basePrice;
          return (
            <div
              key={p.id}
              onClick={() => onOpenDetails(p)}
              className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-2.5 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer shrink-0 w-64 group"
            >
              <img
                src={p.images[0]}
                alt={p.name}
                className="w-14 h-14 object-cover rounded-xl shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="overflow-hidden flex-1">
                <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-emerald-600">
                  {p.name}
                </h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-black text-xs text-emerald-700 dark:text-emerald-400">
                    ৳{price}
                  </span>
                  {p.discountPrice && (
                    <span className="text-[10px] text-gray-400 line-through">
                      ৳{p.basePrice}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Helper to record a product view into localStorage
 */
export function recordProductView(productId: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('smartbazar_recently_viewed');
    const existing: string[] = raw ? JSON.parse(raw) : [];
    const updated = [productId, ...existing.filter((id) => id !== productId)].slice(0, 10);
    localStorage.setItem('smartbazar_recently_viewed', JSON.stringify(updated));
  } catch {}
}
