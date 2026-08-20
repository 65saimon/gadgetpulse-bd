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
    <section className="bg-gradient-to-br from-rose-600 via-rose-700 to-pink-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-rose-600/10">
      {/* Header with countdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-rose-500/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Zap className="w-6 h-6 text-amber-300 fill-current animate-bounce" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Flash Super Deals</h2>
            <p className="text-xs text-rose-200">Limited time discounts on genuine gadgets</p>
          </div>
        </div>

        {/* Countdown badges */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-200 mr-1 flex items-center gap-1">
            <Timer className="w-4 h-4" /> Ends in:
          </span>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-sm font-black border border-white/20">
            {String(timeLeft.hours).padStart(2, '0')}h
          </div>
          <span className="font-bold">:</span>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-sm font-black border border-white/20">
            {String(timeLeft.minutes).padStart(2, '0')}m
          </div>
          <span className="font-bold">:</span>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-sm font-black border border-white/20 text-amber-300">
            {String(timeLeft.seconds).padStart(2, '0')}s
          </div>
        </div>
      </div>

      {/* Grid of Flash Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
        {flashItems.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>

      <div className="pt-6 text-center">
        <Link
          href="/products?sortBy=discount"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-rose-700 hover:bg-rose-50 text-xs font-extrabold shadow-md transition"
        >
          <span>View All Flash Discount Products</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
};
