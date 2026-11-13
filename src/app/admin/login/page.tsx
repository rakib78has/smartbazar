'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { adminLoginSchema } from '@/lib/validation';
import {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  setAdminSession,
  isUserAuthenticated,
  checkBruteForceLockout,
  recordFailedAttempt,
} from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [lockoutSec, setLockoutSec] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to /admin
  useEffect(() => {
    if (isUserAuthenticated()) {
      router.push('/admin');
    }
    // Check lockout
    const { isLocked, remainingSeconds } = checkBruteForceLockout();
    if (isLocked) {
      setLockoutSec(remainingSeconds);
    }
  }, [router]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSec <= 0) return;
    const timer = setInterval(() => {
      setLockoutSec((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSec]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check lockout
    const { isLocked, remainingSeconds } = checkBruteForceLockout();
    if (isLocked) {
      setLockoutSec(remainingSeconds);
      setError(`অ্যাকাউন্ট নিরাপত্তার জন্য লক করা হয়েছে। দয়া করে ${remainingSeconds} সেকেন্ড অপেক্ষা করুন।`);
      return;
    }

    // Validate with Zod
    const validation = adminLoginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
        setAdminSession(email);
        router.push('/admin');
      } else {
        const { isNowLocked } = recordFailedAttempt();
        if (isNowLocked) {
          setLockoutSec(60);
          setError('৫ বার ভুল চেষ্টা করা হয়েছে! অ্যাকাউন্ট ৬০ সেকেন্ডের জন্য লক করা হলো।');
        } else {
          setError('ভুল ইমেইল বা পাসওয়ার্ড! অনুগ্রহ করে আবার চেষ্টা করুন।');
        }
        setIsLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center p-4 relative font-sans">
      {/* Back to Home Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white text-xs font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>স্টোরফ্রন্টে ফিরে যান</span>
      </Link>

      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Top glow decoration */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">অ্যাডমিন প্রবেশদ্বার</h1>
          <p className="text-xs text-gray-400 mt-1">
            ম্যানেজমেন্ট ড্যাশবোর্ডে প্রবেশের জন্য লগইন করুন
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-400 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              অ্যাডমিন ইমেইল
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@smartbazar.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || lockoutSec > 0}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 mt-2"
          >
            {isLoading
              ? 'যাচাই করা হচ্ছে...'
              : lockoutSec > 0
              ? `লকড (${lockoutSec}s)`
              : 'লগইন করুন'}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-8 pt-4 border-t border-gray-800/80 text-center">
          <p className="text-[11px] text-gray-400 mb-2">ডিফল্ট অ্যাডমিন ক্রেডেনশিয়াল:</p>
          <div className="inline-block bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-1.5 text-[11px] text-emerald-400 font-mono">
            ইমেইল: <span className="text-white font-bold">{DEFAULT_ADMIN_EMAIL}</span>
            <br />
            পাসওয়ার্ড: <span className="text-white font-bold">{DEFAULT_ADMIN_PASSWORD}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
