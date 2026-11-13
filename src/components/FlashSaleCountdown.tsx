'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Clock, Zap } from 'lucide-react';

export function FlashSaleCountdown() {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 5,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    // Calculate remaining seconds until end of current day
    const getRemainingSeconds = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diffMs = endOfDay.getTime() - now.getTime();
      return Math.max(0, Math.floor(diffMs / 1000));
    };

    const updateTimer = () => {
      const totalSec = getRemainingSeconds();
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;
      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="mb-8 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-600 p-0.5 shadow-md">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-gray-900 rounded-[14px] px-4 py-3 sm:px-6">
        {/* Left: Badge & Heading */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm sm:text-base text-gray-900 dark:text-white">
                আজকের ধামাকা ফ্ল্যাশ সেল!
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                ৫০% পর্যন্ত ছাড়
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              সীমিত সময়ের জন্য অফার মূল্যে সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন
            </p>
          </div>
        </div>

        {/* Right: Countdown Clock */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Clock className="w-4 h-4 text-rose-500 shrink-0 hidden sm:block" />
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-1 hidden sm:inline">
            অফার শেষ হতে:
          </span>

          <div className="flex items-center gap-1 font-mono font-black text-xs sm:text-sm">
            <span className="px-2 py-1 bg-gray-900 text-white rounded-lg shadow-xs min-w-[32px] text-center">
              {pad(timeLeft.hours)}
            </span>
            <span className="text-gray-400 font-bold">:</span>
            <span className="px-2 py-1 bg-gray-900 text-white rounded-lg shadow-xs min-w-[32px] text-center">
              {pad(timeLeft.minutes)}
            </span>
            <span className="text-gray-400 font-bold">:</span>
            <span className="px-2 py-1 bg-rose-600 text-white rounded-lg shadow-xs min-w-[32px] text-center animate-pulse">
              {pad(timeLeft.seconds)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
