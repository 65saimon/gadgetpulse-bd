'use client';

import React from 'react';
import Link from 'next/link';
import { Brand } from '../../types';

interface BrandShowcaseProps {
  brands: Brand[];
}

export const BrandShowcase: React.FC<BrandShowcaseProps> = ({ brands }) => {
  return (
    <section>
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Official Partners</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Top Global Tech Brands
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
          100% Genuine Authorized Warranty
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {brands.map((b) => (
          <Link
            key={b.id}
            href={`/products?brand=${b.slug}`}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-lg transition-all flex flex-col items-center justify-center text-center group"
          >
            <div className="h-10 w-24 flex items-center justify-center mb-2">
              <span className="text-base font-black text-slate-800 group-hover:text-blue-600 tracking-wider">
                {b.name}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-500">
              {b._count?.products || 0} Models
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};
