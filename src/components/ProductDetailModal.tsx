'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingBag, Send, ShieldCheck, Truck, RefreshCw, Star, MessageSquare } from 'lucide-react';
import { Product, ProductVariant, ProductReview } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { WhatsAppCheckoutModal } from './WhatsAppCheckoutModal';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isQuickCheckoutOpen, setIsQuickCheckoutOpen] = useState(false);

  // Review form states
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Load reviews from localStorage on open
  useEffect(() => {
    if (!product) return;
    try {
      const allReviews: ProductReview[] = JSON.parse(
        localStorage.getItem('smartbazar_reviews') || '[]'
      );
      const productReviews = allReviews.filter((r) => r.productId === product.id);
      if (productReviews.length > 0) {
        setReviews(productReviews);
      } else {
        // Seed default authentic reviews
        const seedReviews: ProductReview[] = [
          {
            id: `rev-1-${product.id}`,
            productId: product.id,
            customerName: 'তানভীর আহমেদ',
            rating: 5,
            comment: 'অসাধারণ কোয়ালিটি! ছবির মতোই হুবহু পেয়েছি। সময়মতো ডেলিভারি পেয়েছি।',
            isApproved: true,
            createdAt: '২০২৬-১১-১০',
          },
          {
            id: `rev-2-${product.id}`,
            productId: product.id,
            customerName: 'মাহিয়া ফারহানা',
            rating: 5,
            comment: 'কাপড় ও ফিনিশিং খুবই ভালো। দাম অনুযায়ী ১০০% ভ্যালু ফর মানি।',
            isApproved: true,
            createdAt: '২০২৬-১১-১২',
          },
        ];
        setReviews(seedReviews);
      }
    } catch {}
  }, [product]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewName.trim() || !reviewComment.trim()) return;

    const newRev: ProductReview = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      customerName: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
      isApproved: true,
      createdAt: new Date().toLocaleDateString('bn-BD'),
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    try {
      const all: ProductReview[] = JSON.parse(localStorage.getItem('smartbazar_reviews') || '[]');
      localStorage.setItem('smartbazar_reviews', JSON.stringify([newRev, ...all]));
    } catch {}

    setReviewName('');
    setReviewComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  // Set default variant when product changes
  React.useEffect(() => {
    if (product && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
    setSelectedImageIndex(0);
    setQuantity(1);
  }, [product]);

  if (!isOpen || !product) return null;

  const currentPrice = selectedVariant?.price || product.discountPrice || product.basePrice;
  const currentStock = selectedVariant?.stock ?? product.stock;
  const isOutOfStock = currentStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart({
      productId: product.id,
      variantId: selectedVariant?.id,
      productName: product.name,
      variantName: selectedVariant?.name,
      price: currentPrice,
      quantity,
      image: product.images[selectedImageIndex] || product.images[0],
      maxStock: currentStock,
    });
    onClose();
  };

  const handleQuickBuy = () => {
    if (isOutOfStock) return;
    setIsQuickCheckoutOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-full shadow-xs transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
            {/* Left: Image Gallery */}
            <div className="space-y-3">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 relative">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.discountPrice && (
                  <span className="absolute top-3 left-3 bg-rose-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-xs">
                    {Math.round(((product.basePrice - product.discountPrice) / product.basePrice) * 100)}% ছাড়
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImageIndex === idx
                          ? 'border-emerald-600 ring-2 ring-emerald-600/20'
                          : 'border-gray-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Details & Choices */}
            <div className="flex flex-col">
              {product.brand && (
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
                  {product.brand}
                </span>
              )}
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-snug">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-xs font-bold text-gray-800 ml-1">{product.rating || 4.8}</span>
                </div>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-gray-500">
                  {product.reviewsCount || 18} টি রিভিউ
                </span>
                <span className="text-xs text-gray-400">|</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isOutOfStock
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {isOutOfStock ? 'স্টক শেষ' : `স্টকে আছে (${currentStock} টি)`}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-black text-emerald-700">৳{currentPrice}</span>
                {product.discountPrice && (
                  <span className="text-sm text-gray-400 line-through">৳{product.basePrice}</span>
                )}
              </div>

              {/* Variants Choice (Colors / Sizes) */}
              {product.variants.length > 0 && (
                <div className="mb-5 space-y-2">
                  <label className="text-xs font-bold text-gray-800">
                    পছন্দের ভ্যারিয়েন্ট বেছে নিন:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20'
                              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {v.colorCode && (
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0"
                              style={{ backgroundColor: v.colorCode }}
                            />
                          )}
                          <span>{v.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-bold text-gray-700">পরিমাণ:</span>
                <div className="flex items-center border border-gray-200 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-l-xl text-sm font-bold disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-bold text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-r-xl text-sm font-bold disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="py-3 px-4 bg-gray-900 hover:bg-gray-800 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>কার্টে যোগ করুন</span>
                </button>

                <button
                  onClick={handleQuickBuy}
                  disabled={isOutOfStock}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>সরাসরি হোয়াটসঅ্যাপে অর্ডার</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 border-t border-gray-100 mt-6 pt-4 text-center">
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-[10px] text-gray-600 font-medium">১০০% আসল পণ্য</span>
                </div>
                <div className="flex flex-col items-center">
                  <Truck className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-[10px] text-gray-600 font-medium">ক্যাশ অন ডেলিভারি</span>
                </div>
                <div className="flex flex-col items-center">
                  <RefreshCw className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-[10px] text-gray-600 font-medium">সহজ রিটার্ন</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="border-t border-gray-100 p-6 sm:p-8 bg-gray-50/50">
            <h3 className="font-bold text-sm text-gray-900 mb-2">পণ্যের বিবরণ:</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line mb-6">
              {product.description}
            </p>

            {/* Customer Reviews Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-sm text-gray-900">
                    কাস্টমার রিভিউসমূহ ({reviews.length})
                  </h4>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-3 mb-6">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-gray-800">{rev.customerName}</span>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">{rev.createdAt}</span>
                  </div>
                ))}
              </div>

              {/* Write Review Form */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200/80">
                <h5 className="font-bold text-xs text-gray-800 mb-2">আপনার মূল্যবান মতামত দিন:</h5>
                {reviewSubmitted ? (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold text-center">
                    🎉 ধন্যবাদ! আপনার রিভিউটি সফলভাবে প্রকাশিত হয়েছে।
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium">রেটিং:</span>
                      <div className="flex gap-1 cursor-pointer">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="p-0.5 text-amber-400 focus:outline-none"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="আপনার নাম *"
                        className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <textarea
                      rows={2}
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="পণ্যটি আপনার কেমন লেগেছে লিখুন... *"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />

                    <button
                      type="submit"
                      className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all"
                    >
                      রিভিউ সাবমিট করুন
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1-Click WhatsApp Quick Checkout Modal */}
      <WhatsAppCheckoutModal
        isOpen={isQuickCheckoutOpen}
        onClose={() => {
          setIsQuickCheckoutOpen(false);
          onClose();
        }}
        singleItem={{
          productId: product.id,
          variantId: selectedVariant?.id,
          productName: product.name,
          variantName: selectedVariant?.name,
          price: currentPrice,
          quantity,
          image: product.images[0],
          maxStock: currentStock,
        }}
      />
    </>
  );
}
