'use client';

import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Check, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { WhatsAppCheckoutModal } from './WhatsAppCheckoutModal';

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    deliveryZone,
    setDeliveryZone,
    deliveryCharge,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    total,
    storeSettings,
  } = useCart();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponMsg({ text: res.message, isError: !res.success });
  };

  if (!isCartOpen) return null;

  const remainingForFreeDelivery = storeSettings.freeDeliveryThreshold - subtotal;
  const freeDeliveryPercent = Math.min(
    100,
    Math.round((subtotal / storeSettings.freeDeliveryThreshold) * 100)
  );

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col text-gray-900 dark:text-gray-100">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">শপিং ব্যাগ ({cart.length})</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Delivery Progress Bar */}
            <div className="bg-emerald-50/60 p-3.5 border-b border-emerald-100/60">
              {remainingForFreeDelivery > 0 ? (
                <p className="text-xs text-emerald-800 font-medium mb-1.5">
                  আর <span className="font-bold text-emerald-900">৳{remainingForFreeDelivery}</span> টাকার পণ্য কিনলে <span className="font-bold underline">ফ্রি ডেলিভারি</span> পাবেন!
                </p>
              ) : (
                <p className="text-xs text-emerald-700 font-bold mb-1.5">
                  🎉 অভিনন্দন! আপনি সারা দেশে ফ্রি ডেলিভারি পাচ্ছেন!
                </p>
              )}
              <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${freeDeliveryPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">আপনার কার্ট খালি</h3>
                  <p className="text-xs text-gray-500 mb-4">পছন্দের পণ্য কার্টে যুক্ত করুন।</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    শপিং চালিয়ে যান
                  </button>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div
                    key={`${item.productId}-${item.variantId || index}`}
                    className="flex gap-3.5 pb-4 border-b border-gray-100 last:border-0"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-xl bg-gray-50 shrink-0 border border-gray-100"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-gray-900 line-clamp-1">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.variantId)}
                          className="text-gray-400 hover:text-rose-500 p-0.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.variantName && (
                        <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                          ভ্যারিয়েন্ট: {item.variantName}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1, item.variantId)
                            }
                            className="p-1 hover:bg-gray-100 text-gray-600 rounded-l-lg transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1, item.variantId)
                            }
                            className="p-1 hover:bg-gray-100 text-gray-600 rounded-r-lg transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-emerald-700">
                          ৳{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Summary */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/70 space-y-3">
                {/* Zone Picker */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-700 mb-1.5">
                    <span>ডেলিভারি এলাকা:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDeliveryZone('inside_dhaka')}
                      className={`py-1.5 px-2 text-xs rounded-lg border font-medium transition-all ${
                        deliveryZone === 'inside_dhaka'
                          ? 'border-emerald-600 bg-white text-emerald-800 shadow-xs'
                          : 'border-gray-200 text-gray-600 hover:bg-white'
                      }`}
                    >
                      ঢাকার ভেতরে (৳{storeSettings.deliveryChargeInsideDhaka})
                    </button>
                    <button
                      onClick={() => setDeliveryZone('outside_dhaka')}
                      className={`py-1.5 px-2 text-xs rounded-lg border font-medium transition-all ${
                        deliveryZone === 'outside_dhaka'
                          ? 'border-emerald-600 bg-white text-emerald-800 shadow-xs'
                          : 'border-gray-200 text-gray-600 hover:bg-white'
                      }`}
                    >
                      ঢাকার বাইরে (৳{storeSettings.deliveryChargeOutsideDhaka})
                    </button>
                  </div>
                </div>

                {/* Coupon Code Section */}
                <div className="pt-2 border-t border-gray-200">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-xl text-xs text-emerald-800">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Tag className="w-3.5 h-3.5" />
                        <span>কুপন '{appliedCoupon.code}': -৳{couponDiscount}</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-[11px] font-semibold text-rose-600 hover:underline"
                      >
                        বাতিল
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="কুপন কোড (যেমন: SAVE50)..."
                        className="flex-1 px-3 py-1.5 text-xs uppercase bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors"
                      >
                        প্রয়োগ
                      </button>
                    </form>
                  )}
                  {couponMsg && !appliedCoupon && (
                    <p
                      className={`text-[11px] mt-1 flex items-center gap-1 ${
                        couponMsg.isError ? 'text-rose-500' : 'text-emerald-600'
                      }`}
                    >
                      <AlertCircle className="w-3 h-3" />
                      {couponMsg.text}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-xs pt-2 border-t border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>সাবটোটাল</span>
                    <span>৳{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>ডেলিভারি চার্জ</span>
                    <span>{deliveryCharge === 0 ? 'ফ্রি' : `৳${deliveryCharge}`}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>কুপন ডিসকাউন্ট</span>
                      <span>-৳{couponDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-1 border-t border-gray-200">
                    <span>সর্বমোট</span>
                    <span className="text-emerald-700">৳{total}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <span>অর্ডার করুন (WhatsApp)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <WhatsAppCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setIsCartOpen(false);
        }}
      />
    </>
  );
}
