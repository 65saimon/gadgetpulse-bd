'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  ArrowLeft,
  ShoppingBag,
  Clock,
  Download,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { AdminLayout } from '../../../../components/admin/AdminLayout';
import { apiRequest, formatBDT, formatDate } from '../../../../lib/api';
import { generateInvoicePDF } from '../../../../lib/invoice-pdf';

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomer() {
      try {
        const res = await apiRequest(`/customers/${customerId}`);
        if (res.success && res.customer) {
          setCustomer(res.customer);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomer();
  }, [customerId]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-12 text-center text-slate-400 animate-pulse">
          Loading customer CRM file...
        </div>
      </AdminLayout>
    );
  }

  if (!customer) {
    return (
      <AdminLayout>
        <div className="p-12 text-center">Customer not found.</div>
      </AdminLayout>
    );
  }

  const totalSpent = (customer.orders || [])
    .filter((o: any) => o.paymentStatus === 'PAID')
    .reduce((sum: number, o: any) => sum + o.grandTotal, 0);

  return (
    <AdminLayout>
      <div className="flex items-center gap-3">
        <Link
          href="/admin/customers"
          className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">{customer.fullName}</h1>
          <p className="text-xs text-slate-400">Customer CRM Profile & History</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Customer Info Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg uppercase">
              {customer.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">{customer.fullName}</h2>
              <span className="text-[10px] text-slate-400">Member since {formatDate(customer.createdAt)}</span>
            </div>
          </div>

          <div className="space-y-2 text-slate-700">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{customer.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="font-bold">{customer.phone}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>
                {customer.address ? `${customer.address}, ` : ''}
                {customer.upazila}, {customer.district}, {customer.division}
              </span>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">Lifetime Revenue</span>
            <div className="text-2xl font-black text-blue-700">{formatBDT(totalSpent)}</div>
            <span className="text-[11px] text-slate-600 block">{customer.orders?.length || 0} Total Orders placed</span>
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-black text-slate-900">Purchase & Order History</h2>

          <div className="divide-y divide-slate-100">
            {(customer.orders || []).map((ord: any) => (
              <div key={ord.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <Link href={`/admin/orders/${ord.id}`} className="font-mono font-bold text-blue-600 hover:underline">
                    {ord.orderNumber}
                  </Link>
                  <p className="text-[11px] text-slate-400">{formatDate(ord.createdAt)} • {ord.items?.length || 1} item(s)</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    ord.orderStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {ord.orderStatus}
                  </span>

                  <span className="font-black text-slate-900">{formatBDT(ord.grandTotal)}</span>

                  <Link
                    href={`/admin/orders/${ord.id}`}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
