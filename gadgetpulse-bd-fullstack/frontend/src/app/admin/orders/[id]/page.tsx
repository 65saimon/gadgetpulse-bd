'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart,
  ArrowLeft,
  FileText,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Save,
  DollarSign,
} from 'lucide-react';
import { AdminLayout } from '../../../../components/admin/AdminLayout';
import { apiRequest, formatBDT, formatDateTime } from '../../../../lib/api';
import { generateInvoicePDF } from '../../../../lib/invoice-pdf';
import { Order } from '../../../../types';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const res = await apiRequest(`/orders/${orderId}`);
      if (res.success && res.order) {
        setOrder(res.order);
        setOrderStatus(res.order.orderStatus);
        setPaymentStatus(res.order.paymentStatus);
        setAdminNotes(res.order.adminNotes || '');
      }
    } catch (err) {
      console.error('Error loading order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await apiRequest(`/orders/admin/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          orderStatus,
          paymentStatus,
          adminNotes,
        }),
      });

      if (res.success) {
        setSaveSuccess(true);
        loadOrder();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update order status.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (order && order.invoice) {
      generateInvoicePDF({
        ...order.invoice,
        order,
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-12 text-center text-slate-400 animate-pulse">
          Loading order details...
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="p-12 text-center space-y-3">
          <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
          <Link href="/admin/orders" className="text-xs font-bold text-blue-600 hover:underline">
            ← Return to Orders List
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const totalCost = order.items.reduce((sum, item) => sum + (item.purchaseCost * item.quantity), 0);
  const grossProfit = (order.subtotal - order.discountAmount) - totalCost;

  return (
    <AdminLayout>
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 font-mono">
                {order.orderNumber}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                order.orderStatus === 'DELIVERED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.orderStatus === 'CANCELLED' || order.orderStatus === 'RETURNED'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {order.orderStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Created on {formatDateTime(order.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {order.invoice && (
            <button
              onClick={handleDownloadInvoice}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Tax Invoice</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Status Progression & Items */}
        <div className="lg:col-span-8 space-y-6">
          {/* Status Progression Control */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-base font-black text-slate-900">Update Order Lifecycle & Payment Status</h2>

            {saveSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Order updated successfully! Inventory adjusted automatically if status changed.</span>
              </div>
            )}

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fulfillment Order Status</label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white text-sm"
                  >
                    <option value="PENDING">PENDING (Awaiting Review)</option>
                    <option value="CONFIRMED">CONFIRMED (Stock Validated)</option>
                    <option value="PROCESSING">PROCESSING (Packaging)</option>
                    <option value="PACKED">PACKED (Ready for Pickup)</option>
                    <option value="SHIPPED">SHIPPED (With Courier)</option>
                    <option value="DELIVERED">DELIVERED (Completed)</option>
                    <option value="CANCELLED">CANCELLED (Stock Restored)</option>
                    <option value="RETURNED">RETURNED (Stock Restored)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white text-sm"
                  >
                    <option value="PENDING">PENDING (Unpaid / COD)</option>
                    <option value="PAID">PAID (Verified)</option>
                    <option value="FAILED">FAILED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Admin Staff Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Courier tracking code Steadfast: ST-99201. Customer called to confirm evening delivery."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white text-xs"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Updating...' : 'Save Status & Notes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Ordered Line Items */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900">Ordered Items & Profit Telemetry</h2>

            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.productName}</h4>
                    {item.variantName && item.variantName !== 'Standard' && (
                      <p className="text-blue-600 font-semibold">{item.variantName}</p>
                    )}
                    <p className="text-slate-400 font-mono mt-0.5">SKU: {item.sku}</p>
                  </div>

                  <div className="text-right flex items-center gap-6">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Unit Price</span>
                      <span className="font-bold text-slate-800">{formatBDT(item.unitPrice)}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Qty</span>
                      <span className="font-bold text-slate-800">x{item.quantity}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Purchase Cost</span>
                      <span className="font-mono text-slate-600">{formatBDT(item.purchaseCost * item.quantity)}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Total</span>
                      <span className="font-black text-slate-900">{formatBDT(item.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Gross Profit Calculation Box */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-bold">
              <span>Order Estimated Gross Profit Margin:</span>
              <span className="text-base text-emerald-700 font-black">+{formatBDT(grossProfit)}</span>
            </div>
          </div>
        </div>

        {/* Right: Customer & Financials Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer info */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3 text-xs">
            <h2 className="font-black text-slate-900 text-sm">Customer & Shipping Address</h2>
            <div className="space-y-1">
              <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
              <p className="text-slate-600">{order.customerPhone}</p>
              {order.customerEmail && <p className="text-slate-500">{order.customerEmail}</p>}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 block font-bold text-[11px]">Destination:</span>
              <p className="text-slate-700 mt-0.5">
                {order.shippingAddress}, {order.upazila}, {order.district}, {order.division}
              </p>
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3 text-xs">
            <h2 className="font-black text-slate-900 text-sm">Payment Details</h2>
            <div className="flex justify-between">
              <span className="text-slate-500">Method:</span>
              <span className="font-bold text-slate-800">{order.paymentMethod.replace(/_/g, ' ')}</span>
            </div>
            {order.transactionId && (
              <div className="flex justify-between">
                <span className="text-slate-500">TrxID:</span>
                <span className="font-mono font-bold text-blue-600">{order.transactionId}</span>
              </div>
            )}
            {order.senderPhone && (
              <div className="flex justify-between">
                <span className="text-slate-500">Sender:</span>
                <span className="font-mono text-slate-700">{order.senderPhone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Status:</span>
              <span className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2 text-xs">
            <h2 className="font-black text-slate-900 text-sm mb-2">Financial Breakdown</h2>
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-900">{formatBDT(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount:</span>
                <span>-{formatBDT(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>VAT / Tax (5%):</span>
              <span className="font-bold text-slate-900">{formatBDT(order.vatAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee:</span>
              <span className="font-bold text-slate-900">{formatBDT(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
              <span>Grand Total:</span>
              <span className="text-blue-600">{formatBDT(order.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
