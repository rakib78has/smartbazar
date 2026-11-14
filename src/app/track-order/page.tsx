'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  Box,
  AlertCircle,
  ArrowLeft,
  MessageCircle,
  ExternalLink,
  Printer,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { Order, OrderStatus } from '@/types/order';
import { fetchOrders, updateOrderStatusInDb } from '@/lib/db';
import { useCart } from '@/context/CartContext';

function getCourierTrackingUrl(courierName?: string, trackingCode?: string): string {
  if (!trackingCode) return '';
  switch (courierName?.toLowerCase()) {
    case 'steadfast':
      return `https://steadfast.com.bd/t/${trackingCode}`;
    case 'pathao':
      return `https://merchant.pathao.com/tracking?consignment_id=${trackingCode}`;
    case 'redx':
      return `https://redx.com.bd/track-order/?trackingId=${trackingCode}`;
    case 'paperfly':
      return `https://paperfly.com.bd/tracking/${trackingCode}`;
    case 'sundarban':
      return `https://sundarbancourier.com.bd/`;
    default:
      return `https://steadfast.com.bd/t/${trackingCode}`;
  }
}

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'pending', label: 'অর্ডার প্রাপ্তি', desc: 'অর্ডার রিকোয়েস্ট জমা হয়েছে' },
  { key: 'confirmed', label: 'কনফার্মেশন', desc: 'হোয়াটসঅ্যাপে অর্ডার যাচাই সম্পন্ন' },
  { key: 'packaging', label: 'প্যাকিং চলছে', desc: 'পণ্যটি পার্সেল করা হচ্ছে' },
  { key: 'shipped', label: 'কুরিয়ারে হস্তান্তর', desc: 'পার্সেলটি আপনার ঠিকানায় পাঠানো হয়েছে' },
  { key: 'delivered', label: 'ডেলিভার্ড সফল', desc: 'কাস্টমার পার্সেল গ্রহণ করেছে' },
];

function getStepIndex(status: OrderStatus): number {
  switch (status) {
    case 'pending':
      return 0;
    case 'confirmed':
      return 1;
    case 'packaging':
      return 2;
    case 'shipped':
      return 3;
    case 'delivered':
      return 4;
    case 'cancelled':
    case 'returned':
      return -1;
    default:
      return 0;
  }
}

export default function TrackOrderPage() {
  const { storeSettings } = useCart();
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [matchingOrders, setMatchingOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setSearched(true);

    try {
      const allOrders = await fetchOrders();
      const digitsOnly = trimmed.replace(/\D/g, '');
      const filtered = allOrders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(trimmed.toLowerCase()) ||
          (digitsOnly.length >= 6 && o.customerPhone.replace(/\D/g, '').includes(digitsOnly))
      );
      setMatchingOrders(filtered);
    } catch {
      setMatchingOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <CartDrawer />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex-1 w-full">
        {/* Top Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>লাইভ পার্সেল ট্র্যাকিং</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-2">
            আপনার অর্ডার ট্র্যাক করুন
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            অর্ডার নম্বর (যেমন: ORD-1001) অথবা যে মোবাইল নম্বর দিয়ে অর্ডার করেছেন তা লিখে সার্চ করুন।
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="অর্ডার নম্বর বা মোবাইল নম্বর..."
                className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-white border border-gray-200 rounded-2xl shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? 'খোঁজা হচ্ছে...' : 'ট্র্যাক করুন'}
            </button>
          </form>
        </div>

        {/* Results Area */}
        {searched && (
          <div className="space-y-6">
            {matchingOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-xs max-w-md mx-auto">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">কোনো অর্ডার পাওয়া যায়নি</h3>
                <p className="text-xs text-gray-500 mb-4">
                  অনুগ্রহ করে সঠিক অর্ডার কোড বা ১১ ডিজিটের মোবাইল নম্বরটি চেক করুন।
                </p>
                <a
                  href={`https://wa.me/${storeSettings.primaryWhatsAppNumber}?text=${encodeURIComponent(
                    `হ্যালো! আমি আমার অর্ডার ট্র্যাক করতে পারছি না। নম্বর: ${query}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>হোয়াটসঅ্যাপে সহায়তা নিন</span>
                </a>
              </div>
            ) : (
              matchingOrders.map((order) => {
                const currentStepIndex = getStepIndex(order.status);
                const isCancelled = order.status === 'cancelled' || order.status === 'returned';

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-md"
                  >
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-6 border-b border-gray-100 gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-lg text-gray-900">
                            #{order.orderNumber}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                              order.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : isCancelled
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          অর্ডারের তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
                          title="অর্ডারের ক্যাশ মেমো ডাউনলোড বা প্রিন্ট করুন"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>ক্যাশ মেমো</span>
                        </button>

                        <a
                          href={`https://wa.me/${storeSettings.primaryWhatsAppNumber}?text=${encodeURIComponent(
                            `হ্যালো! আমি আমার অর্ডার #${order.orderNumber} সম্পর্কে জানতে চাই।`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors w-fit"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>হোয়াটসঅ্যাপে যোগাযোগ</span>
                        </a>
                      </div>
                    </div>

                    {/* Visual Stepper Timeline */}
                    <div className="py-8">
                      {isCancelled ? (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold text-center">
                          এই অর্ডারটি বাতিল বা ফেরত করা হয়েছে। বিস্তারিত জানতে সাপোর্টে কথা বলুন।
                        </div>
                      ) : (
                        <div className="relative">
                          {/* Progress Line */}
                          <div className="hidden sm:block absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-gray-100 z-0">
                            <div
                              className="h-1 bg-emerald-600 transition-all duration-500"
                              style={{
                                width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
                              }}
                            />
                          </div>

                          {/* Steps Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                            {STATUS_STEPS.map((step, idx) => {
                              const isCompleted = idx <= currentStepIndex;
                              const isCurrent = idx === currentStepIndex;

                              return (
                                <div
                                  key={step.key}
                                  className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2"
                                >
                                  <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                                      isCurrent
                                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md scale-110'
                                        : isCompleted
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-gray-100 text-gray-400'
                                    }`}
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                      idx + 1
                                    )}
                                  </div>
                                  <div>
                                    <div
                                      className={`text-xs font-bold ${
                                        isCompleted ? 'text-gray-900' : 'text-gray-400'
                                      }`}
                                    >
                                      {step.label}
                                    </div>
                                    <div className="text-[10px] text-gray-400 sm:max-w-[120px] mx-auto hidden sm:block">
                                      {step.desc}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Courier Tracking Banner (if available) */}
                    {order.courierTrackingCode && (
                      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <Truck className="w-5 h-5 text-blue-600 shrink-0" />
                          <div>
                            <span className="font-semibold text-gray-700">কুরিয়ার ট্র্যাকিং কোড: </span>
                            <span className="font-bold text-blue-900">{order.courierTrackingCode}</span>
                            {order.courierName && (
                              <span className="text-[10px] text-gray-500 block uppercase font-bold mt-0.5">
                                কুরিয়ার সার্ভিস: {order.courierName}
                              </span>
                            )}
                          </div>
                        </div>

                        <a
                          href={getCourierTrackingUrl(order.courierName, order.courierTrackingCode)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 w-fit"
                        >
                          <span>কুরিয়ার ওয়েবসাইটে ট্র্যাক করুন</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Order Details & Items */}
                    <div className="border-t border-gray-100 pt-5">
                      <div className="text-xs font-bold text-gray-700 mb-3">অর্ডারকৃত পণ্যসমূহ:</div>
                      <div className="space-y-2 mb-4">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl"
                          >
                            <span className="font-medium">
                              • {item.productName} {item.variantName ? `(${item.variantName})` : ''} x{' '}
                              <span className="font-bold">{item.quantity}</span>
                            </span>
                            <span className="font-bold text-gray-900">
                              ৳{item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-xs text-gray-600 pt-2 border-t border-gray-100">
                        <span>
                          ডেলিভারি ঠিকানা: <span className="font-semibold text-gray-800">{order.deliveryAddress}</span>
                        </span>
                        <span className="font-black text-sm text-emerald-700">
                          সর্বমোট: ৳{order.total} (ক্যাশ অন ডেলিভারি)
                        </span>
                      </div>

                      {order.status === 'pending' && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            ⏳ অর্ডারটি এখনো প্রসেসিং শুরু হয়নি — আপনি পরিবর্তন বা বাতিল করতে পারেন
                          </span>
                          <div className="flex items-center gap-2">
                            <a
                              href={`https://wa.me/${storeSettings.primaryWhatsAppNumber}?text=${encodeURIComponent(
                                `আসসালামু আলাইকুম, আমি আমার অর্ডার #${order.orderNumber} এর ঠিকানা বা আইটেম পরিবর্তন করতে চাই।`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-semibold transition-colors"
                            >
                              হোয়াটসঅ্যাপে পরিবর্তন
                            </a>
                            <button
                              onClick={async () => {
                                if (window.confirm('আপনি কি নিশ্চিতভাবে এই অর্ডারটি বাতিল করতে চান?')) {
                                  await updateOrderStatusInDb(order.id, 'cancelled');
                                  setMatchingOrders((prev: Order[]) =>
                                    prev.map((o) => (o.id === order.id ? { ...o, status: 'cancelled' } : o))
                                  );
                                }
                              }}
                              className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg font-semibold transition-colors"
                            >
                              অর্ডার বাতিল
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* ================= MODAL: PRINT CASH MEMO / INVOICE ================= */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
              <div>
                <h3 className="font-bold text-base text-gray-900">{storeSettings.storeName}</h3>
                <p className="text-[10px] text-gray-500">ক্যাশ মেমো ও ডেলিভারি চালান</p>
              </div>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold p-1 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">অর্ডার নম্বর:</span>
                <span className="font-bold text-gray-800">{selectedInvoiceOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">কাস্টমার নাম:</span>
                <span className="font-semibold text-gray-800">{selectedInvoiceOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">মোবাইল:</span>
                <span className="font-semibold text-gray-800">{selectedInvoiceOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ঠিকানা:</span>
                <span className="font-medium text-gray-800 text-right max-w-[200px]">
                  {selectedInvoiceOrder.deliveryAddress}
                </span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-[10px] text-gray-600 font-bold uppercase">
                  <tr>
                    <th className="p-2">আইটেম</th>
                    <th className="p-2 text-center">পরিমাণ</th>
                    <th className="p-2 text-right">মূল্য</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedInvoiceOrder.items.map((i, idx) => (
                    <tr key={idx}>
                      <td className="p-2">
                        {i.productName} {i.variantName ? `(${i.variantName})` : ''}
                      </td>
                      <td className="p-2 text-center">{i.quantity}</td>
                      <td className="p-2 text-right font-bold">৳{i.price * i.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1 text-right mb-6 text-gray-600">
              <div>সাবটোটাল: ৳{selectedInvoiceOrder.subtotal}</div>
              <div>ডেলিভারি চার্জ: ৳{selectedInvoiceOrder.deliveryCharge}</div>
              {selectedInvoiceOrder.discount > 0 && (
                <div className="text-emerald-700">ডিসকাউন্ট: -৳{selectedInvoiceOrder.discount}</div>
              )}
              <div className="font-black text-gray-900 text-sm pt-1 border-t border-gray-200">
                মোট প্রদেয় (ক্যাশ অন ডেলিভারি): ৳{selectedInvoiceOrder.total}
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট বা PDF সেভ করুন</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
