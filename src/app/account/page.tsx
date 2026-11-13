'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Package,
  Home,
  Heart,
  LogOut,
  Truck,
  ExternalLink,
  Printer,
  Save,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useCart } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { fetchOrders } from '@/lib/db';
import { Order } from '@/types/order';

export default function CustomerAccountPage() {
  const router = useRouter();
  const { customer, isCustomerLoggedIn, logout, updateProfile } = useCustomerAuth();
  const { wishlist, storeSettings } = useCart();
  const [activeTab, setActiveTab] = useState<'orders' | 'address' | 'wishlist'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Address edit state
  const [editAddress, setEditAddress] = useState('');
  const [editZone, setEditZone] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [addressSavedMsg, setAddressSavedMsg] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!isCustomerLoggedIn) {
      router.push('/login');
    }
  }, [isCustomerLoggedIn, router]);

  // Load user data and orders
  useEffect(() => {
    if (customer) {
      setEditAddress(customer.defaultAddress || '');
      setEditZone(customer.deliveryZone || 'inside_dhaka');

      // Fetch customer orders matched by phone
      fetchOrders().then((all) => {
        const cleanCustPhone = customer.phone.replace(/\D/g, '');
        const myOrders = all.filter(
          (o) => o.customerPhone.replace(/\D/g, '') === cleanCustPhone
        );
        setOrders(myOrders);
      });
    }
  }, [customer]);

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-xs text-gray-400 font-mono">লোড হচ্ছে...</p>
      </div>
    );
  }

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      defaultAddress: editAddress.trim(),
      deliveryZone: editZone,
    });
    setAddressSavedMsg(true);
    setTimeout(() => setAddressSavedMsg(false), 3000);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans transition-colors">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full pb-24 md:pb-12">
        {/* User Welcome Card */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white font-black text-2xl border border-white/20 shadow-md">
              {customer.name[0] || 'U'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black">{customer.name}</h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-100 mt-1">
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {customer.phone}
                </span>
                <span>•</span>
                <span>মেম্বার আইডি: {customer.id}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট</span>
          </button>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'orders'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>আমার অর্ডারসমূহ ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('address')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'address'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>সেভ করা ডেলিভারি ঠিকানা</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'wishlist'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>পছন্দের তালিকা ({wishlist.length})</span>
          </button>
        </div>

        {/* ================= TAB 1: MY ORDERS ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-xs">
                <Package className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">
                  আপনি এখনো কোনো অর্ডার করেননি
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                  পছন্দের পণ্যটি বেছে নিয়ে এখনই অর্ডার করুন!
                </p>
                <Link
                  href="/"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-md"
                >
                  <span>পণ্য দেখুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3.5"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800 text-xs">
                    <div>
                      <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                        {ord.orderNumber}
                      </span>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-gray-500">
                        {new Date(ord.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'shipped'
                            ? 'bg-purple-100 text-purple-800'
                            : ord.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.status === 'pending' && 'অপেক্ষমাণ'}
                        {ord.status === 'confirmed' && 'কনফার্মড'}
                        {ord.status === 'packaging' && 'প্যাকিং চলছে'}
                        {ord.status === 'shipped' && 'কুরিয়ারে আছে'}
                        {ord.status === 'delivered' && 'ডেলিভার্ড'}
                        {ord.status === 'cancelled' && 'বাতিল'}
                      </span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-2">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-gray-700 dark:text-gray-300">
                          {item.productName} {item.variantName ? `(${item.variantName})` : ''} x{' '}
                          <span className="font-bold">{item.quantity}</span>
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ৳{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer & Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
                    <div className="text-gray-600 dark:text-gray-400">
                      মোট প্রদেয়: <span className="font-black text-gray-900 dark:text-white text-sm">৳{ord.total}</span> (ক্যাশ অন ডেলিভারি)
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/track-order?search=${ord.orderNumber}`}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>লাইভ ট্র্যাকিং</span>
                      </Link>

                      <button
                        onClick={() => setSelectedInvoiceOrder(ord)}
                        className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>ক্যাশ মেমো</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ================= TAB 2: SAVED ADDRESS ================= */}
        {activeTab === 'address' && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-xs max-w-2xl">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-600" />
              <span>আপনার স্থায়ী ডেলিভারি ঠিকানা</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              এখানে ঠিকানা সেভ করে রাখলে ভবিষ্যতে চেকআউট করার সময় ঠিকানা অটোমেটিক বসে যাবে।
            </p>

            {addressSavedMsg && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-1.5 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ঠিকানা সফলভাবে সংরক্ষণ করা হয়েছে!</span>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  সম্পূর্ণ ডেলিভারি ঠিকানা
                </label>
                <textarea
                  rows={3}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="বাড়ি নং, রোড নং, থানা, জেলা..."
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  ডেলিভারি এলাকা
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditZone('inside_dhaka')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                      editZone === 'inside_dhaka'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    ঢাকার ভেতরে (৳{storeSettings.deliveryChargeInsideDhaka})
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditZone('outside_dhaka')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                      editZone === 'outside_dhaka'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    ঢাকার বাইরে (৳{storeSettings.deliveryChargeOutsideDhaka})
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>ঠিকানা সংরক্ষণ করুন</span>
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 3: WISHLIST ================= */}
        {activeTab === 'wishlist' && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>আপনার পছন্দের পণ্যসমূহ</span>
            </h2>

            {wishlist.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                পছন্দের তালিকায় কোনো পণ্য নেই। পণ্য ব্রাউজ করে হার্ট আইকনে চাপুন।
              </div>
            ) : (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                মোট <span className="font-bold text-emerald-600">{wishlist.length}</span> টি পণ্য আপনার পছন্দের তালিকায় সেভ করা আছে।
              </p>
            )}

            <div className="mt-4">
              <Link
                href="/"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                ← হোমপেজে ফিরে গিয়ে পণ্য দেখুন
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: DIGITAL INVOICE / CASH MEMO ================= */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white text-gray-900 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg">{storeSettings.storeName}</h3>
                <p className="text-[11px] text-gray-500">{storeSettings.storeTagline}</p>
                <p className="text-[11px] text-gray-500 font-mono">অর্ডার: {selectedInvoiceOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="text-gray-400 hover:text-gray-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl text-xs mb-4 space-y-1">
              <div><strong>গ্রাহক:</strong> {selectedInvoiceOrder.customerName}</div>
              <div><strong>মোবাইল:</strong> {selectedInvoiceOrder.customerPhone}</div>
              <div><strong>ঠিকানা:</strong> {selectedInvoiceOrder.deliveryAddress}</div>
            </div>

            <table className="w-full text-xs text-left mb-4">
              <thead className="bg-gray-100 text-[10px] uppercase font-bold text-gray-600">
                <tr>
                  <th className="p-2">আইটেম</th>
                  <th className="p-2 text-center">পরিমাণ</th>
                  <th className="p-2 text-right">মূল্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedInvoiceOrder.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-2">{it.productName}</td>
                    <td className="p-2 text-center">{it.quantity}</td>
                    <td className="p-2 text-right font-bold">৳{it.price * it.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-1 text-right text-xs mb-6 text-gray-600">
              <div>সাবটোটাল: ৳{selectedInvoiceOrder.subtotal}</div>
              <div>ডেলিভারি চার্জ: ৳{selectedInvoiceOrder.deliveryCharge}</div>
              <div className="font-bold text-gray-900 text-sm pt-1 border-t">
                মোট প্রদেয়: ৳{selectedInvoiceOrder.total}
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
