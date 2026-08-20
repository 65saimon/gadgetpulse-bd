'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { AnnouncementBar } from '../../components/storefront/AnnouncementBar';
import { Navbar } from '../../components/storefront/Navbar';
import { Footer } from '../../components/storefront/Footer';
import { useCart } from '../../context/CartContext';
import { formatBDT } from '../../lib/api';

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    vat,
    grandTotal,
    discount,
    couponCode,
    applyCoupon,
    removeCoupon,
    deliveryLocation,
    setDeliveryLocation,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!inputCoupon.trim()) return;
    const success = applyCoupon(inputCoupon.trim());
    if (!success) {
      setCouponError('Invalid coupon code. Try "GADGET10" for 10% off.');
    } else {
      setInputCoupon('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span>Shopping Cart</span>
              <span className="text-sm font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {cart.reduce((s, i) => s + i.quantity, 0)} Items
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">Review your selected phones and gadgets before checkout</p>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
            >
              Clear Entire Cart
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm space-y-5">
            <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Your Shopping Cart is Empty</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You haven't added any smartphones or gadgets to your cart yet. Discover our top collection with official warranty.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-500/20 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Items Table */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.product.mainImage}
                      alt={item.product.name}
                      className="w-20 h-20 object-contain rounded-2xl bg-slate-50 border border-slate-100 p-2 flex-shrink-0"
                    />
                    <div>
                      <Link href={`/products/${item.product.slug}`} className="text-sm font-bold text-slate-900 hover:text-blue-600 transition">
                        {item.product.name}
                      </Link>
                      {item.variant && (
                        <p className="text-xs text-blue-600 font-semibold mt-0.5">{item.variant.name}</p>
                      )}
                      <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {item.variant?.sku || item.product.sku}</p>
                      <div className="text-sm font-black text-slate-900 mt-1">
                        {formatBDT(item.unitPrice)}
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Row Total */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-black"
                      >
                        -
                      </button>
                      <span className="px-3 py-1.5 text-xs font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-black"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <div className="text-base font-black text-slate-900">
                        {formatBDT(item.totalPrice)}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId, item.variantId)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Summary Card */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-slate-900">Order Summary</h2>

              {/* Delivery Zone Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Shipping Destination:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDeliveryLocation('dhaka')}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center text-center ${
                      deliveryLocation === 'dhaka'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Inside Dhaka</span>
                    <span className="text-[10px] opacity-75">৳60 (24h Express)</span>
                  </button>
                  <button
                    onClick={() => setDeliveryLocation('outside')}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center text-center ${
                      deliveryLocation === 'outside'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Outside Dhaka</span>
                    <span className="text-[10px] opacity-75">৳120 (Courier)</span>
                  </button>
                </div>
              </div>

              {/* Coupon Form */}
              <div>
                {couponCode ? (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span>{couponCode} (-10%)</span>
                    </div>
                    <button onClick={removeCoupon} className="text-rose-600 hover:text-rose-800 font-bold">
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Promo / Coupon Code:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. GADGET10"
                        value={inputCoupon}
                        onChange={(e) => setInputCoupon(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-600"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] text-rose-500">{couponError}</p>}
                  </form>
                )}
              </div>

              {/* Calculation Breakdown */}
              <div className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">{formatBDT(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount (Coupon)</span>
                    <span>-{formatBDT(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>VAT / Tax (5%)</span>
                  <span className="font-bold text-slate-900">{formatBDT(vat)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-bold text-slate-900">
                    {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatBDT(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-black text-slate-900 pt-3 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span className="text-blue-600">{formatBDT(grandTotal)}</span>
                </div>
              </div>

              {/* Proceed to Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 transition active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
