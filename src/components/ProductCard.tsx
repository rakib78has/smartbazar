'use client';

import React from 'react';
import { Heart, Star, ShoppingBag, Eye, Zap, Flame } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  onQuickBuy?: (product: Product) => void;
}

export function ProductCard({ product, onOpenDetails, onQuickBuy }: ProductCardProps) {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const isWishlisted = wishlist.includes(product.id);

  const price = product.discountPrice || product.basePrice;
  const discountPercent = product.discountPrice
    ? Math.round(((product.basePrice - product.discountPrice) / product.basePrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: product.id,
      variantId: product.variants[0]?.id,
      productName: product.name,
      variantName: product.variants[0]?.name,
      price,
      quantity: 1,
      image: product.images[0],
      maxStock: product.variants[0]?.stock ?? product.stock,
    });
  };

  const handleDirectOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickBuy) {
      onQuickBuy(product);
    } else {
      onOpenDetails(product);
    }
  };

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-700 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer relative"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
          alt={product.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-rose-500 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-xs">
            -{discountPercent}%
          </span>
        )}

        {/* Low Stock Urgency Badge */}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute bottom-3 left-3 bg-rose-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 z-10 animate-pulse">
            <Flame className="w-3 h-3 text-amber-300" />
            <span>মাত্র {product.stock} টি বাকি!</span>
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
            isWishlisted
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/80 backdrop-blur-xs text-gray-600 hover:bg-white hover:text-rose-500 shadow-xs'
          }`}
          title="পছন্দের তালিকায় রাখুন"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Quick View Overlay Button */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="w-full py-2 bg-white/90 backdrop-blur-xs hover:bg-white text-gray-900 font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>বিস্তারিত দেখুন</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium mb-1.5">
            <span>{product.brand || 'জনপ্রিয় পণ্য'}</span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating || 4.8}</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-xs sm:text-sm text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors mb-2">
            {product.name}
          </h3>

          {/* Variant Notice */}
          {product.variants.length > 0 && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
              {product.variants.length} টি সাইজ / কালার অপশন
            </p>
          )}
        </div>

        <div>
          {/* Price & Action */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="font-black text-sm sm:text-base text-gray-900 dark:text-white">৳{price}</span>
                {product.discountPrice && (
                  <span className="text-[11px] text-gray-400 line-through">
                    ৳{product.basePrice}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleQuickAdd}
                className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl transition-all shadow-2xs"
                title="কার্টে যোগ করুন"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>

              <button
                onClick={handleDirectOrder}
                className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                title="সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>অর্ডার করুন</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
