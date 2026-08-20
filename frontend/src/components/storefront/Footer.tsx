'use client';

import React from 'react';
import Link from 'next/link';
import { Smartphone, MapPin, Phone, Mail, ShieldCheck, RefreshCw, Truck, CreditCard, Facebook, Youtube, Instagram } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Official Warranty</h4>
              <p className="text-xs text-slate-400">100% Genuine brand warranty</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-500 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Superfast Delivery</h4>
              <p className="text-xs text-slate-400">Inside Dhaka in 24 hours</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-amber-600/10 text-amber-500 flex items-center justify-center">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">7-Day Replacement</h4>
              <p className="text-xs text-slate-400">For hardware defects</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">bKash & Nagad MFS</h4>
              <p className="text-xs text-slate-400">Instant cashless payments</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-md">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Gadget<span className="text-blue-500">Pulse</span> BD
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Bangladesh’s premier destination for genuine flagship smartphones, Apple MacBooks, iPads, smartwatches, audio gadgets, and charging accessories with authentic warranty support.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center transition">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 tracking-wider uppercase">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/products?category=smartphones" className="hover:text-blue-400 transition">Smartphones</Link></li>
              <li><Link href="/products?category=tablets" className="hover:text-blue-400 transition">Tablets & iPads</Link></li>
              <li><Link href="/products?category=smart-watches" className="hover:text-blue-400 transition">Smart Watches</Link></li>
              <li><Link href="/products?category=earbuds" className="hover:text-blue-400 transition">AirPods & TWS</Link></li>
              <li><Link href="/products?category=chargers-powerbanks" className="hover:text-blue-400 transition">Power Banks & GaN</Link></li>
              <li><Link href="/products?category=laptops" className="hover:text-blue-400 transition">Apple MacBooks</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 tracking-wider uppercase">Help & Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/track-order" className="hover:text-blue-400 transition">Track Your Order</Link></li>
              <li><Link href="/account" className="hover:text-blue-400 transition">Customer Account</Link></li>
              <li><Link href="/compare" className="hover:text-blue-400 transition">Product Comparison</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">Warranty Policy</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition">Terms & Conditions</Link></li>
              <li><Link href="/admin/login" className="text-blue-400 font-semibold hover:text-blue-300 transition">Admin / Staff Portal</Link></li>
            </ul>
          </div>

          {/* Store Outlets */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 tracking-wider uppercase">Store Outlets</h4>
            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <p className="font-bold text-slate-200">Jamuna Future Park (Main)</p>
                <p className="text-slate-400">Level 4, Block D, Kuril, Dhaka</p>
              </div>
              <div>
                <p className="font-bold text-slate-200">Bashundhara City</p>
                <p className="text-slate-400">Level 5, Block B, Panthapath, Dhaka</p>
              </div>
              <div className="pt-2">
                <p className="flex items-center gap-1.5 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-blue-500" />
                  <span>+880 1819-285538</span>
                </p>
                <p className="flex items-center gap-1.5 text-slate-300 mt-1">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  <span>support@gadgetpulse.bd</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & accepted payment partners */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 GadgetPulse Bangladesh Ltd. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="text-slate-500">Accepted Payments:</span>
            <span className="font-bold text-pink-500 bg-slate-900 px-2 py-1 rounded">bKash</span>
            <span className="font-bold text-orange-500 bg-slate-900 px-2 py-1 rounded">Nagad</span>
            <span className="font-bold text-emerald-400 bg-slate-900 px-2 py-1 rounded">COD</span>
            <span className="font-bold text-blue-400 bg-slate-900 px-2 py-1 rounded">Visa/Mastercard</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
