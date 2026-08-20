'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { apiRequest, formatBDT, formatDateTime } from '../../../lib/api';
import { generateInvoicePDF } from '../../../lib/invoice-pdf';
import { Order } from '../../../types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (paymentFilter !== 'all') params.set('paymentStatus', paymentFilter);
      params.set('page', String(page));
      params.set('limit', '15');

      const res = await apiRequest(`/orders/admin/list?${params.toString()}`);
      if (res.success) {
        setOrders(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [search, statusFilter, paymentFilter, page]);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Order Management & Fulfillment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track, confirm, pack, ship, and generate tax invoices for {totalCount} retail orders
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-bold text-slate-600 mb-1">Search Order ID / Phone / TrxID</label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. ORD-20260821-0001, 01711..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 font-medium"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Fulfillment Status</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-600"
          >
            <option value="all">All Order Statuses</option>
            <option value="PENDING">Pending (New)</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered (Completed)</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RETURNED">Returned</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Payment Status</label>
          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-600"
          >
            <option value="all">All Payment Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed / Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Items Summary</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Grand Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 animate-pulse">
                    Loading orders queue...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4">
                      <Link href={`/admin/orders/${ord.id}`} className="font-mono font-bold text-blue-600 hover:underline">
                        {ord.orderNumber}
                      </Link>
                      <p className="text-[11px] text-slate-400">{formatDateTime(ord.createdAt)}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-900">{ord.customerName}</p>
                      <p className="text-[11px] text-slate-500">{ord.customerPhone}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{ord.district}, {ord.division}</p>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-slate-800">{ord.items?.length || 1} Item(s)</span>
                      <p className="text-[11px] text-slate-500 truncate max-w-[160px]">
                        {ord.items?.[0]?.productName || 'Gadget'}
                      </p>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-slate-800">{ord.paymentMethod.replace(/_/g, ' ')}</span>
                      {ord.transactionId && (
                        <span className="block font-mono text-[10px] text-blue-600 truncate max-w-[120px]">
                          Trx: {ord.transactionId}
                        </span>
                      )}
                      <span className={`block text-[10px] font-bold ${ord.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {ord.paymentStatus}
                      </span>
                    </td>

                    <td className="p-4 font-black text-slate-900 text-sm">
                      {formatBDT(ord.grandTotal)}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        ord.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatus === 'CANCELLED' || ord.orderStatus === 'RETURNED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {ord.invoice && (
                          <button
                            onClick={() => generateInvoicePDF({ ...ord.invoice!, order: ord })}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            title="Download PDF Invoice"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition inline-block text-xs"
                        >
                          Process
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No orders found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Page {page} of {totalPages} ({totalCount} orders)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-slate-200 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-xl border border-slate-200 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
