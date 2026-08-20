'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ShieldCheck, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Product, Category, Brand, ProductVariant } from '../../types';
import { apiRequest } from '../../lib/api';

interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  brands: Brand[];
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  categories,
  brands,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!product;

  const [name, setName] = useState(product?.name || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [brandId, setBrandId] = useState(product?.brandId || (brands[0]?.id || ''));
  const [categoryId, setCategoryId] = useState(product?.categoryId || (categories[0]?.id || ''));
  const [regularPrice, setRegularPrice] = useState(product?.regularPrice ? String(product.regularPrice) : '');
  const [discountPrice, setDiscountPrice] = useState(product?.discountPrice ? String(product.discountPrice) : '');
  const [purchasePrice, setPurchasePrice] = useState(product?.purchasePrice ? String(product.purchasePrice) : '');
  const [stockQuantity, setStockQuantity] = useState(product?.stockQuantity ? String(product.stockQuantity) : '10');
  const [minStockLevel, setMinStockLevel] = useState(product?.minStockLevel ? String(product.minStockLevel) : '5');
  const [warranty, setWarranty] = useState(product?.warranty || '1 Year Official Warranty');
  const [mainImage, setMainImage] = useState(
    product?.mainImage || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=700'
  );
  const [shortDesc, setShortDesc] = useState(product?.shortDesc || '');
  const [description, setDescription] = useState(product?.description || '');
  const [isPublished, setIsPublished] = useState(product?.isPublished ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [isBestSeller, setIsBestSeller] = useState(product?.isBestSeller ?? false);
  const [isNewArrival, setIsNewArrival] = useState(product?.isNewArrival ?? true);

  // Variants state
  const [variants, setVariants] = useState<any[]>(
    product?.variants && product.variants.length > 0
      ? product.variants
      : []
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        name: '256GB - Titanium Black',
        color: 'Titanium Black',
        colorCode: '#1C1C1C',
        storage: '256GB',
        ram: '8GB',
        sku: `${sku || 'SKU'}-${variants.length + 1}`,
        purchasePrice: parseFloat(purchasePrice) || 0,
        regularPrice: parseFloat(regularPrice) || 0,
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        stockQuantity: 10,
      },
    ]);
  };

  const handleUpdateVariant = (index: number, field: string, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !sku || !brandId || !categoryId || !regularPrice || !mainImage) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        sku,
        brandId,
        categoryId,
        regularPrice: parseFloat(regularPrice),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : 0,
        stockQuantity: parseInt(stockQuantity) || 0,
        minStockLevel: parseInt(minStockLevel) || 5,
        warranty,
        mainImage,
        shortDesc,
        description,
        isPublished,
        isFeatured,
        isBestSeller,
        isNewArrival,
        variants,
      };

      const res = isEditing
        ? await apiRequest(`/products/admin/${product.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          })
        : await apiRequest('/products/admin', {
            method: 'POST',
            body: JSON.stringify(payload),
          });

      if (res.success) {
        onSuccess();
      } else {
        setError(res.message || 'Failed to save product.');
      }
    } catch (err: any) {
      setError(err.message || 'Server error while saving product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {isEditing ? `Edit Product: ${product.name}` : 'Add New Smartphone / Gadget'}
            </h2>
            <p className="text-xs text-slate-500">Configure catalog specs, pricing, warranty and variants</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold">
              {error}
            </div>
          )}

          {/* 1. Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Apple iPhone 16 Pro Max"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Master SKU / Barcode *</label>
              <input
                type="text"
                required
                placeholder="IP16PM-MST"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Main Image URL *</label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={mainImage}
                onChange={(e) => setMainImage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Brand *</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-blue-600"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-blue-600"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Pricing & Base Inventory */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Selling Price (BDT) *</label>
              <input
                type="number"
                required
                placeholder="189999"
                value={regularPrice}
                onChange={(e) => setRegularPrice(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Discount Price (BDT)</label>
              <input
                type="number"
                placeholder="Optional"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-rose-600 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Purchase / Cost (BDT)</label>
              <input
                type="number"
                placeholder="Cost for Profit Margin"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                placeholder="10"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* 3. Product Variants Builder */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Product Models & Variants</h3>
                <p className="text-[11px] text-slate-400">Configure Color, Storage, RAM & specific stock quantities</p>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variant</span>
              </button>
            </div>

            {variants.length > 0 && (
              <div className="space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
                {variants.map((v, i) => (
                  <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-6 gap-2 items-center">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 font-bold block">Variant Name</label>
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => handleUpdateVariant(i, 'name', e.target.value)}
                        className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block">SKU</label>
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => handleUpdateVariant(i, 'sku', e.target.value)}
                        className="w-full p-1.5 border border-slate-200 rounded-lg font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block">Price (BDT)</label>
                      <input
                        type="number"
                        value={v.discountPrice || v.regularPrice}
                        onChange={(e) => handleUpdateVariant(i, 'regularPrice', parseFloat(e.target.value))}
                        className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block">Stock Qty</label>
                      <input
                        type="number"
                        value={v.stockQuantity}
                        onChange={(e) => handleUpdateVariant(i, 'stockQuantity', parseInt(e.target.value))}
                        className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div className="flex justify-end pt-3 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(i)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Description & Warranty */}
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Short Description (Key Spec Highlights)</label>
              <input
                type="text"
                placeholder="e.g. A18 Pro chip, Grade 5 Titanium, 48MP Fusion Camera"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Description / Overview</label>
              <textarea
                rows={3}
                placeholder="Comprehensive product writeup..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Warranty Statement</label>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              {/* Flags */}
              <div className="flex items-center gap-4 pt-4">
                <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Published Live</span>
                </label>
                <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Best Seller</span>
                </label>
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
