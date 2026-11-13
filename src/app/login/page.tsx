'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Navbar } from '@/components/Navbar';

export default function CustomerLoginPage() {
  const router = useRouter();
  const { login, isCustomerLoggedIn } = useCustomerAuth();
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to account dashboard
  React.useEffect(() => {
    if (isCustomerLoggedIn) {
      router.push('/account');
    }
  }, [isCustomerLoggedIn, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneOrEmail.trim() || !password.trim()) {
      setError('মোবাইল নম্বর এবং পাসওয়ার্ড পূরণ করুন');
      return;
    }

    setIsLoading(true);
    const res = login(phoneOrEmail, password);
    setIsLoading(false);

    if (res.success) {
      router.push('/account');
    } else {
      setError(res.message);
    }
  };

  const handleFillDemo = () => {
    setPhoneOrEmail('01712345678');
    setPassword('customer123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans transition-colors">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">কাস্টমার লগইন</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              আপনার অ্যাকাউন্টে লগইন করে পূর্বের অর্ডার ও সেভ করা ঠিকানা দেখুন
            </p>
          </div>

          {error && (
            <div className="p-3 mb-5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                মোবাইল নম্বর বা ইমেইল
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  placeholder="যেমন: 017XXXXXXXX বা email"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <span>{isLoading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Pill */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>ডেমো অ্যাকাউন্ট দিয়ে অটো-ফিল করুন (01712345678 / customer123)</span>
            </button>
          </div>

          {/* Registration Link */}
          <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            <span>কোনো অ্যাকাউন্ট নেই? </span>
            <Link
              href="/register"
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline ml-1"
            >
              নতুন অ্যাকাউন্ট তৈরি করুন
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
