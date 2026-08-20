'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Copy,
  Edit2,
  Trash2,
  Boxes,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { ProductModal } from '../../../components/admin/ProductModal';
import { StockAdjustModal } from '../../../components/admin/StockAdjustModal';
import { apiRequest, formatBDT, formatDate } from '../../../lib/api';
import { Product, Category, Brand } from '../../../types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [stockStatus, setStockStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedBrand && selectedBrand !== 'all') params.set('brand', selectedBrand);
      if (stockStatus && stockStatus !== 'all') params.set('stockStatus', stockStatus);
      params.set('page', String(page));
      params.set('limit', '15');

      const res = await apiRequest(`/products/admin/list?${params.toString()}`);
      if (res.success) {
        setProducts(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, brandRes] = await Promise.all([
          apiRequest('/categories/admin'),
          apiRequest('/brands'),
        ]);
        if (catRes.success) setCategories(catRes.data);
        if (brandRes.success) setBrands(brandRes.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory, selectedBrand, stockStatus, page]);

  const handleDuplicate = async (id: string) => {
    if (!confirm('Duplicate this product as a new draft?')) return;
    try {
      const res = await apiRequest(`/products/admin/${id}/duplicate`, { method: 'POST' });
      if (res.success) {
        loadProducts();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate product.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      const res = await apiRequest(`/products/admin/${id}`, { method: 'DELETE' });
      if (res.success) {
        loadProducts();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete product.');
    }
  };

  return (
    <AdminLayout>
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Products & Devices Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage {totalCount} mobile devices, models, prices, variants, and stock thresholds
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedProduct(null);
            setIsProductModalOpen(true);
          }}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-500/20 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-bold text-slate-600 mb-1">Search Products / SKU</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title or SKU..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white text-xs font-medium"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Category Filter</label>
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 font-bold"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Brand Filter</label>
          <select
            value={selectedBrand}
            onChange={(e) => { setSelectedBrand(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 font-bold"
          >
            <option value="all">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Stock Status</label>
          <select
            value={stockStatus}
            onChange={(e) => { setStockStatus(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 font-bold"
          >
            <option value="all">All Stock Statuses</option>
            <option value="IN_STOCK">In Stock (&gt; 5)</option>
            <option value="LOW_STOCK">Low Stock Alert (1 - 5)</option>
            <option value="OUT_OF_STOCK">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Product Info</th>
                <th className="p-4">Category & Brand</th>
                <th className="p-4">Selling Price</th>
                <th className="p-4">Cost Price</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4">Variants</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 animate-pulse">
                    Loading catalog devices...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    {/* Image & Title */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.mainImage}
                          alt={p.name}
                          className="w-12 h-12 object-contain rounded-xl bg-slate-50 border border-slate-100 p-1 flex-shrink-0"
                        />
                        <div>
                          <h3 className="font-bold text-slate-900 line-clamp-1">{p.name}</h3>
                          <p className="text-[11px] font-mono text-slate-400">SKU: {p.sku}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {p.isPublished ? (
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                Live
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                Draft
                              </span>
                            )}
                            {p.isFeatured && (
                              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category & Brand */}
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{p.brand?.name}</p>
                      <p className="text-slate-400 text-[11px]">{p.category?.name}</p>
                    </td>

                    {/* Selling Price */}
                    <td className="p-4">
                      <span className="font-black text-slate-900 text-sm">
                        {formatBDT(p.discountPrice || p.regularPrice)}
                      </span>
                      {p.discountPrice && (
                        <span className="block text-[10px] text-slate-400 line-through">
                          {formatBDT(p.regularPrice)}
                        </span>
                      )}
                    </td>

                    {/* Cost */}
                    <td className="p-4 font-mono text-slate-600">
                      {formatBDT(p.purchasePrice)}
                    </td>

                    {/* Stock */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black text-xs px-2 py-0.5 rounded-lg ${
                            p.stockQuantity === 0
                              ? 'bg-rose-100 text-rose-700'
                              : p.stockQuantity <= p.minStockLevel
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.stockQuantity} Units
                        </span>
                        <button
                          onClick={() => setAdjustProduct(p)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Quick Stock Adjust"
                        >
                          <Boxes className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Variants Count */}
                    <td className="p-4">
                      <span className="font-bold text-slate-700">
                        {p.variants?.length || 0} Model(s)
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDuplicate(p.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="Duplicate as Draft"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setIsProductModalOpen(true);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No products matching search filters.
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
              Page {page} of {totalPages} ({totalCount} items)
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

      {/* Modals */}
      {isProductModalOpen && (
        <ProductModal
          product={selectedProduct}
          categories={categories}
          brands={brands}
          onClose={() => setIsProductModalOpen(false)}
          onSuccess={() => {
            setIsProductModalOpen(false);
            loadProducts();
          }}
        />
      )}

      {adjustProduct && (
        <StockAdjustModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onSuccess={() => {
            setAdjustProduct(null);
            loadProducts();
          }}
        />
      )}
    </AdminLayout>
  );
}
