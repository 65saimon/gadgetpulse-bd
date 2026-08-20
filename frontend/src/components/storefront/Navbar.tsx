'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Heart,
  Scale,
  User,
  Menu,
  X,
  ChevronDown,
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Headphones,
  Zap,
  Gamepad2,
  Speaker,
  LogOut,
  Package,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { useAuth } from '../../context/AuthContext';
import { apiRequest, formatBDT } from '../../lib/api';
import { Product } from '../../types';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { totalItems, setIsCartDrawerOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { compareCount } = useCompare();
  const { customer, customerToken, logoutCustomer } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiRequest(`/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        if (res.success) {
          setSearchResults(res.data || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navCategories = [
    { name: 'Phones', fullName: 'Smartphones', slug: 'smartphones', icon: Smartphone },
    { name: 'Tablets', fullName: 'Tablets & iPads', slug: 'tablets', icon: Tablet },
    { name: 'Watches', fullName: 'Smart Watches', slug: 'smart-watches', icon: Watch },
    { name: 'Earbuds', fullName: 'Earbuds & TWS', slug: 'earbuds', icon: Headphones },
    { name: 'Power', fullName: 'Power & Chargers', slug: 'chargers-powerbanks', icon: Zap },
    { name: 'Laptops', fullName: 'MacBooks & Laptops', slug: 'laptops', icon: Laptop },
    { name: 'Audio', fullName: 'Bluetooth Speakers', slug: 'speakers', icon: Speaker },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-all w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition flex-shrink-0">
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 flex items-center">
                  Gadget<span className="text-blue-600">Pulse</span>
                  <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-1 sm:px-1.5 py-0.5 rounded ml-1">
                    BD
                  </span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold -mt-0.5 hidden sm:block">
                  Official Retailer
                </span>
              </div>
            </Link>

            {/* Categories Dropdown Trigger (Desktop) */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition"
              >
                <Menu className="w-4 h-4 text-blue-600" />
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryOpen && (
                <div
                  onMouseLeave={() => setIsCategoryOpen(false)}
                  className="absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Product Categories
                  </div>
                  {navCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Link
                        key={cat.slug}
                        href={`/products?category=${cat.slug}`}
                        onClick={() => setIsCategoryOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition"
                      >
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                        <span>{cat.fullName}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Search Bar with live popup (Desktop) */}
          <div ref={searchRef} className="flex-1 max-w-xl relative hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search iPhone 16 Pro Max, S24 Ultra, AirPods, Anker..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full pl-11 pr-24 py-2 bg-slate-100/80 focus:bg-white text-slate-900 rounded-full border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none text-xs sm:text-sm transition placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-full shadow-sm transition"
              >
                Search
              </button>
            </form>

            {/* Live Search Results Popup */}
            {isSearchOpen && (searchQuery.trim() || isSearching) && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
                <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Search Suggestions</span>
                  {isSearching && <span className="text-blue-600 animate-pulse">Searching catalog...</span>}
                </div>

                {searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {searchResults.map((prod) => (
                      <Link
                        key={prod.id}
                        href={`/products/${prod.slug}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-3 p-3 hover:bg-blue-50/50 transition group"
                      >
                        <img
                          src={prod.mainImage}
                          alt={prod.name}
                          className="w-10 h-10 object-contain rounded-lg bg-white border border-slate-100 p-1"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 truncate">
                            {prod.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate">{prod.brand?.name} • {prod.category?.name}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-900">
                            {formatBDT(prod.discountPrice || prod.regularPrice)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : !isSearching && searchQuery.trim() ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No products found for "{searchQuery}".
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Action Icons: Compare, Wishlist, Cart, Account */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Compare Shortcut */}
            <Link
              href="/compare"
              className="relative p-2 rounded-full hover:bg-slate-100 text-slate-700 transition"
              title="Compare Devices"
            >
              <Scale className="w-5 h-5" />
              {compareCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </Link>

            {/* Wishlist Shortcut */}
            <Link
              href="/account"
              className="relative p-2 rounded-full hover:bg-slate-100 text-slate-700 transition hidden sm:block"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-2 rounded-full hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition flex items-center"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-md shadow-blue-500/30">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Customer Account Button */}
            <div className="relative">
              {customerToken && customer ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 p-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition text-slate-800 text-xs font-semibold"
                  >
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                      {customer.fullName.charAt(0)}
                    </div>
                    <span className="hidden md:inline max-w-[90px] truncate">{customer.fullName.split(' ')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                  </button>

                  {isUserMenuOpen && (
                    <div
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-xs font-bold text-slate-800 truncate">{customer.fullName}</p>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Dashboard</span>
                      </Link>
                      <button
                        onClick={() => {
                          logoutCustomer();
                          setIsUserMenuOpen(false);
                          router.push('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left border-t border-slate-100 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition"
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar + Quick Category Horizontal Scroll */}
        <div className="pb-2.5 md:hidden space-y-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search phones, AirPods, chargers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-16 py-2 bg-slate-100 text-slate-900 rounded-full border border-slate-200 text-xs focus:bg-white focus:border-blue-600 outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-blue-600 text-white text-[11px] font-bold rounded-full"
            >
              Search
            </button>
          </form>

          {/* Quick Category Scroll Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 -mx-1 px-1 scrollbar-none text-[11px]">
            {navCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 whitespace-nowrap font-medium transition flex-shrink-0"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 shadow-lg animate-in fade-in slide-in-from-top duration-200">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">All Categories</div>
          <div className="grid grid-cols-2 gap-2">
            {navCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-xs font-semibold text-slate-700 hover:text-blue-600 transition"
                >
                  <Icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="truncate">{cat.fullName}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              href="/track-order"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-semibold text-slate-600 hover:text-blue-600"
            >
              Track Order
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-bold text-blue-600 hover:text-blue-700"
            >
              Admin Portal →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
