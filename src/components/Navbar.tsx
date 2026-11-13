'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, Search, PhoneCall, ShieldCheck, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export function Navbar({ onSearch }: NavbarProps) {
  const { totalItems, wishlist, storeSettings, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) onSearch(query);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      {/* Top Announcement Bar */}
      {storeSettings.announcementActive && (
        <div className="bg-emerald-600 text-white text-xs sm:text-sm py-1.5 px-4 text-center font-medium tracking-wide">
          <span>{storeSettings.announcementText}</span>
        </div>
      )}

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-gray-700 hover:text-emerald-600 sm:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                SB
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl sm:text-2xl text-gray-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                  {storeSettings.storeName}
                </span>
                <span className="text-[10px] text-gray-500 hidden sm:block">
                  {storeSettings.storeTagline}
                </span>
              </div>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="পণ্য সার্চ করুন (যেমন: টি-শার্ট, ওয়াচ)..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Actions & Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* WhatsApp Contact Button */}
            <a
              href={`https://wa.me/${storeSettings.primaryWhatsAppNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>সহায়তা</span>
            </a>

            {/* Wishlist Button */}
            <div className="relative">
              <button
                className="p-2 text-gray-700 hover:text-emerald-600 rounded-full hover:bg-gray-100 transition-colors"
                title="পছন্দের তালিকা"
              >
                <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-medium shadow-sm hover:shadow transition-all group"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-semibold hidden sm:inline">কার্ট</span>
              {totalItems > 0 && (
                <span className="w-5 h-5 bg-white text-emerald-700 font-extrabold text-xs rounded-full flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Admin Panel Link */}
            <Link
              href="/admin"
              className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              title="অ্যাডমিন প্যানেল"
            >
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="পণ্য সার্চ করুন..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
