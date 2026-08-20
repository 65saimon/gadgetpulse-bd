'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Eye, Heart, Scale, Star, Check } from 'lucide-react';
import { Product } from '../../types';
import { formatBDT } from '../../lib/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare } = useCompare();

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const isWish = isInWishlist(product.id);
  const isComp = isInCompare(product.id);

  const price = product.discountPrice || product.regularPrice;
  const hasDiscount = product.discountPrice && product.discountPrice < product.regularPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.regularPrice - product.discountPrice!) / product.regularPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.variants && product.variants.length > 0 ? product.variants[0] : undefined);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCompare(product);
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col overflow-hidden">
        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {hasDiscount && (
            <span className="bg-rose-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
              -{discountPercent}% OFF
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              NEW
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              HOT
            </span>
          )}
        </div>

        {/* Action Buttons (Wishlist, Compare, Quick View) */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={handleToggleWishlist}
            className={`p-2 rounded-xl backdrop-blur-md shadow-md transition ${
              isWish ? 'bg-rose-500 text-white' : 'bg-white/90 hover:bg-white text-slate-700 hover:text-rose-500'
            }`}
            title="Add to Wishlist"
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>
          <button
            onClick={handleToggleCompare}
            className={`p-2 rounded-xl backdrop-blur-md shadow-md transition ${
              isComp ? 'bg-indigo-600 text-white' : 'bg-white/90 hover:bg-white text-slate-700 hover:text-indigo-600'
            }`}
            title="Compare Spec"
          >
            <Scale className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsQuickViewOpen(true);
            }}
            className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 backdrop-blur-md shadow-md transition"
            title="Quick View"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Product Image */}
        <Link href={`/products/${product.slug}`} className="block relative pt-[80%] bg-slate-50/50 p-6 overflow-hidden">
          <img
            src={product.mainImage}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Product Details */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Brand & Category */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-blue-600 uppercase tracking-wider text-[10px]">
                {product.brand?.name || 'Brand'}
              </span>
              <span className="truncate max-w-[120px]">{product.category?.name}</span>
            </div>

            {/* Title */}
            <Link href={`/products/${product.slug}`} className="block">
              <h3 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition mb-1.5">
                {product.name}
              </h3>
            </Link>

            {/* Short specs bullet */}
            {product.shortDesc && (
              <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                {product.shortDesc}
              </p>
            )}

            {/* Rating Stars & Stock */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-slate-400 text-[10px]">({product.ratingCount})</span>
              </div>
              <div className="text-[11px] font-medium">
                {product.stockQuantity > 0 ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> In Stock
                  </span>
                ) : (
                  <span className="text-rose-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Out of Stock
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Add to Cart */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              <div className="text-base font-black text-slate-900">
                {formatBDT(price)}
              </div>
              {hasDiscount && (
                <div className="text-xs text-slate-400 line-through">
                  {formatBDT(product.regularPrice)}
                </div>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity <= 0}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                addedAnimation
                  ? 'bg-emerald-600 text-white'
                  : product.stockQuantity > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {isQuickViewOpen && (
        <QuickViewModal product={product} onClose={() => setIsQuickViewOpen(false)} />
      )}
    </>
  );
};
