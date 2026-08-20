'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  Phone,
  DollarSign,
} from 'lucide-react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { apiRequest, formatBDT, formatDate } from '../../../lib/api';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('limit', '15');

      const res = await apiRequest(`/customers?${params.toString()}`);
      if (res.success) {
        setCustomers(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search, page]);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Customer Directory & CRM
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Analyze customer lifetime value (LTV), total purchase volume, and order histories for {totalCount} clients
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search by customer name, email, or phone number..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 font-medium"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Customer Name</th>
                <th className="p-4">Contact Details</th>
                <th className="p-4">Location</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Lifetime Spent (BDT)</th>
                <th className="p-4">Member Since</th>
                <th className="p-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 animate-pulse">
                    Loading customer accounts...
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs uppercase">
                          {c.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{c.fullName}</p>
                          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                            Active Shopper
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{c.phone}</p>
                      <p className="text-slate-400 text-[11px]">{c.email}</p>
                    </td>

                    <td className="p-4 text-slate-600">
                      {c.upazila ? `${c.upazila}, ${c.district}` : c.district || 'Dhaka'}
                    </td>

                    <td className="p-4 font-bold text-slate-900">
                      {c.orderCount || c.orders?.length || 0} Orders
                    </td>

                    <td className="p-4 font-black text-blue-600 text-sm">
                      {formatBDT(c.totalSpent || 0)}
                    </td>

                    <td className="p-4 text-slate-400">{formatDate(c.createdAt)}</td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-bold rounded-xl transition inline-block text-xs"
                      >
                        View CRM
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No customers found matching search.
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
              Page {page} of {totalPages} ({totalCount} customers)
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
