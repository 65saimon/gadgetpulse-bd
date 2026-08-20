'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  FileText,
  Printer,
  Download,
  Package,
  ArrowRight,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import { AnnouncementBar } from '../../../components/storefront/AnnouncementBar';
import { Navbar } from '../../../components/storefront/Navbar';
import { Footer } from '../../../components/storefront/Footer';
import { apiRequest, formatBDT, formatDate } from '../../../lib/api';
import { generateInvoicePDF } from '../../../lib/invoice-pdf';
import { Order } from '../../../types';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await apiRequest(`/orders/${orderId}`);
        if (res.success && res.order) {
          setOrder(res.order);
        }
      } catch (err) {
        console.error('Error loading order:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  const handleDownloadPDF = () => {
    if (order && order.invoice) {
      generateInvoicePDF({
        ...order.invoice,
        order,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <AnnouncementBar />
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto p-12 text-center text-slate-500 animate-pulse">
          Loading order details...
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <AnnouncementBar />
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto p-16 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-block">
            Return to Home
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

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Success Header Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Order Confirmed
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Thank You For Your Order!
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Your order <span className="font-mono font-bold text-blue-600">{order.orderNumber}</span> has been received and is being processed by our fulfillment hub.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-500/20 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Official Tax Invoice (PDF)</span>
            </button>

            <Link
              href="/track-order"
              className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black flex items-center gap-2 transition"
            >
              <Package className="w-4 h-4" />
              <span>Track Live Delivery</span>
            </Link>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block">Order Number</span>
              <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Order Date</span>
              <span className="font-bold text-slate-900">{formatDate(order.createdAt)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Payment Method</span>
              <span className="font-bold text-slate-900">{order.paymentMethod.replace(/_/g, ' ')}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Payment Status</span>
              <span className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Delivery recipient */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
            <span className="font-bold text-slate-900">Delivery Address:</span>
            <p className="text-slate-700 font-medium">{order.customerName} ({order.customerPhone})</p>
            <p className="text-slate-500">{order.shippingAddress}, {order.upazila}, {order.district}, {order.division}</p>
          </div>

          {/* Items */}
          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{item.productName}</h4>
                  {item.variantName && item.variantName !== 'Standard' && (
                    <p className="text-blue-600">{item.variantName}</p>
                  )}
                  <p className="text-slate-400 font-mono">SKU: {item.sku} • Qty: {item.quantity}</p>
                </div>
                <span className="font-black text-slate-900">{formatBDT(item.totalPrice)}</span>
              </div>
            ))}
          </div>

          {/* Calculation */}
          <div className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">{formatBDT(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount</span>
                <span>-{formatBDT(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>VAT / Tax (5%)</span>
              <span className="font-bold text-slate-900">{formatBDT(order.vatAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span className="font-bold text-slate-900">{formatBDT(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-slate-900 pt-3 border-t border-slate-200">
              <span>Grand Total</span>
              <span className="text-blue-600">{formatBDT(order.grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
          >
            <span>Continue Browsing Gadgets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
