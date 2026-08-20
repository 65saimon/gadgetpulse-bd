import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { CompareProvider } from '../context/CompareContext';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'GadgetPulse Bangladesh | Premier Flagship Smartphones & Genuine Gadgets',
  description: 'Shop official Apple iPhones, Samsung Galaxy, Google Pixel, Xiaomi smartphones, Apple Watch, AirPods, powerbanks, chargers & smart lifestyle gadgets in Bangladesh with official warranty.',
  keywords: 'smartphones bangladesh, iphone 16 pro max price in bd, samsung s24 ultra bd, official gadget store dhaka, bKash payment gadget store, authentic mobile shop',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased overflow-x-hidden w-full max-w-[100vw]`}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CompareProvider>
                {children}
              </CompareProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
