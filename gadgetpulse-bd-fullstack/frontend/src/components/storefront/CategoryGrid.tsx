'use client';

import React from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Headphones,
  Zap,
  Gamepad2,
  Speaker,
  Cable,
  Folder,
} from 'lucide-react';
import { Category } from '../../types';

interface CategoryGridProps {
  categories: Category[];
}

const iconMap: { [key: string]: any } = {
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Headphones,
  Zap,
  Gamepad2,
  Speaker,
  Cable,
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  return (
    <section>
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Explore Catalog</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Popular Product Categories
          </h2>
        </div>
        <Link
          href="/products"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4 hidden sm:inline"
        >
          Browse all categories →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((cat) => {
          const Icon = (cat.iconName && iconMap[cat.iconName]) || Folder;
          return (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 flex items-center justify-center transition-colors duration-300 mb-3 shadow-sm">
                <Icon className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {cat._count?.products || 0}+ Products
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
