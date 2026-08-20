'use client';

import React from 'react';
import Link from 'next/link';
import { Scale, X, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { AnnouncementBar } from '../../components/storefront/AnnouncementBar';
import { Navbar } from '../../components/storefront/Navbar';
import { Footer } from '../../components/storefront/Footer';
import { useCompare } from '../../context/CompareContext';
import { useCart } from '../../context/CartContext';
import { formatBDT } from '../../lib/api';

export default function ComparePage() {
  const { compareProducts, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  // Extract all spec keys from compared devices
  const allSpecKeys = Array.from(
    new Set(
      compareProducts.flatMap((p) => {
        if (!p.specifications) return [];
        try {
          const parsed = typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications;
          return Object.keys(parsed);
        } catch (e) {
          return [];
        }
      })
    )
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Scale className="w-7 h-7 text-indigo-600" />
              <span>Compare Devices Side-by-Side</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Compare camera, battery, display, and hardware specs between flagship smartphones & gadgets
            </p>
          </div>

          {compareProducts.length > 0 && (
            <button
              onClick={clearCompare}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Comparison</span>
            </button>
          )}
        </div>

        {compareProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Scale className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">No Devices in Comparison</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click the compare icon on any product card or detail page to add up to 4 devices for comparison.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Explore Products</span>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="p-4 w-48 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Feature / Spec
                  </th>
                  {compareProducts.map((p) => (
                    <th key={p.id} className="p-4 w-64 align-top relative">
                      <button
                        onClick={() => removeFromCompare(p.id)}
                        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <img
                        src={p.mainImage}
                        alt={p.name}
                        className="w-32 h-32 object-contain mx-auto mb-3"
                      />

                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mb-1">
                        {p.name}
                      </h3>
                      <div className="text-sm font-black text-blue-600 mb-3">
                        {formatBDT(p.discountPrice || p.regularPrice)}
                      </div>

                      <button
                        onClick={() => addToCart(p)}
                        className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {/* Brand */}
                <tr>
                  <td className="p-4 font-bold text-slate-600 bg-slate-50/40">Brand</td>
                  {compareProducts.map((p) => (
                    <td key={p.id} className="p-4 font-semibold text-slate-800">
                      {p.brand?.name || 'N/A'}
                    </td>
                  ))}
                </tr>

                {/* Category */}
                <tr>
                  <td className="p-4 font-bold text-slate-600 bg-slate-50/40">Category</td>
                  {compareProducts.map((p) => (
                    <td key={p.id} className="p-4 text-slate-700">
                      {p.category?.name || 'N/A'}
                    </td>
                  ))}
                </tr>

                {/* Stock Status */}
                <tr>
                  <td className="p-4 font-bold text-slate-600 bg-slate-50/40">Stock Status</td>
                  {compareProducts.map((p) => (
                    <td key={p.id} className="p-4">
                      {p.stockQuantity > 0 ? (
                        <span className="text-emerald-600 font-bold">In Stock ({p.stockQuantity})</span>
                      ) : (
                        <span className="text-rose-500 font-bold">Out of Stock</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Warranty */}
                <tr>
                  <td className="p-4 font-bold text-slate-600 bg-slate-50/40">Warranty</td>
                  {compareProducts.map((p) => (
                    <td key={p.id} className="p-4 text-slate-700">
                      {p.warranty || '1 Year Official Warranty'}
                    </td>
                  ))}
                </tr>

                {/* Dynamic JSON Specs Rows */}
                {allSpecKeys.map((key) => (
                  <tr key={key}>
                    <td className="p-4 font-bold text-slate-600 bg-slate-50/40">{key}</td>
                    {compareProducts.map((p) => {
                      let val = '-';
                      if (p.specifications) {
                        try {
                          const parsed = typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications;
                          val = parsed[key] || '-';
                        } catch (e) {}
                      }
                      return (
                        <td key={p.id} className="p-4 text-slate-800 font-medium">
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
