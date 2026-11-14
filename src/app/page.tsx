'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { SocialProofPopup } from '@/components/SocialProofPopup';
import { SpinWheelModal } from '@/components/SpinWheelModal';
import { FlashSaleCountdown } from '@/components/FlashSaleCountdown';
import { RecentlyViewed, recordProductView } from '@/components/RecentlyViewed';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { WhatsAppCheckoutModal } from '@/components/WhatsAppCheckoutModal';
import { WhatsAppChatWidget } from '@/components/WhatsAppChatWidget';
import { initialProducts, initialCategories } from '@/lib/mock-data';
import { fetchProducts } from '@/lib/db';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { PhoneCall, ShieldCheck, Truck, RefreshCw, Sparkles, MessageCircle } from 'lucide-react';

export default function HomePage() {
  const { storeSettings } = useCart();
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    fetchProducts().then((data) => {
      if (data && data.length > 0) {
        setProducts(data);
      }
    });
  }, []);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [quickBuyProduct, setQuickBuyProduct] = useState<Product | null>(null);
  const [isSpinModalOpen, setIsSpinModalOpen] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price_low' | 'price_high' | 'rating'>('popular');

  // Filter products by search, category, and sort
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    return [...list].sort((a, b) => {
      const priceA = a.discountPrice || a.basePrice;
      const priceB = b.discountPrice || b.basePrice;

      if (sortBy === 'price_low') return priceA - priceB;
      if (sortBy === 'price_high') return priceB - priceA;
      if (sortBy === 'rating') return (b.rating || 4.8) - (a.rating || 4.8);
      return 0; // Default popular
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 dark:text-gray-100 flex flex-col font-sans transition-colors">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full pb-24 md:pb-12">
        {/* Flash Sale Urgency Banner */}
        {storeSettings.enableFlashSaleTimer !== false && <FlashSaleCountdown />}

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shrink-0 transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
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
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Section Header with Sort Selector */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {selectedCategory === 'all'
                ? 'জনপ্রিয় পণ্যসমূহ'
                : initialCategories.find((c) => c.slug === selectedCategory)?.name}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {filteredProducts.length} টি পণ্য পাওয়া গেছে
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-gray-500 hidden sm:inline">সর্ট করুন:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold py-1.5 px-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            >
              <option value="popular">জনপ্রিয় পণ্য</option>
              <option value="price_low">দাম: কম থেকে বেশি</option>
              <option value="price_high">দাম: বেশি থেকে কম</option>
              <option value="rating">সেরা রেটিং</option>
            </select>
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
                onOpenDetails={(p) => {
                  recordProductView(p.id);
                  setActiveModalProduct(p);
                }}
                onQuickBuy={(p) => {
                  recordProductView(p.id);
                  setQuickBuyProduct(p);
                }}
              />
            ))}
          </div>
        )}

        {/* Recently Viewed Products */}
        <RecentlyViewed
          onOpenDetails={(p) => {
            recordProductView(p.id);
            setActiveModalProduct(p);
          }}
        />
      </main>

      {/* Floating Smart WhatsApp Chat Widget with Quick FAQs */}
      <WhatsAppChatWidget />

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
      {storeSettings.enableSocialProofPopup !== false && (
        <SocialProofPopup onOpenProduct={(p) => setActiveModalProduct(p)} />
      )}

      {/* Floating Spin Wheel Trigger */}
      {storeSettings.enableSpinWheelOffers !== false && (
        <button
          onClick={() => setIsSpinModalOpen(true)}
          className="fixed bottom-6 left-6 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-600 text-white font-extrabold text-xs shadow-xl hover:scale-105 active:scale-95 transition-transform group cursor-pointer"
          title="ভাগ্যের চাকা ঘুরিয়ে ডিসকাউন্ট কুপন জিতুন"
        >
          <span className="text-base group-hover:rotate-45 transition-transform">🎁</span>
          <span>ভাগ্যের চাকা</span>
        </button>
      )}

      {/* Spin Wheel Modal */}
      {storeSettings.enableSpinWheelOffers !== false && (
        <SpinWheelModal
          isOpen={isSpinModalOpen}
          onClose={() => setIsSpinModalOpen(false)}
        />
      )}

      {/* 1-Click Quick Order Modal */}
      <WhatsAppCheckoutModal
        isOpen={!!quickBuyProduct}
        onClose={() => setQuickBuyProduct(null)}
        singleItem={
          quickBuyProduct
            ? {
                productId: quickBuyProduct.id,
                variantId: quickBuyProduct.variants[0]?.id,
                productName: quickBuyProduct.name,
                variantName: quickBuyProduct.variants[0]?.name,
                price: quickBuyProduct.discountPrice || quickBuyProduct.basePrice,
                quantity: 1,
                image: quickBuyProduct.images[0],
                maxStock: quickBuyProduct.variants[0]?.stock ?? quickBuyProduct.stock,
              }
            : null
        }
      />

      {/* Sticky Mobile App-Like Navigation */}
      <MobileBottomNav onOpenSpinWheel={() => setIsSpinModalOpen(true)} />
    </div>
  );
}
