'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Timer, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';

interface FlashDealsProps {
  products: Product[];
}

export const FlashDeals: React.FC<FlashDealsProps> = ({ products }) => {
  // Live Countdown Timer (14h 32m 45s)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashItems = products.slice(0, 4);

  return (
    <section className="bg-gradient-to-br from-rose-600 via-rose-700 to-pink-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white shadow-xl shadow-rose-600/10 w-full">
      {/* Header with countdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-rose-500/50">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-current animate-bounce" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-black tracking-tight">Flash Super Deals</h2>
            <p className="text-[11px] sm:text-xs text-rose-200">Limited time discounts on genuine gadgets</p>
          </div>
        </div>

        {/* Countdown badges */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-200 mr-1 flex items-center gap-1">
            <Timer className="w-3.5 h-3.5" /> Ends:
          </span>
          <div className="bg-white/20 backdrop-blur-md px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black border border-white/20">
            {String(timeLeft.hours).padStart(2, '0')}h
          </div>
          <span className="font-bold">:</span>
          <div className="bg-white/20 backdrop-blur-md px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black border border-white/20">
            {String(timeLeft.minutes).padStart(2, '0')}m
          </div>
          <span className="font-bold">:</span>
          <div className="bg-white/20 backdrop-blur-md px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black border border-white/20 text-amber-300">
            {String(timeLeft.seconds).padStart(2, '0')}s
          </div>
        </div>
      </div>

      {/* Grid of Flash Products - 2 Columns on Mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 pt-4 sm:pt-6">
        {flashItems.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>

      <div className="pt-4 sm:pt-6 text-center">
        <Link
          href="/products?sortBy=discount"
          className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white text-rose-700 hover:bg-rose-50 text-[11px] sm:text-xs font-extrabold shadow-md transition"
        >
          <span>View All Flash Discount Deals</span>
          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </Link>
      </div>
    </section>
  );
};
