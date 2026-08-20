'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatBDT } from '../../lib/api';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
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

  const [inputCoupon, setInputCoupon] = React.useState('');
  const [couponError, setCouponError] = React.useState('');

  if (!isCartDrawerOpen) return null;

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
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartDrawerOpen(false)}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-extrabold text-slate-900">Your Shopping Cart</h2>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Your Cart is Empty</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Explore our collection of flagship smartphones, smartwatches, and premium audio gadgets.
                  </p>
                </div>
                <Link
                  href="/products"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
                >
                  Start Shopping →
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="py-4 flex gap-4">
                  <img
                    src={item.product.mainImage}
                    alt={item.product.name}
                    className="w-16 h-16 object-contain rounded-xl bg-slate-50 border border-slate-100 p-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{item.product.name}</h4>
                    {item.variant && (
                      <p className="text-xs text-blue-600 font-semibold">{item.variant.name}</p>
                    )}
                    <div className="text-xs font-black text-slate-900 mt-1">
                      {formatBDT(item.unitPrice)}
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs font-bold text-slate-600 hover:text-black"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs font-bold text-slate-600 hover:text-black"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId, item.variantId)}
                        className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer Calculations & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4">
              {/* Delivery Zone Toggle */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-blue-600" /> Delivery Zone:
                </span>
                <div className="flex gap-1.5 bg-slate-200/80 p-1 rounded-lg">
                  <button
                    onClick={() => setDeliveryLocation('dhaka')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                      deliveryLocation === 'dhaka' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    Dhaka (৳60)
                  </button>
                  <button
                    onClick={() => setDeliveryLocation('outside')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                      deliveryLocation === 'outside' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    Outside (৳120)
                  </button>
                </div>
              </div>

              {/* Coupon input */}
              <div>
                {couponCode ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <span className="font-bold text-emerald-800">Coupon "{couponCode}" applied (-10%)</span>
                    <button
                      onClick={removeCoupon}
                      className="text-rose-600 hover:text-rose-800 font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code (Try GADGET10)"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-rose-500 mt-1">{couponError}</p>}
              </div>

              {/* Cost Summary */}
              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200/80 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">{formatBDT(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-bold">-{formatBDT(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>VAT / Tax (5%)</span>
                  <span className="font-bold text-slate-900">{formatBDT(vat)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-bold text-slate-900">
                    {deliveryFee === 0 ? <span className="text-emerald-600">FREE</span> : formatBDT(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-200 pt-2">
                  <span>Grand Total</span>
                  <span className="text-blue-600">{formatBDT(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
