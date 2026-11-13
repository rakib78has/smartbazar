'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  Lock,
  Phone,
  Home,
  MapPin,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Navbar } from '@/components/Navbar';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { register, isCustomerLoggedIn } = useCustomerAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isCustomerLoggedIn) {
      router.push('/account');
    }
  }, [isCustomerLoggedIn, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim() || !password.trim()) {
      setError('নাম, মোবাইল নম্বর এবং পাসওয়ার্ড পূরণ বাধ্যতামূলক');
      return;
    }

    setIsLoading(true);
    const res = register({
      name,
      phone,
      email,
      password,
      address,
      deliveryZone,
    });
    setIsLoading(false);

    if (res.success) {
      router.push('/account');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans transition-colors">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">নতুন অ্যাকাউন্ট খুলুন</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              একবার অ্যাকাউন্ট খুলে ডেলিভারি ঠিকানা সেভ রাখুন ও দ্রুত অর্ডার করুন
            </p>
          </div>

          {error && (
            <div className="p-3 mb-5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                আপনার নাম *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: মোঃ সাকিব হাসান"
                className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                মোবাইল নম্বর *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="একটি নিরাপদ পাসওয়ার্ড দিন"
                className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                ডেলিভারি ঠিকানা (ঐচ্ছিক)
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="বাড়ি নং, রোড নং, এলাকা..."
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                ডেলিভারি এলাকা
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryZone('inside_dhaka')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                    deliveryZone === 'inside_dhaka'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  ঢাকার ভেতরে
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryZone('outside_dhaka')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                    deliveryZone === 'outside_dhaka'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  ঢাকার বাইরে
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4 active:scale-98 disabled:opacity-50"
            >
              <span>{isLoading ? 'প্রসেসিং হচ্ছে...' : 'রেজিস্ট্রেশন সম্পন্ন করুন'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-500 dark:text-gray-400">
            <span>ইতিমধ্যে অ্যাকাউন্ট আছে? </span>
            <Link
              href="/login"
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline ml-1"
            >
              লগইন করুন
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
