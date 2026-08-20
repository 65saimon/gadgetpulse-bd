'use client';

import React from 'react';
import { Phone, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-blue-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Official Store • Jamuna Future Park & Bashundhara City</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Genuine & Official Warranty</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>Free Delivery Over ৳50,000</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <a href="tel:+8801819285538" className="flex items-center gap-1 hover:text-white transition">
            <Phone className="w-3 h-3 text-blue-400" />
            <span>Helpline: +880 1819-285538</span>
          </a>
          <span className="text-slate-700">|</span>
          <Link href="/track-order" className="hover:text-white transition underline underline-offset-2">
            Track Order
          </Link>
          <span className="text-slate-700">|</span>
          <Link href="/admin/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
