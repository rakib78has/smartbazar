'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  X,
  User,
  ShoppingBag,
  Heart,
  Truck,
  Gift,
  PhoneCall,
  MessageCircle,
  ShieldCheck,
  Moon,
  Sun,
  Globe,
  Sparkles,
  LogOut,
  ChevronRight,
  Tag,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  Copy,
  Zap,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { initialCategories } from '@/lib/mock-data';
import { initialCoupons, Coupon } from '@/types/coupon';

interface UserSidepaneProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSpinWheel?: () => void;
  onSelectCategory?: (categorySlug: string) => void;
}

export function UserSidepane({
  isOpen,
  onClose,
  onOpenSpinWheel,
  onSelectCategory,
}: UserSidepaneProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { customer, isCustomerLoggedIn, logout } = useCustomerAuth();
  const { totalItems, wishlist, storeSettings, setIsCartOpen } = useCart();
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);

  // Load latest active coupons from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smartbazar_coupons');
      if (saved) {
        setCoupons(JSON.parse(saved));
      }
    } catch {}
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when sidepane is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCopyCoupon = (code: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCoupon(code);
      setTimeout(() => setCopiedCoupon(null), 2500);
    }
  };

  const handleCategoryClick = (slug: string) => {
    if (onSelectCategory) {
      onSelectCategory(slug);
    } else if (pathname === '/') {
      window.dispatchEvent(new CustomEvent('select-category', { detail: slug }));
    } else {
      router.push(`/?category=${slug}`);
    }
    onClose();
  };

  const handleSpinClick = () => {
    onClose();
    if (onOpenSpinWheel) {
      onOpenSpinWheel();
    } else {
      window.dispatchEvent(new CustomEvent('open-spin-wheel'));
      if (pathname !== '/') {
        router.push('/?spin=true');
      }
    }
  };

  const handleOpenCart = () => {
    onClose();
    setIsCartOpen(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-gray-950/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Slide-out Drawer from Left */}
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <aside className="w-screen max-w-sm sm:max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out border-r border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-extrabold text-lg shadow-md group-hover:scale-105 transition-transform">
                SB
              </div>
              <div>
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-gray-900 dark:text-white block group-hover:text-emerald-600 transition-colors">
                  {storeSettings.storeName}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {storeSettings.storeTagline}
                </span>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 scrollbar-thin">
            {/* 1. Profile / Authentication Card */}
            {isCustomerLoggedIn && customer ? (
              <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-white/10 blur-md pointer-events-none" />

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-white text-emerald-800 font-extrabold text-lg flex items-center justify-center shadow-md shrink-0">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm sm:text-base truncate">{customer.name}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" title="লগইন আছেন" />
                    </div>
                    <span className="text-xs text-emerald-100 block">{customer.phone}</span>
                  </div>
                </div>

                {/* Reward Coins Wallet Badge */}
                <div className="bg-white/15 backdrop-blur-md rounded-xl p-2.5 flex items-center justify-between mb-3 border border-white/20">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🪙</span>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-emerald-200 font-bold block">
                        রিওয়ার্ড কয়েন ওয়ালেট
                      </span>
                      <span className="font-black text-sm text-amber-300">
                        {customer.rewardCoins || 0} কয়েন
                      </span>
                    </div>
                  </div>
                  <span className="bg-amber-400/20 text-amber-200 border border-amber-300/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ৳{customer.rewardCoins || 0} ছাড় যোগ্য
                  </span>
                </div>

                {/* Quick Profile Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/15">
                  <Link
                    href="/account"
                    onClick={onClose}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>আমার অ্যাকাউন্ট</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      onClose();
                      router.push('/login');
                    }}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-black/20 hover:bg-black/30 text-white font-bold text-xs transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>লগআউট</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20 rounded-2xl p-4 border border-emerald-200/80 dark:border-emerald-800/50">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm mb-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>স্মার্টবাজারে স্বাগতম!</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                  অ্যাকাউন্ট খুললে পাবেন <strong className="text-emerald-600 dark:text-emerald-400">🪙 ৫০টি ফ্রি রিওয়ার্ড কয়েন (৳৫০ ছাড়)</strong> এবং সুপারফাস্ট চেকআউট!
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors text-center"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>লগইন করুন</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={onClose}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-700 transition-colors text-center"
                  >
                    <span>নতুন অ্যাকাউন্ট</span>
                  </Link>
                </div>
              </div>
            )}

            {/* 2. Quick Shopping Hub Badges */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleOpenCart}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-gray-100 dark:border-gray-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold">শপিং কার্ট</span>
                </div>
                <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
              </button>

              <Link
                href="/track-order"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-gray-100 dark:border-gray-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold">অর্ডার ট্র্যাকিং</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>

              <Link
                href="/account#orders"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-gray-100 dark:border-gray-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold">ক্যাশ মেমো</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>

              <Link
                href="/account#wishlist"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-gray-100 dark:border-gray-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-bold">উইশলিস্ট</span>
                </div>
                <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {wishlist.length}
                </span>
              </Link>
            </div>

            {/* 3. Categories & Shopping Links */}
            <div>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>পণ্য ও ক্যাটাগরি ব্রাউজ করুন</span>
                </span>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => handleCategoryClick('all')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base">🛍️</span>
                    <span>সকল পণ্য (All Products)</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {initialCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.slug)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base">
                        {cat.slug === 'clothing' && '👗'}
                        {cat.slug === 'gadgets' && '📱'}
                        {cat.slug === 'shoes' && '👞'}
                        {cat.slug === 'bags' && '🎒'}
                      </span>
                      <span>{cat.name}</span>
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                      {cat.productCount}টি পণ্য
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Gamification & Offers (Spin Wheel & Coupons) */}
            <div className="bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-purple-500/10 dark:from-amber-950/30 dark:to-purple-950/20 rounded-2xl p-4 border border-amber-200/60 dark:border-amber-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-amber-500" />
                  <span>স্পেশাল অফার ও ডিসকাউন্ট হাব</span>
                </span>
              </div>

              {/* Spin Wheel Trigger */}
              <button
                onClick={handleSpinClick}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-600 text-white font-extrabold text-xs shadow-md hover:scale-[1.02] active:scale-95 transition-transform"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🎁</span>
                  <span>ভাগ্যের চাকা ঘুরিয়ে কুপন জিতুন!</span>
                </div>
                <Zap className="w-3.5 h-3.5 animate-bounce" />
              </button>

              {/* Active Coupons List */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  সক্রিয় কুপন কোডসমূহ:
                </span>
                {coupons
                  .filter((c) => c.isActive)
                  .map((coup) => (
                    <div
                      key={coup.id}
                      className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-700"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3 h-3 text-emerald-600" />
                          <span className="font-mono font-black text-xs text-gray-900 dark:text-gray-100">
                            {coup.code}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500 block">
                          {coup.discountType === 'fixed'
                            ? `৳${coup.discountValue} ছাড় (মিন: ৳${coup.minOrderAmount})`
                            : `${coup.discountValue}% ছাড়`}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyCoupon(coup.code)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          copiedCoupon === coup.code
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        {copiedCoupon === coup.code ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>কপি হয়েছে!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>কপি</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* 5. Customer Support & Contact */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block px-1">
                গ্রাহক সহায়তা ও হেল্পলাইন
              </span>

              <a
                href={`https://wa.me/${storeSettings.primaryWhatsAppNumber}?text=${encodeURIComponent(
                  'হ্যালো স্মার্টবাজার, আমি একটি বিষয়ে জানতে চাই।'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold block">হোয়াটসঅ্যাপে সরাসরি চ্যাট</span>
                    <span className="text-[10px] text-emerald-600/80">দ্রুততম উত্তর পাবেন</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600" />
              </a>

              <a
                href={`tel:${storeSettings.storePhone}`}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold block">হটলাইনে সরাসরি কল</span>
                    <span className="text-[10px] text-gray-500">{storeSettings.storePhone}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </a>
            </div>

            {/* 6. Service Guarantees */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3.5 border border-gray-100 dark:border-gray-800 space-y-2 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>সারা দেশে ক্যাশ অন ডেলিভারি (COD)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>পার্সেল খুলে দেখে পেমেন্ট করার নিশ্চয়তা</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>৭ দিনের মধ্যে সহজ রিটার্ন ও এক্সচেঞ্জ</span>
              </div>
            </div>
          </div>

          {/* Footer Settings & Admin Link */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Language Switch */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="ভাষা পরিবর্তন"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'bn' ? 'বাং' : 'EN'}</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="ডার্ক / লাইট মোড"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>

            {/* Admin Entrance */}
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
              <span>অ্যাডমিন প্যানেল</span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
