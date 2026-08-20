'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  Boxes,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  FileText,
  Clock,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { apiRequest, formatBDT, formatDate } from '../../lib/api';

const STATUS_COLORS: { [key: string]: string } = {
  DELIVERED: '#10B981',
  SHIPPED: '#3B82F6',
  PROCESSING: '#6366F1',
  PENDING: '#F59E0B',
  CANCELLED: '#EF4444',
  RETURNED: '#EC4899',
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState('month');
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, chartsRes, ordersRes] = await Promise.all([
        apiRequest('/admin/stats'),
        apiRequest('/admin/charts'),
        apiRequest('/orders/admin/list?limit=6'),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (chartsRes.success) setCharts(chartsRes.charts);
      if (ordersRes.success) setRecentOrders(ordersRes.data || []);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <AdminLayout>
      {/* Header and Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Executive ERP Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time retail sales performance, gross profit, inventory status, and order fulfillment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm text-xs font-bold">
            {['today', 'week', 'month', 'all'].map((f) => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-3 py-1.5 rounded-xl capitalize transition ${
                  dateFilter === f ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f === 'today' ? 'Today' : f === 'week' ? 'Last 7D' : f === 'month' ? 'This Month' : 'All Time'}
              </button>
            ))}
          </div>

          <button
            onClick={loadDashboard}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl text-slate-600 shadow-sm transition"
            title="Refresh Live Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 5 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Sales */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {dateFilter === 'today' ? "Today's Sales" : dateFilter === 'week' ? '7-Day Sales' : "Month's Sales"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatBDT(
              dateFilter === 'today'
                ? stats?.todaySales
                : dateFilter === 'week'
                ? stats?.weekSales
                : stats?.monthSales || stats?.totalSales
            )}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs last cycle</span>
          </div>
        </div>

        {/* Estimated Gross Profit */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Profit</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {formatBDT(stats?.totalProfit || 0)}
          </div>
          <div className="text-[11px] text-slate-400">Revenue - Purchase Costs</div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalOrders || 0}</div>
          <div className="text-[11px] text-amber-600 font-bold">
            {stats?.pendingOrders || 0} pending processing
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customers CRM</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalCustomers || 0}</div>
          <div className="text-[11px] text-slate-400">Registered BD shoppers</div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">{stats?.lowStockProducts || 0}</div>
          <div className="text-[11px] text-rose-500 font-bold">
            {stats?.outOfStockProducts || 0} completely out of stock
          </div>
        </div>
      </div>

      {/* Recharts Data Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sales Trend Area Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Revenue & Sales Trend</h2>
              <p className="text-xs text-slate-400">Daily sales velocity over the last 14 days</p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.dailySales || []}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `৳${v / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [`৳${Number(value).toLocaleString()}`, 'Daily Revenue']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution Pie */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-black text-slate-900">Orders Status Breakdown</h2>
            <p className="text-xs text-slate-400">Current fulfillment distribution</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.orderStatus || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {(charts?.orderStatus || []).map((entry: any) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
            {(charts?.orderStatus || []).slice(0, 4).map((s: any) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.name] || '#94A3B8' }} />
                <span className="text-slate-600 font-semibold">{s.name}:</span>
                <span className="font-bold text-slate-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Category Bar Chart */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-black text-slate-900">Revenue by Product Category</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.categoryRevenue || []} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `৳${v / 1000}k`} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={11} tickLine={false} width={100} />
                <Tooltip
                  formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Best Selling Devices */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900">Top 5 Best Selling Models</h2>
            <Link href="/admin/reports" className="text-xs font-bold text-blue-600 hover:underline">
              Full Report →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {(charts?.topSellingProducts || []).map((p: any, i: number) => (
              <div key={i} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                    <p className="text-slate-400">{p.units} units sold</p>
                  </div>
                </div>
                <div className="text-sm font-black text-slate-900 text-right">
                  {formatBDT(p.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Ledger */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900">Recent Customer Orders</h2>
            <p className="text-xs text-slate-400">Live order queue from storefront</p>
          </div>
          <Link href="/admin/orders" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            <span>Manage All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Total (BDT)</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 font-mono font-bold text-blue-600">{ord.orderNumber}</td>
                  <td className="py-3.5">
                    <p className="font-bold text-slate-900">{ord.customerName}</p>
                    <p className="text-[11px] text-slate-400">{ord.customerPhone}</p>
                  </td>
                  <td className="py-3.5 text-slate-600">{ord.items?.length || 1} Item(s)</td>
                  <td className="py-3.5">
                    <span className="font-bold text-slate-800">{ord.paymentMethod.replace(/_/g, ' ')}</span>
                    <span className={`block text-[10px] ${ord.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 font-black text-slate-900">{formatBDT(ord.grandTotal)}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      ord.orderStatus === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.orderStatus === 'CANCELLED' || ord.orderStatus === 'RETURNED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      href={`/admin/orders/${ord.id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs font-bold transition inline-block"
                    >
                      Process →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
