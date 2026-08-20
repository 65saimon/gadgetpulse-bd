'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, X, Trash2, Boxes, CheckCircle2 } from 'lucide-react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { apiRequest, formatBDT, formatDate } from '../../../lib/api';
import { Supplier, Product } from '../../../types';

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // New PO Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [status, setStatus] = useState('RECEIVED');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const [purRes, supRes, prodRes] = await Promise.all([
        apiRequest('/purchases'),
        apiRequest('/suppliers'),
        apiRequest('/products/admin/list?limit=100'),
      ]);

      if (purRes.success) setPurchases(purRes.data || []);
      if (supRes.success) {
        setSuppliers(supRes.data || []);
        if (supRes.data?.length > 0) setSupplierId(supRes.data[0].id);
      }
      if (prodRes.success) setProducts(prodRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  const openNewPOModal = () => {
    if (products.length > 0) {
      const firstProd = products[0];
      setItems([
        {
          productId: firstProd.id,
          variantId: firstProd.variants?.[0]?.id || undefined,
          quantity: 10,
          unitCost: firstProd.purchasePrice || 50000,
        },
      ]);
    }
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    if (products.length > 0) {
      const firstProd = products[0];
      setItems([
        ...items,
        {
          productId: firstProd.id,
          variantId: firstProd.variants?.[0]?.id || undefined,
          quantity: 5,
          unitCost: firstProd.purchasePrice || 50000,
        },
      ]);
    }
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    // If changing product, reset unitCost and variant
    if (field === 'productId') {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        updated[index].unitCost = prod.purchasePrice || 0;
        updated[index].variantId = prod.variants?.[0]?.id || undefined;
      }
    }
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalCost = items.reduce((sum, item) => sum + (parseFloat(item.unitCost) || 0) * (parseInt(item.quantity) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Please add at least one item.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        supplierId,
        status,
        notes,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId || undefined,
          quantity: parseInt(i.quantity) || 1,
          unitCost: parseFloat(i.unitCost) || 0,
        })),
      };

      const res = await apiRequest('/purchases', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setIsModalOpen(false);
        loadPurchases();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to record purchase order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Purchase Orders & Restock Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Procurement management that automatically increments product stock and logs inventory ledger entries
          </p>
        </div>

        <button
          onClick={openNewPOModal}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Restock Purchase</span>
        </button>
      </div>

      {/* PO Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">PO Number</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Items Received</th>
                <th className="p-4">Total Cost (BDT)</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {purchases.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-4 font-mono font-bold text-blue-600">{po.poNumber}</td>
                  <td className="p-4 font-bold text-slate-900">{po.supplier?.name}</td>
                  <td className="p-4 text-slate-700">
                    <span className="font-bold">{po.items?.length || 1} Device Models</span>
                    <p className="text-[11px] text-slate-400">
                      {po.items?.reduce((s: number, i: any) => s + i.quantity, 0)} Units total
                    </p>
                  </td>
                  <td className="p-4 font-black text-slate-900 text-sm">
                    {formatBDT(po.totalCost)}
                  </td>
                  <td className="p-4 text-slate-500 font-mono">{formatDate(po.createdAt)}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {po.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-black text-slate-900">Record Restock Purchase Order</h2>
                <p className="text-xs text-slate-400">Inventory will auto-increase upon saving</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supplier *</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-600"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Receipt Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-600"
                  >
                    <option value="RECEIVED">RECEIVED (Auto Restock Immediately)</option>
                    <option value="ORDERED">ORDERED (Pending Delivery)</option>
                  </select>
                </div>
              </div>

              {/* Items Table in Modal */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Restock Items List:</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Device</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => {
                    const selProd = products.find((p) => p.id === item.productId);
                    return (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <div className="sm:col-span-5">
                          <label className="text-[10px] text-slate-400 block font-bold">Product</label>
                          <select
                            value={item.productId}
                            onChange={(e) => handleUpdateItem(idx, 'productId', e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {selProd?.variants && selProd.variants.length > 0 && (
                          <div className="sm:col-span-3">
                            <label className="text-[10px] text-slate-400 block font-bold">Variant</label>
                            <select
                              value={item.variantId || ''}
                              onChange={(e) => handleUpdateItem(idx, 'variantId', e.target.value)}
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            >
                              {selProd.variants.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-400 block font-bold">Qty (Units)</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-center gap-1">
                          <div className="flex-1">
                            <label className="text-[10px] text-slate-400 block font-bold">Unit Cost</label>
                            <input
                              type="number"
                              value={item.unitCost}
                              onChange={(e) => handleUpdateItem(idx, 'unitCost', e.target.value)}
                              className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg mt-4"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between text-xs font-bold text-blue-900">
                <span>Total PO Purchase Investment:</span>
                <span className="text-base text-blue-700">{formatBDT(totalCost)}</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Challan Number</label>
                <textarea
                  rows={2}
                  placeholder="Challan #CH-88190 from Dhaka warehouse..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Recording Restock...' : 'Submit & Restock Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
