'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Bell,
  Search,
  LogOut,
  ExternalLink,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminNavbarProps {
  onToggleSidebar: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ onToggleSidebar }) => {
  const router = useRouter();
  const { adminUser, logoutAdmin } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const notifications = [
    { title: 'New order received', desc: 'ORD-20260821-0025 via bKash', time: '10m ago' },
    { title: 'Low stock warning', desc: 'Apple Watch Ultra 2 (only 2 left)', time: '1h ago' },
    { title: 'Restock PO received', desc: 'PO-2026-0001 from Smart Tech BD', time: '3h ago' },
  ];

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Retail System Online • Branch: Jamuna Future Park</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* View Customer Store Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
        >
          <span>Open Live Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2.5 rounded-full hover:bg-slate-100 text-slate-600 relative transition"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
          </button>

          {isNotifOpen && (
            <div
              onMouseLeave={() => setIsNotifOpen(false)}
              className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in"
            >
              <div className="text-xs font-black uppercase text-slate-400 mb-3">System Notifications</div>
              <div className="space-y-2.5">
                {notifications.map((n, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-0.5">
                    <p className="font-bold text-slate-900">{n.title}</p>
                    <p className="text-slate-500 text-[11px]">{n.desc}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            logoutAdmin();
            router.push('/admin/login');
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition"
          title="Sign out of ERP"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
