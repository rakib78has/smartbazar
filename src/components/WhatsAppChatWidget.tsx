'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const FAQ_OPTIONS = [
  '🚚 ডেলিভারি চার্জ কত ও কত দিনে পাবো?',
  '🔍 পার্সেল হাতে পেয়ে চেক করে টাকা দেওয়া যাবে?',
  '🎁 কোনো স্পেশাল অফার বা ডিসকাউন্ট কুপন আছে?',
  '📦 আমার পূর্বের অর্ডার সম্পর্কে জানতে চাই',
];

export function WhatsAppChatWidget() {
  const { storeSettings } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const handleOpenWhatsApp = (message: string) => {
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${storeSettings.primaryWhatsAppNumber}?text=${encoded}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    handleOpenWhatsApp(customMsg);
    setCustomMsg('');
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-5 z-40 font-sans">
      {/* Floating Chat Box Modal */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-white text-base">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm">{storeSettings.storeName} সাপোর্ট</h3>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span>অনলাইন</span> • <span>সাধারণত ৫ মিনিটে উত্তর দেওয়া হয়</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body & FAQ Chips */}
          <div className="p-4 bg-gray-50/60 dark:bg-gray-900/60 max-h-80 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-xs shadow-2xs border border-gray-100 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 mb-3">
              👋 আসসালামু আলাইকুম! আপনাকে কীভাবে সাহায্য করতে পারি? নিচের যেকোনো প্রশ্নে চাপ দিন:
            </div>

            <div className="space-y-1.5 mb-3">
              {FAQ_OPTIONS.map((faq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOpenWhatsApp(faq)}
                  className="w-full text-left text-xs bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 p-2.5 rounded-xl border border-gray-200/70 dark:border-gray-700 transition-colors shadow-2xs flex items-center justify-between group"
                >
                  <span>{faq}</span>
                  <span className="text-gray-400 group-hover:text-emerald-600 text-[10px] font-bold shrink-0 ml-1">
                    পাঠান →
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message Input */}
          <form onSubmit={handleCustomSubmit} className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
            <input
              type="text"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              placeholder="আপনার প্রশ্নটি লিখুন..."
              className="flex-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!customMsg.trim()}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors shrink-0"
              title="পাঠান"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group cursor-pointer"
        title="হোয়াটসঅ্যাপে দ্রুত সহায়তা"
      >
        <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-bold hidden sm:inline">
          {isOpen ? 'বন্ধ করুন' : 'সাহায্য দরকার?'}
        </span>
      </button>
    </div>
  );
}
