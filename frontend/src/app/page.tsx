'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  CreditCard,
  Headphones,
  Sparkles,
  Star,
  CheckCircle2,
  Mail,
} from 'lucide-react';
import { AnnouncementBar } from '../components/storefront/AnnouncementBar';
import { Navbar } from '../components/storefront/Navbar';
import { Footer } from '../components/storefront/Footer';
import { HeroSlider } from '../components/storefront/HeroSlider';
import { FlashDeals } from '../components/storefront/FlashDeals';
import { CategoryGrid } from '../components/storefront/CategoryGrid';
import { BrandShowcase } from '../components/storefront/BrandShowcase';
import { ProductCard } from '../components/storefront/ProductCard';
import { CartDrawer } from '../components/storefront/CartDrawer';
import { CompareDrawer } from '../components/storefront/CompareDrawer';
import { apiRequest } from '../lib/api';
import { Product, Category, Brand } from '../types';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [featRes, newRes, bestRes, catRes, brandRes] = await Promise.all([
          apiRequest('/products?isFeatured=true&limit=8'),
          apiRequest('/products?isNewArrival=true&limit=8'),
          apiRequest('/products?isBestSeller=true&limit=8'),
          apiRequest('/categories'),
          apiRequest('/brands'),
        ]);

        if (featRes.success) setFeaturedProducts(featRes.data);
        if (newRes.success) setNewArrivals(newRes.data);
        if (bestRes.success) setBestSellers(bestRes.data);
        if (catRes.success) setCategories(catRes.data);
        if (brandRes.success) setBrands(brandRes.data);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        {/* 1. Hero Banner Slider */}
        <HeroSlider />

        {/* 2. Flash Deals Section */}
        {featuredProducts.length > 0 && <FlashDeals products={featuredProducts} />}

        {/* 3. Popular Categories */}
        <CategoryGrid categories={categories} />

        {/* 4. Featured Flagship Smartphones */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Premium Flagships</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Featured Smartphones & Devices
              </h2>
            </div>
            <Link
              href="/products?category=smartphones"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
            >
              <span>View all smartphones</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>

        {/* 5. Promotional Middle Banners */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden shadow-xl">
            <div className="relative z-10 space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800/60 inline-block">
                Apple Ecosystem
              </span>
              <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                MacBook Air M3 & iPad Pro
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm">
                Supercharged for creators and professionals with official Apple international warranty.
              </p>
              <div className="pt-2">
                <Link
                  href="/products?brand=apple"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-extrabold shadow-md transition"
                >
                  <span>Explore Apple Range</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"
              alt="MacBook"
              className="absolute -right-10 -bottom-10 w-64 h-64 object-contain opacity-40 md:opacity-80"
            />
          </div>

          <div className="rounded-3xl bg-gradient-to-tr from-blue-900 to-cyan-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden shadow-xl">
            <div className="relative z-10 space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/60 inline-block">
                Audio & Power Hub
              </span>
              <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                Anker 250W GaN & Sony ANC
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm">
                Fast charging solutions and noise-canceling studio sound engineered for life on the go.
              </p>
              <div className="pt-2">
                <Link
                  href="/products?category=chargers-powerbanks"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 text-xs font-extrabold shadow-md transition"
                >
                  <span>Shop GaN Powerbanks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1609592426868-b7a42ecdc978?w=500"
              alt="Anker Power Bank"
              className="absolute -right-8 -bottom-8 w-60 h-60 object-contain opacity-40 md:opacity-80"
            />
          </div>
        </section>

        {/* 6. Best Sellers & New Arrivals Tabbed / Grid */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Top Trending</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Customer Best Sellers
              </h2>
            </div>
            <Link
              href="/products?sortBy=popularity"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
            >
              <span>View all best sellers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bestSellers.slice(0, 8).map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>

        {/* 7. Brand Showcase */}
        <BrandShowcase brands={brands} />

        {/* 8. Verified Customer Testimonials */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Customer Love</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Why Tech Enthusiasts Choose GadgetPulse BD
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex text-amber-500 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                "Bought the iPhone 16 Pro Max 512GB Desert Titanium. Delivered to my Dhanmondi office within 4 hours. Verified the IMEI on the Apple website immediately. Superb service!"
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Sadia Afreen Khan</h4>
                  <p className="text-[11px] text-slate-400">Dhanmondi, Dhaka</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified Buyer
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex text-amber-500 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                "Ordered the Sony WH-1000XM5 headphones to Chattogram. Received via courier in 48 hours in bulletproof packaging with the official printed A4 tax invoice."
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Tanvir Hossain Chowdhury</h4>
                  <p className="text-[11px] text-slate-400">Agrabad, Chattogram</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified Buyer
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex text-amber-500 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                "bKash payment was instantaneous with instant TrxID confirmation and SMS tracking. The Anker Prime 250W powerbank charges my M3 MacBook like lightning."
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Rafid Al-Mahmud</h4>
                  <p className="text-[11px] text-slate-400">Gulshan-2, Dhaka</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified Buyer
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Newsletter Section */}
        <section className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-xl mx-auto space-y-4 relative z-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400 bg-blue-950 px-3 py-1 rounded-full border border-blue-800 inline-block">
              VIP Tech Club
            </span>
            <h2 className="text-3xl font-black tracking-tight">
              Get ৳1,000 Off Your First Flagship Order
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Subscribe to receive instant price drop alerts, upcoming smartphone launches in Bangladesh, and exclusive discount promo codes.
            </p>

            {newsletterSubscribed ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Thank you! Use promo code "GADGET10" at checkout for 10% off.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-xl text-xs sm:text-sm border border-slate-700 outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-lg shadow-blue-500/25 transition"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer />
      <CompareDrawer />
    </div>
  );
}
