'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { apiRequest, formatBDT, formatDate } from '../../../lib/api';
import { generateInvoicePDF } from '../../../lib/invoice-pdf';
import { Invoice } from '../../../types';

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('limit', '15');

      const res = await apiRequest(`/invoices?${params.toString()}`);
      if (res.success) {
        setInvoices(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [search, page]);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Official Tax Invoices
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, print, and download authenticated A4 tax receipts for {totalCount} retail orders
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search by Invoice No (INV-2026-...), Customer, or Phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 font-medium"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Invoice Number</th>
                <th className="p-4">Date Issued</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Subtotal</th>
                <th className="p-4">VAT (5%)</th>
                <th className="p-4">Grand Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 animate-pulse">
                    Loading tax invoices...
                  </td>
                </tr>
              ) : invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 font-mono font-bold text-blue-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-4 text-slate-500">{formatDate(inv.issueDate)}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{inv.customerName}</p>
                      <p className="text-[11px] text-slate-400">{inv.customerPhone}</p>
                    </td>
                    <td className="p-4 font-mono">{formatBDT(inv.subtotal)}</td>
                    <td className="p-4 font-mono text-slate-500">{formatBDT(inv.vat)}</td>
                    <td className="p-4 font-black text-slate-900 text-sm">
                      {formatBDT(inv.grandTotal)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => generateInvoicePDF(inv)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl transition inline-flex items-center gap-1 text-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No invoices matching search.
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
              Page {page} of {totalPages} ({totalCount} invoices)
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
