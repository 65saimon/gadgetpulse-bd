'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Smartphone,
  FolderTree,
  Tags,
  Boxes,
  ShoppingCart,
  Users,
  FileText,
  Truck,
  ShoppingBag,
  BarChart3,
  Activity,
  Settings,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { adminUser } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER', 'SALES_MANAGER'] },
    { name: 'Products Catalog', href: '/admin/products', icon: Smartphone, roles: ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER'] },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { name: 'Brands', href: '/admin/brands', icon: Tags, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { name: 'Inventory & Stock', href: '/admin/inventory', icon: Boxes, roles: ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER'] },
    { name: 'Orders Management', href: '/admin/orders', icon: ShoppingCart, roles: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'] },
    { name: 'Customers CRM', href: '/admin/customers', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'] },
    { name: 'Tax Invoices', href: '/admin/invoices', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'] },
    { name: 'Suppliers', href: '/admin/suppliers', icon: Truck, roles: ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER'] },
    { name: 'Purchase Orders', href: '/admin/purchases', icon: ShoppingBag, roles: ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER'] },
    { name: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3, roles: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'] },
    { name: 'Activity Audit Logs', href: '/admin/activity-logs', icon: Activity, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { name: 'Store Settings', href: '/admin/settings', icon: Settings, roles: ['SUPER_ADMIN'] },
  ];

  const userRole = adminUser?.role || 'SUPER_ADMIN';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                  Gadget<span className="text-blue-500">Pulse</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                  ERP Dashboard
                </span>
              </div>
            </Link>

            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white lg:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
            <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
              Operations & Modules
            </div>

            {navItems
              .filter((item) => item.roles.includes(userRole))
              .map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
          </nav>
        </div>

        {/* User Badge / Role Bottom Bar */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center uppercase">
              {adminUser?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{adminUser?.fullName || 'Staff User'}</p>
              <p className="text-[10px] text-blue-400 font-mono uppercase truncate">{userRole.replace(/_/g, ' ')}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
