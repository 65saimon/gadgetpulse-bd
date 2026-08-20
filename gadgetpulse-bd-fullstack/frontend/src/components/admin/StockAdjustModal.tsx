'use client';

import React, { useState } from 'react';
import { X, Boxes, AlertCircle } from 'lucide-react';
import { Product } from '../../types';
import { apiRequest } from '../../lib/api';

interface StockAdjustModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  product,
  onClose,
  onSuccess,
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0].id : ''
  );
  const [adjustmentType, setAdjustmentType] = useState('MANUAL_ADJUSTMENT');
  const [changeQty, setChangeQty] = useState('');
  const [reason, setReason] = useState('Physical audit count adjustment');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const currentStock = currentVariant ? currentVariant.stockQuantity : product.stockQuantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const qty = parseInt(changeQty);
    if (isNaN(qty) || qty === 0) {
      setError('Please enter a non-zero quantity change (e.g. +5 or -2).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest('/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariantId || undefined,
          type: adjustmentType,
          changeQuantity: qty,
          reason,
        }),
      });

      if (res.success) {
        onSuccess();
      } else {
        setError(res.message || 'Failed to adjust stock.');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-black text-slate-900">Stock Inventory Adjustment</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold">
              {error}
            </div>
          )}

          <div>
            <span className="text-slate-400 block font-bold">Target Product:</span>
            <p className="font-bold text-slate-900 text-sm">{product.name}</p>
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Specific Variant:</label>
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
              >
                {product.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} (Current: {v.stockQuantity})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Current Stock Banner */}
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between font-bold text-xs text-blue-900">
            <span>Current Available Stock:</span>
            <span className="text-base text-blue-700">{currentStock} Units</span>
          </div>

          {/* Adjustment Type */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Adjustment Reason / Type:</label>
            <select
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
            >
              <option value="MANUAL_ADJUSTMENT">Physical Audit Count Adjust</option>
              <option value="DAMAGE_WRITEOFF">Damaged / Defective Write-off</option>
              <option value="RETURN_RESTORE">Customer RMA / Return Restored</option>
              <option value="STOCK_IN_PURCHASE">Direct Supplier Inflow</option>
            </select>
          </div>

          {/* Delta Quantity */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Quantity Adjustment (Positive to Add, Negative to Deduct):
            </label>
            <input
              type="number"
              required
              placeholder="e.g. +5 or -2"
              value={changeQty}
              onChange={(e) => setChangeQty(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-600 focus:bg-white"
            />
            {changeQty && (
              <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                New Stock Balance will be:{' '}
                <b className="text-blue-600">{Math.max(0, currentStock + (parseInt(changeQty) || 0))} Units</b>
              </p>
            )}
          </div>

          {/* Reason note */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Audit Notes / Justification *</label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Applying...' : 'Apply Stock Change'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
