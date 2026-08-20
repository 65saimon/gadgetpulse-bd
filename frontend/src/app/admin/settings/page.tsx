'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { apiRequest } from '../../../lib/api';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState('GadgetPulse BD');
  const [tagline, setTagline] = useState('Authorized Premium Mobile & Gadget Store');
  const [phone, setPhone] = useState('+880 1819-285538');
  const [email, setEmail] = useState('support@gadgetpulse.bd');
  const [address, setAddress] = useState('Level 4, Block C, Jamuna Future Park, Kuril, Dhaka-1229, Bangladesh');
  const [bkashMerchant, setBkashMerchant] = useState('01819-285538');
  const [nagadMerchant, setNagadMerchant] = useState('01711-987654');
  const [vatPercent, setVatPercent] = useState('5');
  const [dhakaDelivery, setDhakaDelivery] = useState('60');
  const [outsideDelivery, setOutsideDelivery] = useState('120');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadSettings = async () => {
    try {
      const res = await apiRequest('/settings');
      if (res.success && res.data) {
        const s = res.data;
        if (s.store_name) setStoreName(s.store_name);
        if (s.store_tagline) setTagline(s.store_tagline);
        if (s.store_phone) setPhone(s.store_phone);
        if (s.store_email) setEmail(s.store_email);
        if (s.store_address) setAddress(s.store_address);
        if (s.bkash_merchant_number) setBkashMerchant(s.bkash_merchant_number);
        if (s.nagad_merchant_number) setNagadMerchant(s.nagad_merchant_number);
        if (s.vat_percent) setVatPercent(s.vat_percent);
        if (s.delivery_fee_dhaka) setDhakaDelivery(s.delivery_fee_dhaka);
        if (s.delivery_fee_outside) setOutsideDelivery(s.delivery_fee_outside);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const payload = {
        settings: {
          store_name: storeName,
          store_tagline: tagline,
          store_phone: phone,
          store_email: email,
          store_address: address,
          bkash_merchant_number: bkashMerchant,
          nagad_merchant_number: nagadMerchant,
          vat_percent: vatPercent,
          delivery_fee_dhaka: dhakaDelivery,
          delivery_fee_outside: outsideDelivery,
        },
      };

      const res = await apiRequest('/settings/admin', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Store & Payment Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure company branding, bKash & Nagad merchant numbers, shipping rates, and VAT rules
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved and applied across storefront and checkout!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl text-xs">
        {/* 1. General Company Info */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-black text-slate-900">Retail Brand Profile & Legal Contact</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company / Store Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Brand Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Helpline Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Support Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Physical Flagship Store & Invoice Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* 2. Bangladeshi Payment Gateways & Wallets */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-black text-slate-900">MFS Payment Gateway Merchant Numbers</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-pink-700 mb-1">bKash Merchant / Agent Wallet</label>
              <input
                type="text"
                value={bkashMerchant}
                onChange={(e) => setBkashMerchant(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-pink-50/50 border border-pink-200 rounded-xl outline-none focus:bg-white focus:border-pink-600 font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-orange-700 mb-1">Nagad Merchant / Agent Wallet</label>
              <input
                type="text"
                value={nagadMerchant}
                onChange={(e) => setNagadMerchant(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-orange-50/50 border border-orange-200 rounded-xl outline-none focus:bg-white focus:border-orange-600 font-mono font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* 3. Shipping & Taxes */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-black text-slate-900">Tax & Shipping Rate Rules</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Standard VAT Rate (%)</label>
              <input
                type="number"
                value={vatPercent}
                onChange={(e) => setVatPercent(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Delivery Charge (Inside Dhaka - BDT)</label>
              <input
                type="number"
                value={dhakaDelivery}
                onChange={(e) => setDhakaDelivery(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Delivery Charge (Outside Dhaka - BDT)</label>
              <input
                type="number"
                value={outsideDelivery}
                onChange={(e) => setOutsideDelivery(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-bold"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
