'use client';

import React, { useState } from 'react';
import { X, Sparkles, Gift, Check, Trophy } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WheelSegment {
  label: string;
  code?: string;
  color: string;
  isWin: boolean;
}

const SEGMENTS: WheelSegment[] = [
  { label: '৳৫০ ছাড়', code: 'SAVE50', color: '#10B981', isWin: true },
  { label: 'ফ্রি ডেলিভারি', code: 'FREESHIP', color: '#3B82F6', isWin: true },
  { label: '৳১০০ মেগা অফার', code: 'EID100', color: '#8B5CF6', isWin: true },
  { label: 'আবার চেষ্টা করুন', color: '#64748B', isWin: false },
  { label: '৳৫০ ডিসকাউন্ট', code: 'SAVE50', color: '#F59E0B', isWin: true },
  { label: 'ফ্রি ডেলিভারি', code: 'FREESHIP', color: '#EC4899', isWin: true },
];

export function SpinWheelModal({ isOpen, onClose }: SpinWheelModalProps) {
  const { applyCoupon, setIsCartOpen } = useCart();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonSegment, setWonSegment] = useState<WheelSegment | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonSegment(null);
    setIsCopied(false);

    // Pick a winning index (favor winning coupons: 0, 1, 2, 4, 5)
    const winningIndices = [0, 1, 2, 4, 5];
    const pickedIndex = winningIndices[Math.floor(Math.random() * winningIndices.length)];
    const segmentAngle = 360 / SEGMENTS.length;
    // Align segment to top indicator (pointer is at top: 270 deg or offset)
    const targetAngle = 360 * 5 + (SEGMENTS.length - pickedIndex) * segmentAngle - segmentAngle / 2;

    const newRotation = rotation + targetAngle;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWonSegment(SEGMENTS[pickedIndex]);
      try {
        localStorage.setItem('smartbazar_has_spun', 'true');
      } catch {}
    }, 4000);
  };

  const handleApplyWonCoupon = () => {
    if (!wonSegment || !wonSegment.code) return;
    applyCoupon(wonSegment.code);
    setIsCartOpen(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 overflow-hidden text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2 shadow-inner">
            <Gift className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            ভাগ্যের চাকা ঘুরান! <Sparkles className="w-5 h-5 text-amber-500" />
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            চাকা ঘুরিয়ে জিতে নিন স্পেশাল ডিসকাউন্ট ভাউচার ও ফ্রি ডেলিভারি
          </p>
        </div>

        {/* Wheel Container */}
        <div className="relative w-64 h-64 mx-auto my-2 flex items-center justify-center">
          {/* Top Pointer Indicator */}
          <div className="absolute top-0 z-20 -mt-2.5 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-rose-600 drop-shadow-md" />
          </div>

          {/* Rotating SVG Wheel */}
          <div
            className="w-full h-full rounded-full shadow-xl border-4 border-amber-400 overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {SEGMENTS.map((seg, idx) => {
                const angle = 360 / SEGMENTS.length;
                const startAngle = idx * angle;
                const endAngle = startAngle + angle;
                const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                // SVG slice path
                const d = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                // Text position
                const midAngle = startAngle + angle / 2;
                const tx = 50 + 32 * Math.cos((Math.PI * midAngle) / 180);
                const ty = 50 + 32 * Math.sin((Math.PI * midAngle) / 180);

                return (
                  <g key={idx}>
                    <path d={d} fill={seg.color} stroke="#ffffff" strokeWidth="0.8" />
                    <text
                      x={tx}
                      y={ty}
                      fill="#ffffff"
                      fontSize="5"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                    >
                      {seg.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center Hub Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`absolute z-10 w-16 h-16 rounded-full bg-white border-4 border-amber-400 shadow-lg flex items-center justify-center font-black text-xs text-amber-700 transition-all ${
              isSpinning ? 'opacity-75 cursor-not-allowed' : 'hover:scale-110 active:scale-95'
            }`}
          >
            {isSpinning ? 'ঘুরছে...' : 'স্পিন!'}
          </button>
        </div>

        {/* Win Message / Results */}
        {wonSegment ? (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center gap-2 text-emerald-800 font-extrabold text-sm mb-1">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>অভিনন্দন! আপনি জিতেছেন {wonSegment.label}!</span>
            </div>

            {wonSegment.code ? (
              <div className="mt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <span className="px-3 py-1 bg-white border border-emerald-300 rounded-xl font-mono font-black text-emerald-700 text-sm tracking-wider">
                  {wonSegment.code}
                </span>
                <button
                  onClick={handleApplyWonCoupon}
                  className="w-full sm:w-auto px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>কার্টে প্রয়োগ করুন</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-1">আবার ঘুরিয়ে চেষ্টা করুন!</p>
            )}
          </div>
        ) : (
          <div className="mt-4">
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-600 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-50"
            >
              {isSpinning ? 'ভাগ্যের চাকা ঘুরছে...' : 'এখনই স্পিন করুন!'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
