'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Check,
  AlertCircle,
  Phone,
  FileText,
} from 'lucide-react';
import { AnnouncementBar } from '../../components/storefront/AnnouncementBar';
import { Navbar } from '../../components/storefront/Navbar';
import { Footer } from '../../components/storefront/Footer';
import { apiRequest, formatBDT, formatDateTime } from '../../lib/api';
import { generateInvoicePDF } from '../../lib/invoice-pdf';
import { Order } from '../../types';

const timelineSteps = [
  { key: 'PENDING', label: 'Order Placed', desc: 'Received in system' },
  { key: 'CONFIRMED', label: 'Confirmed', desc: 'Verified by sales team' },
  { key: 'PROCESSING', label: 'Processing', desc: 'Preparing item' },
  { key: 'PACKED', label: 'Packed', desc: 'Sealed with invoice' },
  { key: 'SHIPPED', label: 'Shipped', desc: 'Out with courier' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Handed to customer' },
];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);

    if (!orderNumber.trim() || !phone.trim()) {
      setError('Please enter both your Order ID and phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest(
        `/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}&phone=${encodeURIComponent(phone.trim())}`
      );
      if (res.success && res.order) {
        setOrder(res.order);
      } else {
        setError(res.message || 'No matching order found.');
      }
    } catch (err: any) {
      setError(err.message || 'No order found with the provided details.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: string) => {
    if (status === 'CANCELLED' || status === 'RETURNED') return -1;
    return timelineSteps.findIndex((s) => s.key === status);
  };

  const currentStepIdx = order ? getStepIndex(order.orderStatus) : -1;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Live Logistics</span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Track Your Device Order</h1>
          <p className="text-xs text-slate-500">
            Enter your Order ID (e.g. ORD-20260821-0001) and phone number to track real-time fulfillment and courier dispatch.
          </p>
        </div>

        {/* Tracking Search Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <form onSubmit={handleTrack} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-slate-700 mb-1">Order Number *</label>
              <input
                type="text"
                required
                placeholder="ORD-20260821-0001"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm uppercase font-mono font-bold outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="01711223344"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? 'Searching...' : 'Track'}</span>
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Live Order Result */}
        {order && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400">Tracking Result for:</span>
                <h2 className="text-xl font-black text-slate-900 font-mono">{order.orderNumber}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Placed on {formatDateTime(order.createdAt)}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  order.orderStatus === 'DELIVERED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.orderStatus === 'CANCELLED' || order.orderStatus === 'RETURNED'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-blue-100 text-blue-800 animate-pulse'
                }`}>
                  Status: {order.orderStatus}
                </span>

                {order.invoice && (
                  <button
                    onClick={() => generateInvoicePDF({ ...order.invoice!, order })}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Invoice PDF</span>
                  </button>
                )}
              </div>
            </div>

            {/* Visual Timeline Stepper */}
            {order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'RETURNED' ? (
              <div className="py-4">
                <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-2">
                  {timelineSteps.map((step, idx) => {
                    const isPassed = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div key={step.key} className="flex md:flex-col items-center gap-3 md:gap-2 flex-1 text-left md:text-center relative">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all font-black text-xs ${
                            isPassed
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}
                        >
                          {isPassed ? <Check className="w-5 h-5" /> : idx + 1}
                        </div>
                        <div>
                          <div className={`text-xs font-extrabold ${isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                            {step.label}
                          </div>
                          <div className="text-[10px] text-slate-400">{step.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                This order was {order.orderStatus.toLowerCase()}. If you have questions regarding refunds or replacements, please contact our helpline.
              </div>
            )}

            {/* Order Items & Shipping Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                  Recipient & Destination:
                </span>
                <p className="text-slate-700 font-semibold">{order.customerName}</p>
                <p className="text-slate-500">{order.customerPhone}</p>
                <p className="text-slate-500">{order.shippingAddress}, {order.upazila}, {order.district}, {order.division}</p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                  Payment & Grand Total:
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Method:</span>
                  <span className="font-bold text-slate-800">{order.paymentMethod.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-100">
                  <span>Grand Total:</span>
                  <span className="text-blue-600">{formatBDT(order.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
