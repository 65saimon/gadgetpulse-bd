'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  RefreshCw,
  PieChart,
} from 'lucide-react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { apiRequest, formatBDT, formatDate } from '../../../lib/api';
import { exportToExcel, exportToCSV } from '../../../lib/excel-export';

export default function AdminReportsPage() {
  const [activeReport, setActiveReport] = useState<'sales' | 'products' | 'customers' | 'inventory'>('sales');
  const [salesReport, setSalesReport] = useState<any>(null);
  const [productMargins, setProductMargins] = useState<any[]>([]);
  const [customerSpend, setCustomerSpend] = useState<any[]>([]);
  const [inventoryVal, setInventoryVal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadReportData = async () => {
    setLoading(true);
    try {
      const [salesRes, prodRes, custRes, invRes] = await Promise.all([
        apiRequest(`/reports/sales?startDate=${startDate}&endDate=${endDate}`),
        apiRequest('/reports/products'),
        apiRequest('/reports/customers'),
        apiRequest('/reports/inventory'),
      ]);

      if (salesRes.success) setSalesReport(salesRes.data);
      if (prodRes.success) setProductMargins(prodRes.data || []);
      if (custRes.success) setCustomerSpend(custRes.data || []);
      if (invRes.success) setInventoryVal(invRes.data);
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [startDate, endDate]);

  const handleExportExcel = () => {
    if (activeReport === 'sales') {
      const rows = (salesReport?.dailyBreakdown || []).map((d: any) => ({
        Date: d.date,
        Orders: d.orders,
        'Gross Revenue (BDT)': d.sales,
      }));
      exportToExcel(rows, `GadgetPulse_Sales_Report_${new Date().toISOString().slice(0, 10)}`);
    } else if (activeReport === 'products') {
      const rows = productMargins.map((p) => ({
        'Product Title': p.name,
        Category: p.category,
        'Selling Price (BDT)': p.sellingPrice,
        'Unit Cost (BDT)': p.costPrice,
        'Units Sold': p.unitsSold,
        'Total Revenue (BDT)': p.totalRevenue,
        'Total Profit (BDT)': p.totalProfit,
        'Gross Margin %': `${p.marginPercent}%`,
      }));
      exportToExcel(rows, `GadgetPulse_Product_Profit_Report_${new Date().toISOString().slice(0, 10)}`);
    } else if (activeReport === 'customers') {
      const rows = customerSpend.map((c) => ({
        'Customer Name': c.name,
        Phone: c.phone,
        Email: c.email,
        'Completed Orders': c.orderCount,
        'Lifetime Revenue (BDT)': c.totalSpent,
      }));
      exportToExcel(rows, `GadgetPulse_Customer_LTV_Report_${new Date().toISOString().slice(0, 10)}`);
    } else if (activeReport === 'inventory') {
      const rows = (inventoryVal?.items || []).map((i: any) => ({
        Product: i.name,
        SKU: i.sku,
        'On Hand Stock (Units)': i.stock,
        'Unit Cost (BDT)': i.purchasePrice,
        'Total Valuation (BDT)': i.totalCost,
        'Selling Price (BDT)': i.sellingPrice,
        'Potential Retail Value (BDT)': i.totalRetail,
      }));
      exportToExcel(rows, `GadgetPulse_Inventory_Valuation_${new Date().toISOString().slice(0, 10)}`);
    }
  };

  const handleExportCSV = () => {
    if (activeReport === 'sales') {
      const rows = (salesReport?.dailyBreakdown || []).map((d: any) => ({
        Date: d.date,
        Orders: d.orders,
        Revenue: d.sales,
      }));
      exportToCSV(rows, 'Sales_Report.csv');
    } else if (activeReport === 'products') {
      const rows = productMargins.map((p) => ({
        Name: p.name,
        SellingPrice: p.sellingPrice,
        Cost: p.costPrice,
        Revenue: p.totalRevenue,
        Profit: p.totalProfit,
        Margin: `${p.marginPercent}%`,
      }));
      exportToCSV(rows, 'Product_Profit_Report.csv');
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Financial & Sales Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Exportable analytics for gross margin, profit breakdowns, customer LTV, and asset valuations
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs sm:text-sm font-bold overflow-x-auto">
        <button
          onClick={() => setActiveReport('sales')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeReport === 'sales' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Sales & Revenue Report</span>
        </button>

        <button
          onClick={() => setActiveReport('products')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeReport === 'products' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Product Profit Margins</span>
        </button>

        <button
          onClick={() => setActiveReport('customers')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeReport === 'customers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Customer Purchase Volume</span>
        </button>

        <button
          onClick={() => setActiveReport('inventory')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeReport === 'inventory' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Inventory Asset Valuation</span>
        </button>
      </div>

      {/* 1. Sales Report */}
      {activeReport === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Gross Revenue</span>
              <div className="text-2xl font-black text-slate-900">
                {formatBDT(salesReport?.totalRevenue || 0)}
              </div>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-emerald-600 uppercase">Net Gross Profit</span>
              <div className="text-2xl font-black text-emerald-600">
                {formatBDT(salesReport?.totalProfit || 0)}
              </div>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Orders Delivered</span>
              <div className="text-2xl font-black text-slate-900">
                {salesReport?.orderCount || 0} Orders
              </div>
            </div>
          </div>

          {/* Daily Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Date</th>
                  <th className="p-4">Orders</th>
                  <th className="p-4">Daily Revenue (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {(salesReport?.dailyBreakdown || []).map((d: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 font-mono font-bold text-slate-800">{d.date}</td>
                    <td className="p-4 text-slate-600">{d.orders} Orders</td>
                    <td className="p-4 font-black text-slate-900">{formatBDT(d.sales)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Product Margins */}
      {activeReport === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Product Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Selling Price</th>
                  <th className="p-4">Unit Cost</th>
                  <th className="p-4">Units Sold</th>
                  <th className="p-4">Total Revenue</th>
                  <th className="p-4">Net Profit (BDT)</th>
                  <th className="p-4">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {productMargins.map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 font-bold text-slate-900">{p.name}</td>
                    <td className="p-4 text-slate-500">{p.category}</td>
                    <td className="p-4 font-bold text-slate-800">{formatBDT(p.sellingPrice)}</td>
                    <td className="p-4 font-mono text-slate-500">{formatBDT(p.costPrice)}</td>
                    <td className="p-4 font-bold text-slate-800">{p.unitsSold}</td>
                    <td className="p-4 font-bold text-slate-900">{formatBDT(p.totalRevenue)}</td>
                    <td className="p-4 font-black text-emerald-600">+{formatBDT(p.totalProfit)}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded font-black text-xs bg-emerald-50 text-emerald-700">
                        {p.marginPercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Customer Spend */}
      {activeReport === 'customers' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Orders Count</th>
                  <th className="p-4">Total Spent (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {customerSpend.map((c: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 font-bold text-slate-900">{c.name}</td>
                    <td className="p-4 font-mono text-slate-600">{c.phone}</td>
                    <td className="p-4 font-bold text-slate-800">{c.orderCount} Orders</td>
                    <td className="p-4 font-black text-blue-600 text-sm">{formatBDT(c.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Inventory Valuation */}
      {activeReport === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Inventory Investment (Cost)</span>
              <div className="text-2xl font-black text-slate-900">
                {formatBDT(inventoryVal?.totalValuationCost || 0)}
              </div>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold text-blue-600 uppercase">Projected Retail Realization</span>
              <div className="text-2xl font-black text-blue-600">
                {formatBDT(inventoryVal?.totalValuationRetail || 0)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Device</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Stock (Units)</th>
                    <th className="p-4">Unit Cost</th>
                    <th className="p-4">Total Cost Valuation</th>
                    <th className="p-4">Potential Retail Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {(inventoryVal?.items || []).map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition">
                      <td className="p-4 font-bold text-slate-900">{item.name}</td>
                      <td className="p-4 font-mono text-slate-500">{item.sku}</td>
                      <td className="p-4 font-bold text-slate-800">{item.stock} Units</td>
                      <td className="p-4 font-mono text-slate-600">{formatBDT(item.purchasePrice)}</td>
                      <td className="p-4 font-black text-slate-900">{formatBDT(item.totalCost)}</td>
                      <td className="p-4 font-bold text-blue-600">{formatBDT(item.totalRetail)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
