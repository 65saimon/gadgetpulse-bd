'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tags, X } from 'lucide-react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { apiRequest } from '../../../lib/api';
import { Brand } from '../../../types';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/brands');
      if (res.success) setBrands(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const openCreateModal = () => {
    setEditingBrand(null);
    setName('');
    setSlug('');
    setLogoUrl('');
    setDescription('');
    setIsFeatured(true);
    setIsModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setName(brand.name);
    setSlug(brand.slug);
    setLogoUrl(brand.logoUrl || '');
    setDescription(brand.description || '');
    setIsFeatured(brand.isFeatured);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name,
        slug,
        logoUrl: logoUrl || undefined,
        description,
        isFeatured,
      };

      const res = editingBrand
        ? await apiRequest(`/brands/admin/${editingBrand.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          })
        : await apiRequest('/brands/admin', {
            method: 'POST',
            body: JSON.stringify(payload),
          });

      if (res.success) {
        setIsModalOpen(false);
        loadBrands();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save brand.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, brandName: string) => {
    if (!confirm(`Delete brand "${brandName}"?`)) return;
    try {
      const res = await apiRequest(`/brands/admin/${id}`, { method: 'DELETE' });
      if (res.success) loadBrands();
    } catch (err: any) {
      alert(err.message || 'Failed to delete brand.');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Official Brand Partners
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage phone and accessory manufacturer brands (Apple, Samsung, Google, Xiaomi, Anker...)
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Brand</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Brand</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Devices Listed</th>
                <th className="p-4">Featured</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt={brand.name} className="w-8 h-8 object-contain rounded-lg p-1 bg-slate-50" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs">
                          {brand.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-bold text-slate-900">{brand.name}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-slate-600">{brand.slug}</td>
                  <td className="p-4 font-bold text-slate-700">{brand._count?.products || 0} Models</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      brand.isFeatured ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {brand.isFeatured ? 'Featured Brand' : 'Standard'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(brand)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id, brand.name)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingBrand ? 'Edit Brand' : 'Create Brand Partner'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand Logo URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Origin</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Feature in Homepage Brand Carousel</span>
              </label>

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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
