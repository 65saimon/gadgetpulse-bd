'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  Smartphone,
  Building2,
  Banknote,
  AlertCircle,
} from 'lucide-react';
import { AnnouncementBar } from '../../components/storefront/AnnouncementBar';
import { Navbar } from '../../components/storefront/Navbar';
import { Footer } from '../../components/storefront/Footer';
import { BangladeshiAddressSelector } from '../../components/storefront/BangladeshiAddressSelector';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { apiRequest, formatBDT } from '../../lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, deliveryFee, vat, grandTotal, discount, couponCode, clearCart } = useCart();
  const { customer, customerToken } = useAuth();

  // Shipping Form State
  const [customerName, setCustomerName] = useState(customer?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(customer?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(customer?.email || '');
  const [division, setDivision] = useState(customer?.division || 'Dhaka');
  const [district, setDistrict] = useState(customer?.district || 'Dhaka');
  const [upazila, setUpazila] = useState(customer?.upazila || 'Gulshan');
  const [shippingAddress, setShippingAddress] = useState(customer?.address || '');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'BKASH' | 'NAGAD' | 'BANK_TRANSFER'>('CASH_ON_DELIVERY');
  const [transactionId, setTransactionId] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAddressChange = (geo: { division: string; district: string; upazila: string }) => {
    setDivision(geo.division);
    setDistrict(geo.district);
    setUpazila(geo.upazila);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (cart.length === 0) {
      setErrorMessage('Your cart is empty. Please add products before placing an order.');
      return;
    }

    if (!customerName || !customerPhone || !shippingAddress) {
      setErrorMessage('Please provide your full name, phone number, and delivery address.');
      return;
    }

    if (['BKASH', 'NAGAD'].includes(paymentMethod) && !transactionId.trim()) {
      setErrorMessage(`Please enter the ${paymentMethod} Transaction ID (TrxID) to verify payment.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        division,
        district,
        upazila,
        shippingAddress,
        paymentMethod,
        transactionId: transactionId.trim() || undefined,
        senderPhone: senderPhone.trim() || customerPhone,
        couponCode: couponCode || undefined,
        items: cart.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      };

      const res = await apiRequest('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      }, customerToken);

      if (res.success && res.order) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        clearCart();
        router.push(`/order-success/${res.order.id}`);
      } else {
        setErrorMessage(res.message || 'Failed to complete order.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <AnnouncementBar />
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto p-16 text-center space-y-4">
          <h2 className="text-2xl font-black text-slate-900">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500">Please add items to your cart before proceeding to checkout.</p>
          <Link href="/products" className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md">
            Browse Products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Lock className="w-6 h-6 text-blue-600" />
            <span>Secure Checkout</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Complete your delivery address and choose payment method</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Customer Info, Address & Payment */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Customer Contact Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span>Customer Contact Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rafid Al-Mahmud"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (+880) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="01711223344"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <span>Delivery Address (Bangladesh)</span>
              </h2>

              <div className="space-y-4 pt-2">
                <BangladeshiAddressSelector
                  division={division}
                  district={district}
                  upazila={upazila}
                  onChange={handleAddressChange}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Street Address / House / Road *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House 42, Road 113/A, Block D, Apartment 4B..."
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                  3
                </span>
                <span>Payment Method</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
                    paymentMethod === 'CASH_ON_DELIVERY'
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Cash on Delivery</h4>
                    <p className="text-[11px] text-slate-500">Pay cash upon device inspection</p>
                  </div>
                </button>

                {/* bKash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('BKASH')}
                  className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
                    paymentMethod === 'BKASH'
                      ? 'border-pink-600 bg-pink-50/70 ring-2 ring-pink-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 font-black flex items-center justify-center text-xs">
                    bKash
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">bKash MFS</h4>
                    <p className="text-[11px] text-slate-500">Merchant / Send Money</p>
                  </div>
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('NAGAD')}
                  className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
                    paymentMethod === 'NAGAD'
                      ? 'border-orange-600 bg-orange-50/70 ring-2 ring-orange-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 font-black flex items-center justify-center text-xs">
                    Nagad
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Nagad MFS</h4>
                    <p className="text-[11px] text-slate-500">Instant verification</p>
                  </div>
                </button>

                {/* Bank Wire */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
                    paymentMethod === 'BANK_TRANSFER'
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Bank Transfer</h4>
                    <p className="text-[11px] text-slate-500">Direct City Bank wire</p>
                  </div>
                </button>
              </div>

              {/* bKash Payment Instructions Box */}
              {paymentMethod === 'BKASH' && (
                <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200 space-y-3 animate-in fade-in">
                  <div className="text-xs font-bold text-pink-900">bKash Merchant Payment Instructions:</div>
                  <ol className="text-xs text-pink-800 space-y-1 list-decimal pl-4">
                    <li>Open bKash App & select <b>Make Payment</b> or <b>Send Money</b></li>
                    <li>Enter Merchant Wallet Number: <b className="font-mono bg-white px-2 py-0.5 rounded text-pink-700">01819-285538</b></li>
                    <li>Enter Amount: <b className="font-mono">{formatBDT(grandTotal)}</b></li>
                    <li>Complete with your bKash PIN and copy the <b>Transaction ID (TrxID)</b> below</li>
                  </ol>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-pink-900 mb-1">bKash Transaction ID (TrxID) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. BK89102934"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-pink-300 rounded-xl text-xs uppercase font-mono font-bold outline-none focus:border-pink-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-pink-900 mb-1">Sender bKash Number</label>
                      <input
                        type="tel"
                        placeholder="017XXXXXXXX"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-pink-300 rounded-xl text-xs font-mono outline-none focus:border-pink-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Nagad Payment Instructions Box */}
              {paymentMethod === 'NAGAD' && (
                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 space-y-3 animate-in fade-in">
                  <div className="text-xs font-bold text-orange-900">Nagad Merchant Payment Instructions:</div>
                  <ol className="text-xs text-orange-800 space-y-1 list-decimal pl-4">
                    <li>Open Nagad App & select <b>Merchant Pay</b> or <b>Send Money</b></li>
                    <li>Enter Merchant Number: <b className="font-mono bg-white px-2 py-0.5 rounded text-orange-700">01711-987654</b></li>
                    <li>Enter Amount: <b className="font-mono">{formatBDT(grandTotal)}</b></li>
                    <li>Enter Transaction ID below</li>
                  </ol>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-orange-900 mb-1">Nagad Transaction ID (TrxID) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. NG77102934"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-orange-300 rounded-xl text-xs uppercase font-mono font-bold outline-none focus:border-orange-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-orange-900 mb-1">Sender Nagad Number</label>
                      <input
                        type="tel"
                        placeholder="018XXXXXXXX"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-orange-300 rounded-xl text-xs font-mono outline-none focus:border-orange-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Wire Box */}
              {paymentMethod === 'BANK_TRANSFER' && (
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3 animate-in fade-in">
                  <div className="text-xs font-bold text-indigo-900">Bank Transfer Details:</div>
                  <p className="text-xs text-indigo-800 font-mono">
                    Bank: City Bank Ltd | Branch: Gulshan | Account: 1102983746001 | Name: GadgetPulse BD Ltd
                  </p>
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-900 mb-1">Deposit Slip / Ref Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CBL-DEP-99201"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-xl text-xs uppercase font-mono font-bold outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary & Place Order Button */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-base font-black text-slate-900">Review Items in Order</h2>

            {/* Items list */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.mainImage}
                      alt={item.product.name}
                      className="w-12 h-12 object-contain rounded-xl bg-slate-50 border border-slate-100 p-1 flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 line-clamp-1">{item.product.name}</h4>
                      {item.variant && <p className="text-blue-600 font-semibold">{item.variant.name}</p>}
                      <p className="text-slate-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="font-black text-slate-900 text-right">
                    {formatBDT(item.totalPrice)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">{formatBDT(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
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
              <div className="flex justify-between text-xl font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>Grand Total</span>
                <span className="text-blue-600">{formatBDT(grandTotal)}</span>
              </div>
            </div>

            {/* Official Warranty Trust Badge */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 text-xs text-slate-600">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Official 1-Year Brand Warranty & 7-Day Replacement Guarantee included.</span>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 transition active:scale-95 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Processing Order...' : 'Confirm & Place Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
