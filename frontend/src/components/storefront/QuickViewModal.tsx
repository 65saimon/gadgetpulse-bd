'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Star, ShoppingCart, ShieldCheck, Check } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { formatBDT } from '../../lib/api';
import { useCart } from '../../context/CartContext';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const price = selectedVariant
    ? selectedVariant.discountPrice || selectedVariant.regularPrice
    : product.discountPrice || product.regularPrice;

  const currentStock = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity;

  const handleAdd = () => {
    addToCart(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Panel */}
        <div className="md:w-1/2 p-8 bg-slate-50 flex items-center justify-center relative">
          <img
            src={product.mainImage}
            alt={product.name}
            className="max-h-72 w-full object-contain"
          />
        </div>

        {/* Details Panel */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              {product.brand?.name} • {product.category?.name}
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight mb-2">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center text-amber-500 text-xs font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span className="ml-1">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-slate-400">({product.ratingCount} Customer Reviews)</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-medium text-emerald-600">{currentStock > 0 ? `${currentStock} in stock` : 'Out of Stock'}</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-black text-slate-900">{formatBDT(price)}</span>
              {product.discountPrice && (
                <span className="text-sm text-slate-400 line-through">{formatBDT(product.regularPrice)}</span>
              )}
            </div>

            {/* Variant Switcher */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Variant:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        selectedVariant?.id === v.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Warranty Badge */}
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100/80 p-2.5 rounded-xl mb-6">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>{product.warranty || '1 Year Official Warranty'}</span>
            </div>
          </div>

          {/* Action Row */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-sm font-bold text-slate-600 hover:text-black"
                >
                  -
                </button>
                <span className="px-3 py-2 text-sm font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  className="px-3 py-2 text-sm font-bold text-slate-600 hover:text-black"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={currentStock <= 0}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : currentStock > 0
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                <span>{added ? 'Added to Cart!' : 'Add to Cart'}</span>
              </button>
            </div>

            <div className="text-center">
              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2"
              >
                View Full Product Specs & Customer Reviews →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
