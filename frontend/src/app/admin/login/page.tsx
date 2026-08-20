'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Smartphone, Lock, Mail, ShieldAlert, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { apiRequest } from '../../../lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiRequest('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.success && res.token && res.user) {
        loginAdmin(res.token, res.user);
        router.push('/admin');
      } else {
        setError(res.message || 'Invalid administrator credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate admin session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-300 p-4 sm:p-8">
      {/* Top Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
            <Smartphone className="w-4 h-4" />
          </div>
          <span className="font-black text-white text-lg tracking-tight">
            Gadget<span className="text-blue-500">Pulse</span> BD
          </span>
        </Link>
        <Link href="/" className="text-xs font-bold text-slate-400 hover:text-white transition">
          ← Back to Customer Website
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-8 bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/50 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-500 flex items-center justify-center mx-auto border border-blue-500/20">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Management ERP Portal</h1>
          <p className="text-xs text-slate-400">Secure staff sign in for inventory, orders & sales analytics</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Username / Admin Email</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="admin@gadgetpulse.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-sm font-medium"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 text-sm font-medium"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Authenticating Admin Session...' : 'Sign In to ERP Dashboard'}
          </button>
        </form>
      </div>

      <div className="text-center text-xs text-slate-600">
        © 2026 GadgetPulse Bangladesh Ltd. Proprietary ERP & Inventory Management.
      </div>
    </div>
  );
}
