'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, ShieldCheck, AlertCircle, CheckCircle2, Copy, Check, Clock } from 'lucide-react';
import { useCart, CartItem } from '@/context/CartContext';
import { orderFormSchema } from '@/lib/validation';
import { generateWhatsAppOrderUrl } from '@/lib/whatsapp';
import { Order } from '@/types/order';
import { saveOrderToDb } from '@/lib/db';
import { playSuccessChime, triggerConfetti } from '@/lib/celebration';
import { trackPixelEvent } from '@/lib/analytics';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

interface WhatsAppCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  singleItem?: CartItem | null; // For 1-Click Direct Buy
}

export function WhatsAppCheckoutModal({
  isOpen,
  onClose,
  singleItem,
}: WhatsAppCheckoutModalProps) {
  const {
    cart,
    subtotal,
    deliveryZone,
    setDeliveryZone,
    deliveryCharge,
    appliedCoupon,
    couponDiscount,
    total,
    storeSettings,
    clearCart,
  } = useCart();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [paymentTrxId, setPaymentTrxId] = useState('');
  const [paymentSenderPhone, setPaymentSenderPhone] = useState('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('যেকোনো সময়');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Anti-bot field
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [useCoins, setUseCoins] = useState(false);

  const { customer, updateProfile } = useCustomerAuth();
  const availableCoins = customer?.rewardCoins ?? 0;

  // Auto-fill logged-in customer info if available
  useEffect(() => {
    if (isOpen && customer) {
      if (!name) setName(customer.name);
      if (!phone) setPhone(customer.phone);
      if (!address && customer.defaultAddress) setAddress(customer.defaultAddress);
      if (customer.deliveryZone) setDeliveryZone(customer.deliveryZone);
    }
  }, [isOpen, customer]);

  // Determine active checkout items
  const activeItems = singleItem ? [singleItem] : cart;
  const activeSubtotal = singleItem ? singleItem.price * singleItem.quantity : subtotal;
  const activeDeliveryCharge =
    activeSubtotal >= storeSettings.freeDeliveryThreshold
      ? 0
      : deliveryZone === 'inside_dhaka'
      ? storeSettings.deliveryChargeInsideDhaka
      : storeSettings.deliveryChargeOutsideDhaka;
  const coinDiscount = useCoins ? Math.min(availableCoins, activeSubtotal) : 0;
  const activeDiscount = (singleItem ? 0 : couponDiscount) + coinDiscount;
  const activeTotal = Math.max(0, activeSubtotal + activeDeliveryCharge - activeDiscount);

  useEffect(() => {
    if (isOpen && storeSettings.enableMetaPixelTracking !== false) {
      trackPixelEvent('InitiateCheckout', {
        value: activeTotal,
        currency: 'BDT',
        itemsCount: activeItems.length,
      });
    }
  }, [isOpen, activeTotal, activeItems.length, storeSettings.enableMetaPixelTracking]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Sanitize phone number (strip spaces, dashes, parentheses)
    const sanitizedPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Validate using Zod schema
    const validation = orderFormSchema.safeParse({
      customerName: name,
      customerPhone: sanitizedPhone,
      deliveryAddress: address,
      deliveryZone,
      notes,
      honeypot,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        fieldErrors[fieldName] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Security check: Honeypot must be empty
    if (honeypot && honeypot.length > 0) {
      console.warn('Spam bot blocked by honeypot');
      return;
    }

    setIsSubmitting(true);

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const zoneText = deliveryZone === 'inside_dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে';

    // 1. Build WhatsApp URL
    const whatsappUrl = generateWhatsAppOrderUrl(storeSettings.primaryWhatsAppNumber, {
      orderNumber,
      customerName: name,
      customerPhone: sanitizedPhone,
      deliveryAddress: address,
      deliveryZoneText: zoneText,
      items: activeItems,
      subtotal: activeSubtotal,
      deliveryCharge: activeDeliveryCharge,
      discount: activeDiscount,
      total: activeTotal,
      notes: notes.trim(),
      paymentMethod,
      paymentTrxId: paymentTrxId.trim(),
      paymentSenderPhone: paymentSenderPhone.trim(),
      deliveryTimeSlot: deliveryTimeSlot !== 'যেকোনো সময়' ? deliveryTimeSlot : undefined,
    });

    // 2. Save Order to DB (Supabase & localStorage for Admin Panel pipeline)
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: name,
      customerPhone: sanitizedPhone,
      deliveryAddress: address,
      deliveryZone,
      notes: notes.trim(),
      items: activeItems,
      subtotal: activeSubtotal,
      deliveryCharge: activeDeliveryCharge,
      discount: activeDiscount,
      total: activeTotal,
      status: 'pending',
      channel: 'whatsapp',
      paymentMethod,
      paymentTrxId: paymentTrxId.trim(),
      paymentSenderPhone: paymentSenderPhone.trim(),
      deliveryTimeSlot: deliveryTimeSlot !== 'যেকোনো সময়' ? deliveryTimeSlot : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveOrderToDb(newOrder);
    try {
      const existingOrders: Order[] = JSON.parse(
        localStorage.getItem('smartbazar_orders') || '[]'
      );
      localStorage.setItem('smartbazar_orders', JSON.stringify([newOrder, ...existingOrders]));
    } catch {}

    // Deduct redeemed coins if used
    if (useCoins && coinDiscount > 0 && updateProfile) {
      updateProfile({
        rewardCoins: Math.max(0, availableCoins - coinDiscount),
      });
    }

    // 3. Clear cart if full cart checkout
    if (!singleItem) {
      clearCart();
    }

    // Trigger celebration sound and confetti if enabled
    if (storeSettings.enableOrderCelebration !== false) {
      playSuccessChime();
      triggerConfetti();
    }

    // Track Meta Pixel and GA4 Purchase event
    if (storeSettings.enableMetaPixelTracking !== false) {
      trackPixelEvent('Purchase', {
        orderId: orderNumber,
        currency: 'BDT',
        value: activeTotal,
        itemsCount: activeItems.length,
      });
    }

    setIsSubmitting(false);
    setIsSuccess(true);

    // 4. Open WhatsApp
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 400);
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100 p-6 sm:p-8 relative">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              🎉 অর্ডার হোয়াটসঅ্যাপে পাঠানো হয়েছে!
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-6">
              হোয়াটসঅ্যাপে মেসেজটি সেন্ড করুন। আমাদের প্রতিনিধি অতি দ্রুত আপনার অর্ডারটি কনফার্ম করবে।
            </p>

            <div className="space-y-2.5">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `আমি ${storeSettings.storeName} থেকে আকর্ষণীয় অফারে পণ্য অর্ডার করেছি! আপনিও দেখুন: ${
                    typeof window !== 'undefined' ? window.location.origin : ''
                  }`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl border border-emerald-200 text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>🎁 বন্ধুদের সাথে অফারটি শেয়ার করুন</span>
              </a>

              <button
                onClick={handleClose}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition-colors text-xs"
              >
                ঠিক আছে, ধন্যবাদ
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <Send className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-gray-900">
                {singleItem ? '১-ক্লিকে সরাসরি অর্ডার করুন' : 'হোয়াটসঅ্যাপে অর্ডার কনফার্ম করুন'}
              </h2>
            </div>
            <p className="text-xs text-gray-500 mb-6">
              নিচের তথ্যগুলো পূরণ করে বাটনে চাপ দিলেই অর্ডারের সকল বিবরণসহ আপনার হোয়াটসঅ্যাপ চালু হবে।
            </p>

            {/* Order Summary Pill */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
              <div className="text-xs font-semibold text-gray-500 mb-2">অর্ডার সামারি:</div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {activeItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-gray-700">
                    <span className="truncate max-w-[240px]">
                      {item.productName} {item.variantName ? `(${item.variantName})` : ''} x{' '}
                      {item.quantity}
                    </span>
                    <span className="font-semibold">৳{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-3 pt-2 space-y-1 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>সাবটোটাল</span>
                  <span>৳{activeSubtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ডেলিভারি চার্জ</span>
                  <span>{activeDeliveryCharge === 0 ? 'ফ্রি' : `৳${activeDeliveryCharge}`}</span>
                </div>
                {activeDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>মোট ডিসকাউন্ট {coinDiscount > 0 ? '(কুপন + কয়েন)' : ''}</span>
                    <span>-৳{activeDiscount}</span>
                  </div>
                )}
                {customer && availableCoins > 0 && (
                  <div className="pt-2 pb-1 border-t border-gray-200">
                    <label className="flex items-center justify-between text-xs cursor-pointer py-1 px-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                      <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
                        <input
                          type="checkbox"
                          checked={useCoins}
                          onChange={(e) => setUseCoins(e.target.checked)}
                          className="w-3.5 h-3.5 text-emerald-600 rounded-sm"
                        />
                        <span>🪙 {availableCoins} কয়েন রিডিম করুন</span>
                      </div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        -৳{Math.min(availableCoins, activeSubtotal)}
                      </span>
                    </label>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-sm pt-1 border-t border-gray-200">
                  <span>সর্বমোট প্রদেয়</span>
                  <span className="text-emerald-700">৳{activeTotal}</span>
                </div>
              </div>
            </div>

            {/* Logged in customer badge */}
            {customer && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  লগইন করা আছে: <strong>{customer.name}</strong> ({customer.phone}) — আপনার সংরক্ষিত তথ্য স্বয়ংক্রিয়ভাবে বসানো হয়েছে
                </span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Invisible Honeypot Field */}
              <input
                type="text"
                name="honeypot"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  আপনার নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: মোঃ তামিম ইকবাল"
                  className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.customerName
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-gray-200 focus:ring-emerald-200 focus:border-emerald-600'
                  }`}
                />
                {errors.customerName && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.customerName}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  মোবাইল নম্বর (সচল নম্বর) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.customerPhone
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-gray-200 focus:ring-emerald-200 focus:border-emerald-600'
                  }`}
                />
                {errors.customerPhone && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.customerPhone}
                  </p>
                )}
              </div>

              {/* Delivery Zone Radio */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  ডেলিভারি এরিয়া বেছে নিন <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryZone('inside_dhaka')}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all ${
                      deliveryZone === 'inside_dhaka'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    ঢাকার ভেতরে (৳{storeSettings.deliveryChargeInsideDhaka})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryZone('outside_dhaka')}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all ${
                      deliveryZone === 'outside_dhaka'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    ঢাকার বাইরে (৳{storeSettings.deliveryChargeOutsideDhaka})
                  </button>
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  পূর্ণাঙ্গ ঠিকানা <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="বাড়ি নং, রোড নং, এলাকা, থানা ও জেলার নাম"
                  className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.deliveryAddress
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-gray-200 focus:ring-emerald-200 focus:border-emerald-600'
                  }`}
                />
                {errors.deliveryAddress && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.deliveryAddress}
                  </p>
                )}
              </div>

              {/* Preferred Delivery Time Slot */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ডেলিভারির সুবিধাজনক সময় (ঐচ্ছিক)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {['যেকোনো সময়', 'সকাল ১০টা - ১টা', 'দুপুর ২টা - ৫টা', 'বিকেল ৫টা - ৮টা', 'ছুটির দিন'].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setDeliveryTimeSlot(slot)}
                      className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                        deliveryTimeSlot === slot
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  পেমেন্ট পদ্ধতি বেছে নিন <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`py-2 px-2 rounded-xl border text-center font-medium transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-600/20 font-bold'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    💵 ক্যাশ অন ডেলিভারি
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`py-2 px-2 rounded-xl border text-center font-medium transition-all ${
                      paymentMethod === 'bkash'
                        ? 'border-pink-600 bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300 ring-2 ring-pink-600/20 font-bold'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    🌸 বিকাশ
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('nagad')}
                    className={`py-2 px-2 rounded-xl border text-center font-medium transition-all ${
                      paymentMethod === 'nagad'
                        ? 'border-orange-600 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 ring-2 ring-orange-600/20 font-bold'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    🔶 নগদ
                  </button>
                </div>

                {/* bKash / Nagad Send Money Box */}
                {paymentMethod !== 'cod' && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900 dark:text-amber-200">
                        {paymentMethod === 'bkash' ? 'বিকাশ পার্সোনাল নম্বর' : 'নগদ পার্সোনাল নম্বর'}:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof navigator !== 'undefined') {
                            navigator.clipboard.writeText(storeSettings.primaryWhatsAppNumber);
                            setCopiedNumber(true);
                            setTimeout(() => setCopiedNumber(false), 2000);
                          }
                        }}
                        className="flex items-center gap-1 font-mono font-bold bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-amber-300 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors shadow-2xs"
                      >
                        {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{storeSettings.primaryWhatsAppNumber}</span>
                        <span className="text-[10px] text-gray-500">{copiedNumber ? 'কপি হয়েছে' : 'কপি'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-amber-800 dark:text-amber-300">
                      💡 উপরোক্ত নম্বরে <strong>Send Money</strong> করে নিচে ট্রানজেকশন আইডি (TrxID) বসিয়ে দিন।
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">
                          ট্রানজেকশন আইডি (TrxID) *
                        </label>
                        <input
                          type="text"
                          value={paymentTrxId}
                          onChange={(e) => setPaymentTrxId(e.target.value)}
                          placeholder="যেমন: 9K32LM8P"
                          className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-xs uppercase font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-0.5">
                          প্রেরকের মোবাইল নম্বর
                        </label>
                        <input
                          type="tel"
                          value={paymentSenderPhone}
                          onChange={(e) => setPaymentSenderPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  অতিরিক্ত কোনো নির্দেশনা থাকলে লিখুন (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="যেমন: বিকেলে ডেলিভারি দিন"
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে টাকা পরিশোধ করুন)</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || activeItems.length === 0}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                <span>হোয়াটসঅ্যাপে অর্ডার পাঠান (৳{activeTotal})</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
