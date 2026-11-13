'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { SocialProofPopup } from '@/components/SocialProofPopup';
import { SpinWheelModal } from '@/components/SpinWheelModal';
import { initialProducts, initialCategories } from '@/lib/mock-data';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { PhoneCall, ShieldCheck, Truck, RefreshCw, Sparkles, MessageCircle } from 'lucide-react';

export default function HomePage() {
  const { storeSettings } = useCart();
  const { t, language } = useLanguage();
  const [products] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [isSpinModalOpen, setIsSpinModalOpen] = useState<boolean>(false);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      <Navbar onSearch={(q) => setSearchQuery(q)} />
      <CartDrawer />

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-br from-emerald-900 via-teal-900 to-gray-950 text-white relative overflow-hidden py-12 sm:py-16">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-4 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('heroTag')}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4">
              {language === 'bn' ? (
                <>সেরা মানের পণ্য, সরাসরি <span className="text-emerald-400">হোয়াটসঅ্যাপে</span> অর্ডার করুন!</>
              ) : (
                <>Premium Products, Order Directly on <span className="text-emerald-400">WhatsApp!</span></>
              )}
            </h1>
            
            <p className="text-sm sm:text-base text-gray-300 mb-8 leading-relaxed">
              {t('heroSubtitle')}
            </p>

            {/* Quick Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/10 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('freeDelivery')}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('inspectBeforePay')}</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('easyReturn')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shrink-0 transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {t('allProducts')} ({products.length})
          </button>

          {initialCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shrink-0 transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight">
              {selectedCategory === 'all'
                ? 'জনপ্রিয় পণ্যসমূহ'
                : initialCategories.find((c) => c.slug === selectedCategory)?.name}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {filteredProducts.length} টি পণ্য পাওয়া গেছে
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs">
            <p className="text-gray-500 text-sm mb-2">
              দুঃখিত, আপনার সার্চের সাথে মিল রেখে কোনো পণ্য পাওয়া যায়নি।
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              সকল পণ্য পুনরায় দেখুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={(p) => setActiveModalProduct(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating WhatsApp Contact Button */}
      <a
        href={`https://wa.me/${storeSettings.primaryWhatsAppNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition-all group"
        title="হোয়াটসঅ্যাপে কথা বলুন"
      >
        <MessageCircle className="w-6 h-6 fill-white text-white" />
        <span className="font-bold text-xs sm:text-sm hidden sm:inline">WhatsApp Help</span>
      </a>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  SB
                </div>
                <span className="font-bold text-lg text-gray-900">{storeSettings.storeName}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                {storeSettings.storeTagline}। বিশ্বস্ততার সাথে সেরা পণ্য কাস্টমারদের কাছে পৌঁছে দেওয়াই আমাদের লক্ষ্য।
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>হটলাইন: {storeSettings.storePhone}</span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-3">
                ডেলিভারি তথ্য
              </h3>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>ঢাকার ভেতরে: ৳{storeSettings.deliveryChargeInsideDhaka} (১-২ দিন)</li>
                <li>ঢাকার বাইরে: ৳{storeSettings.deliveryChargeOutsideDhaka} (২-৩ দিন)</li>
                <li className="text-emerald-700 font-semibold">
                  ৳{storeSettings.freeDeliveryThreshold}+ অর্ডারে ফ্রি ডেলিভারি!
                </li>
                <li>ক্যাশ অন ডেলিভারি প্রযোজ্য</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-3">
                সহায়তা ও সেবা
              </h3>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>
                  <Link href="/track-order" className="text-emerald-700 font-bold hover:underline flex items-center gap-1">
                    <span>📦 অর্ডার ট্র্যাক করুন</span>
                  </Link>
                </li>
                <li>৭ দিনের মধ্যে পণ্য রিটার্ন সুবিধা</li>
                <li>১০০% জেনুইন পণ্যের নিশ্চয়তা</li>
                <li>হোম ডেলিভারিতে পার্সেল চেক করে গ্রহণের সুযোগ</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-3">
                অফিস ঠিকানা
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-2">
                {storeSettings.storeAddress}
              </p>
              <p className="text-xs text-gray-500">ইমেইল: {storeSettings.storeEmail}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} {storeSettings.storeName}. সর্বস্বত্ব সংরক্ষিত।
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={activeModalProduct}
        isOpen={!!activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
      />

      {/* Live Sales Social Proof Popup */}
      <SocialProofPopup onOpenProduct={(p) => setActiveModalProduct(p)} />

      {/* Floating Spin Wheel Trigger */}
      <button
        onClick={() => setIsSpinModalOpen(true)}
        className="fixed bottom-6 left-6 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-600 text-white font-extrabold text-xs shadow-xl hover:scale-105 active:scale-95 transition-transform group cursor-pointer"
        title="ভাগ্যের চাকা ঘুরিয়ে ডিসকাউন্ট কুপন জিতুন"
      >
        <span className="text-base group-hover:rotate-45 transition-transform">🎁</span>
        <span>ভাগ্যের চাকা</span>
      </button>

      {/* Spin Wheel Modal */}
      <SpinWheelModal
        isOpen={isSpinModalOpen}
        onClose={() => setIsSpinModalOpen(false)}
      />
    </div>
  );
}
