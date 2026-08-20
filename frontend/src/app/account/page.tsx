'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Download,
  CreditCard,
  Plus,
} from 'lucide-react';
import { AnnouncementBar } from '../../components/storefront/AnnouncementBar';
import { Navbar } from '../../components/storefront/Navbar';
import { Footer } from '../../components/storefront/Footer';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { apiRequest, formatBDT, formatDate } from '../../lib/api';
import { generateInvoicePDF } from '../../lib/invoice-pdf';
import { Order } from '../../types';

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const { customer, customerToken, logoutCustomer, refreshCustomerProfile } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Form
  const [fullName, setFullName] = useState(customer?.fullName || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [division, setDivision] = useState(customer?.division || 'Dhaka');
  const [district, setDistrict] = useState(customer?.district || 'Dhaka');
  const [upazila, setUpazila] = useState(customer?.upazila || 'Gulshan');
  const [address, setAddress] = useState(customer?.address || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    if (!customerToken) {
      router.push('/login');
    }
  }, [customerToken, router]);

  useEffect(() => {
    if (customer) {
      setFullName(customer.fullName || '');
      setPhone(customer.phone || '');
      setDivision(customer.division || 'Dhaka');
      setDistrict(customer.district || 'Dhaka');
      setUpazila(customer.upazila || 'Gulshan');
      setAddress(customer.address || '');
    }
  }, [customer]);

  useEffect(() => {
    async function loadOrders() {
      if (!customerToken) return;
      setLoadingOrders(true);
      try {
        const res = await apiRequest('/orders/customer', {}, customerToken);
        if (res.success) {
          setOrders(res.data || []);
        }
      } catch (err) {
        console.error('Error fetching customer orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, [customerToken]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerToken) return;
    setSavingProfile(true);
    setProfileMsg('');
    try {
      const res = await apiRequest(
        '/auth/customer/profile',
        {
          method: 'PUT',
          body: JSON.stringify({ fullName, phone, division, district, upazila, address }),
        },
        customerToken
      );
      if (res.success) {
        setProfileMsg('Profile updated successfully!');
        await refreshCustomerProfile();
      }
    } catch (err: any) {
      setProfileMsg(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  if (!customer) return null;

  const totalSpent = orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const pendingOrders = orders.filter((o) =>
    ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED'].includes(o.orderStatus)
  ).length;

  const completedOrders = orders.filter((o) => o.orderStatus === 'DELIVERED').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header Profile Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 uppercase">
              {customer.fullName.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">{customer.fullName}</h1>
              <p className="text-xs text-slate-500">{customer.email} • {customer.phone}</p>
              <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-bold text-blue-700">
                <span>Verified Customer</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              logoutCustomer();
              router.push('/');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition flex items-center gap-1.5 self-end sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase">Total Orders</span>
            <div className="text-2xl font-black text-slate-900">{orders.length}</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-amber-600 font-bold uppercase">In Progress</span>
            <div className="text-2xl font-black text-slate-900">{pendingOrders}</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-emerald-600 font-bold uppercase">Delivered</span>
            <div className="text-2xl font-black text-slate-900">{completedOrders}</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs text-blue-600 font-bold uppercase">Total Spent</span>
            <div className="text-2xl font-black text-slate-900">{formatBDT(totalSpent)}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6 overflow-x-auto text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 transition relative flex items-center gap-2 ${
              activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`pb-3 transition relative flex items-center gap-2 ${
              activeTab === 'wishlist' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Wishlist ({wishlist.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 transition relative flex items-center gap-2 ${
              activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Addresses</span>
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {loadingOrders ? (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse">Loading orders...</div>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 text-xs">
                    <div>
                      <span className="font-mono font-bold text-blue-600 text-sm">{order.orderNumber}</span>
                      <p className="text-slate-400 mt-0.5">Placed on {formatDate(order.createdAt)}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        order.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'CANCELLED' || order.orderStatus === 'RETURNED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.orderStatus}
                      </span>

                      {order.invoice && (
                        <button
                          onClick={() => generateInvoicePDF({ ...order.invoice!, order })}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition"
                          title="Download Invoice PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Invoice PDF</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Item List */}
                  <div className="divide-y divide-slate-50">
                    {order.items?.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                        <div>
                          <h4 className="font-bold text-slate-800">{item.productName}</h4>
                          {item.variantName && item.variantName !== 'Standard' && (
                            <p className="text-blue-600 font-semibold">{item.variantName}</p>
                          )}
                          <p className="text-slate-400">Qty: {item.quantity} • Unit: {formatBDT(item.unitPrice)}</p>
                        </div>
                        <div className="font-black text-slate-900">
                          {formatBDT(item.totalPrice)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">
                      Paid via <b>{order.paymentMethod.replace(/_/g, ' ')}</b> ({order.paymentStatus})
                    </span>
                    <div className="text-sm font-black text-slate-900">
                      Total: <span className="text-blue-600">{formatBDT(order.grandTotal)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No Orders Placed Yet</h3>
                <Link href="/products" className="inline-block px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
                  Browse Products
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Wishlist */}
        {activeTab === 'wishlist' && (
          <div className="space-y-4">
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {wishlist.map((prod) => (
                  <div key={prod.id} className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col justify-between space-y-3">
                    <img src={prod.mainImage} alt={prod.name} className="h-40 object-contain mx-auto" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{prod.name}</h4>
                      <div className="text-sm font-black text-blue-600 mt-1">
                        {formatBDT(prod.discountPrice || prod.regularPrice)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(prod)}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => toggleWishlist(prod)}
                        className="p-2 border border-slate-200 text-slate-500 hover:text-rose-600 rounded-xl"
                      >
                        <Heart className="w-4 h-4 fill-current text-rose-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <Heart className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">Your Wishlist is Empty</h3>
                <Link href="/products" className="inline-block px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
                  Explore Gadgets
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl">
            <h2 className="text-base font-black text-slate-900 mb-4">Edit Profile & Address Details</h2>

            {profileMsg && (
              <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number (+880)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Division</label>
                  <input
                    type="text"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Upazila / Area</label>
                  <input
                    type="text"
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Street Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading account...</div>}>
      <AccountContent />
    </Suspense>
  );
}
