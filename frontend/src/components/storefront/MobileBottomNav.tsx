'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Search, ShoppingBag, User, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { totalItems, setIsCartDrawerOpen } = useCart();
  const { customer, customerToken } = useAuth();

  // Hide on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { label: 'Home', href: '/', icon: Home, active: pathname === '/' },
    { label: 'Shop', href: '/products', icon: LayoutGrid, active: pathname?.startsWith('/products') },
    { label: 'Track', href: '/track-order', icon: ShieldCheck, active: pathname === '/track-order' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-2xl py-2 px-3 lg:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                item.active
                  ? 'text-blue-600 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${item.active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}

        {/* Cart Drawer Trigger */}
        <button
          onClick={() => setIsCartDrawerOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 hover:text-blue-600 transition"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white rounded-full text-[9px] font-black w-4 h-4 flex items-center justify-center shadow-md">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-medium">Cart</span>
        </button>

        {/* Account Link */}
        <Link
          href={customerToken ? '/account' : '/login'}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            pathname?.startsWith('/account') || pathname === '/login'
              ? 'text-blue-600 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <User className={`w-5 h-5 ${pathname?.startsWith('/account') ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 truncate max-w-[48px]">
            {customerToken ? 'Profile' : 'Login'}
          </span>
        </Link>
      </div>
    </div>
  );
};
