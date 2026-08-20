'use client';

import React from 'react';
import Link from 'next/link';
import { Scale, X, ArrowRight } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';

export const CompareDrawer: React.FC = () => {
  const { compareProducts, removeFromCompare, clearCompare } = useCompare();

  if (compareProducts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 bg-slate-900 text-white rounded-2xl shadow-2xl p-4 border border-slate-800 flex items-center gap-4 max-w-lg animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
          <Scale className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-bold">Compare ({compareProducts.length}/4)</div>
          <div className="text-[10px] text-slate-400">Side-by-side spec comparison</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {compareProducts.map((p) => (
          <div key={p.id} className="relative group">
            <img
              src={p.mainImage}
              alt={p.name}
              className="w-10 h-10 object-contain rounded-lg bg-slate-800 p-1 border border-slate-700"
            />
            <button
              onClick={() => removeFromCompare(p.id)}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 transition"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/compare"
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition"
        >
          <span>Compare</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
        <button
          onClick={clearCompare}
          className="p-2 text-slate-400 hover:text-white transition"
          title="Clear Compare"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
