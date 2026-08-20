'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Filter,
  SlidersHorizontal,
  Grid,
  List,
  Search,
  Star,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AnnouncementBar } from '../../components/storefront/AnnouncementBar';
import { Navbar } from '../../components/storefront/Navbar';
import { Footer } from '../../components/storefront/Footer';
import { ProductCard } from '../../components/storefront/ProductCard';
import { CartDrawer } from '../../components/storefront/CartDrawer';
import { CompareDrawer } from '../../components/storefront/CompareDrawer';
import { apiRequest, formatBDT } from '../../lib/api';
import { Product, Category, Brand } from '../../types';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || 'all');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Load initial filter meta (categories, brands)
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, brandRes] = await Promise.all([
          apiRequest('/categories'),
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

  // Fetch products whenever filter parameters change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
        if (selectedBrand && selectedBrand !== 'all') params.set('brand', selectedBrand);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (inStockOnly) params.set('inStock', 'true');
        if (minRating) params.set('minRating', minRating);
        params.set('sortBy', sortBy);
        params.set('page', String(page));
        params.set('limit', '12');

        const res = await apiRequest(`/products?${params.toString()}`);
        if (res.success) {
          setProducts(res.data || []);
          setTotalPages(res.pagination?.totalPages || 1);
          setTotalCount(res.pagination?.total || 0);
        }
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [search, selectedCategory, selectedBrand, minPrice, maxPrice, inStockOnly, minRating, sortBy, page]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setMinRating('');
    setSortBy('newest');
    setPage(1);
    router.push('/products');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <div className="text-xs text-slate-400 mb-2">
            <span>Home</span> / <span className="text-slate-900 font-semibold">Products Catalog</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                All Mobile Phones & Gadgets
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Showing {totalCount} authentic devices with official Bangladesh warranty
              </p>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md"
            >
              <Filter className="w-4 h-4" />
              <span>Filter Products</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Filters Sidebar */}
          <aside className={`lg:block bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-black text-sm text-slate-900">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>Filter Options</span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Search filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Keyword Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. iPhone, 256GB, Anker..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Category
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => { setSelectedCategory('all'); setPage(1); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex justify-between transition ${
                    selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex justify-between transition ${
                      selectedCategory === cat.slug ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-70">({cat._count?.products || 0})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Brand
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => { setSelectedBrand('all'); setPage(1); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex justify-between transition ${
                    selectedBrand === 'all' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>All Brands</span>
                </button>
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => { setSelectedBrand(b.slug); setPage(1); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex justify-between transition ${
                      selectedBrand === b.slug ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{b.name}</span>
                    <span className="text-[10px] opacity-70">({b._count?.products || 0})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Price Range (BDT)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Availability */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Minimum Rating
              </label>
              <div className="flex gap-2">
                {['', '4.5', '4.0', '3.0'].map((r) => (
                  <button
                    key={r}
                    onClick={() => { setMinRating(r); setPage(1); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                      minRating === r
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {r === '' ? 'All' : `${r}★+`}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Listing Main Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Sort & View Controls */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-semibold text-slate-600">
                Showing <span className="text-slate-900 font-bold">{products.length}</span> of {totalCount} devices
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {/* Sort By Dropdown */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-bold">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-600"
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="popularity">Popularity & Reviews</option>
                    <option value="discount">Highest Discount</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid / List */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6' : 'space-y-4'}>
                {products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No matching products found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search criteria, price range filters, or clearing selected categories.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {[...Array(totalPages)].map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                        page === pNum
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
      <CompareDrawer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
