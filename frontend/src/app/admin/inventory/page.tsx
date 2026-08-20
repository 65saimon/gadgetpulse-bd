'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  TrendingUp,
  AlertTriangle,
  History,
  Plus,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { StockAdjustModal } from '../../../components/admin/StockAdjustModal';
import { apiRequest, formatBDT, formatDateTime } from '../../../lib/api';
import { Product, InventoryTransaction } from '../../../types';

export default function AdminInventoryPage() {
  const [overview, setOverview] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'stock' | 'history'>('stock');
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const [overRes, listRes, histRes] = await Promise.all([
        apiRequest('/inventory/overview'),
        apiRequest(`/inventory/list?search=${encodeURIComponent(search)}&status=${statusFilter}`),
        apiRequest('/inventory/history?limit=30'),
      ]);

      if (overRes.success) setOverview(overRes.data);
      if (listRes.success) setProducts(listRes.data || []);
      if (histRes.success) setTransactions(histRes.data || []);
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [search, statusFilter]);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Inventory & Stock Valuation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time asset valuation, low-stock threshold monitoring, and complete inventory movement ledger
          </p>
        </div>

        <button
          onClick={loadInventory}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl text-slate-600 shadow-sm self-start sm:self-auto"
          title="Refresh Stock"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 4 Inventory Valuation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Stock Valuation (Cost)</span>
          <div className="text-2xl font-black text-slate-900">
            {formatBDT(overview?.totalPurchaseValue || 0)}
          </div>
          <p className="text-[11px] text-slate-400">{overview?.totalUnits || 0} Total physical units on hand</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Potential Retail Value</span>
          <div className="text-2xl font-black text-blue-600">
            {formatBDT(overview?.totalSellingValue || 0)}
          </div>
          <p className="text-[11px] text-emerald-600 font-bold">
            Projected Margin: {formatBDT((overview?.totalSellingValue || 0) - (overview?.totalPurchaseValue || 0))}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Low Stock Threshold</span>
          <div className="text-2xl font-black text-amber-600">{overview?.lowStockCount || 0} Models</div>
          <p className="text-[11px] text-amber-700">Stock &lt;= 5 units (Reorder recommended)</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Out of Stock Alert</span>
          <div className="text-2xl font-black text-rose-600">{overview?.outOfStockCount || 0} Models</div>
          <p className="text-[11px] text-rose-500 font-bold">0 units available</p>
        </div>
      </div>

      {/* Tab Switcher: Current Stock vs Movement History */}
      <div className="flex border-b border-slate-200 gap-6 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('stock')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'stock' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Active Product Stock</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Stock Movement Ledger ({transactions.length})</span>
        </button>
      </div>

      {/* Tab 1: Current Stock */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search device name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 text-xs font-medium"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-bold text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none"
              >
                <option value="all">All Levels</option>
                <option value="IN_STOCK">In Stock (&gt;5)</option>
                <option value="LOW_STOCK">Low Stock (1-5)</option>
                <option value="OUT_OF_STOCK">Out of Stock (0)</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Device</th>
                    <th className="p-4">Master SKU</th>
                    <th className="p-4">Unit Cost</th>
                    <th className="p-4">Selling Price</th>
                    <th className="p-4">Stock Units</th>
                    <th className="p-4">Total Asset Value</th>
                    <th className="p-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.mainImage}
                            alt={p.name}
                            className="w-10 h-10 object-contain rounded-lg bg-slate-50 border border-slate-100 p-1 flex-shrink-0"
                          />
                          <div>
                            <h4 className="font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                            <p className="text-[11px] text-slate-400">{p.brand?.name} • {p.category?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-700">{p.sku}</td>
                      <td className="p-4 font-mono text-slate-600">{formatBDT(p.purchasePrice)}</td>
                      <td className="p-4 font-black text-slate-900">{formatBDT(p.discountPrice || p.regularPrice)}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full font-black text-xs ${
                            p.stockQuantity === 0
                              ? 'bg-rose-100 text-rose-700'
                              : p.stockQuantity <= p.minStockLevel
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.stockQuantity} Units
                        </span>
                      </td>
                      <td className="p-4 font-black text-slate-900">
                        {formatBDT(p.stockQuantity * p.purchasePrice)}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setAdjustProduct(p)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl transition"
                        >
                          Adjust Qty
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Movement History Ledger */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Product / SKU</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Prev Qty</th>
                  <th className="p-4">Change</th>
                  <th className="p-4">New Qty</th>
                  <th className="p-4">Reason / Notes</th>
                  <th className="p-4">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 text-slate-500 font-mono">{formatDateTime(tx.createdAt)}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{tx.product?.name}</p>
                      {tx.variant && <p className="text-[11px] text-blue-600 font-semibold">{tx.variant.name}</p>}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-[10px] uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {tx.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono">{tx.prevQty}</td>
                    <td className="p-4 font-mono font-bold">
                      {tx.changeQty > 0 ? (
                        <span className="text-emerald-600 flex items-center gap-0.5">
                          <ArrowUpRight className="w-3.5 h-3.5" />+{tx.changeQty}
                        </span>
                      ) : (
                        <span className="text-rose-600 flex items-center gap-0.5">
                          <ArrowDownRight className="w-3.5 h-3.5" />{tx.changeQty}
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-black text-slate-900">{tx.newQty}</td>
                    <td className="p-4 text-slate-600 max-w-xs">{tx.reason || 'N/A'}</td>
                    <td className="p-4 text-slate-500 font-bold">{tx.actor || 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Adjust Modal */}
      {adjustProduct && (
        <StockAdjustModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onSuccess={() => {
            setAdjustProduct(null);
            loadInventory();
          }}
        />
      )}
    </AdminLayout>
  );
}
