'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';

const slides = [
  {
    badge: 'NEW FLAGSHIP RELEASE',
    title: 'Apple iPhone 16 Pro Max',
    subtitle: 'Titanium. A18 Pro. Apple Intelligence.',
    desc: 'Grade 5 Titanium design with thinner borders, 48MP Fusion camera system with Camera Control button, and unmatched battery longevity.',
    price: '৳189,999',
    oldPrice: '৳199,999',
    link: '/products/apple-iphone-16-pro-max',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900',
    bgGradient: 'from-slate-950 via-slate-900 to-indigo-950',
    accentColor: 'text-blue-400',
  },
  {
    badge: 'GALAXY AI IS HERE',
    title: 'Samsung Galaxy S24 Ultra',
    subtitle: '200MP Camera • Titanium Frame • S-Pen',
    desc: 'Unleash next-generation productivity with Live Translate, Circle to Search with Google, and Snapdragon 8 Gen 3 for Galaxy.',
    price: '৳172,999',
    oldPrice: '৳185,000',
    link: '/products/samsung-galaxy-s24-ultra-5g',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=900',
    bgGradient: 'from-slate-950 via-slate-900 to-slate-900',
    accentColor: 'text-amber-400',
  },
  {
    badge: 'PRO AUDIO PERFORMANCE',
    title: 'Sony WH-1000XM5 & AirPods Pro',
    subtitle: 'Industry Leading Noise Cancellation',
    desc: 'Immerse in studio-grade acoustics, ultra-clear microphone beamforming, and 30-hour battery life.',
    price: '৳28,500',
    oldPrice: '৳32,000',
    link: '/products/apple-airpods-pro-2-usb-c',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900',
    bgGradient: 'from-slate-950 via-indigo-950 to-slate-900',
    accentColor: 'text-emerald-400',
  },
];

export const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl border border-slate-800">
      <div className={`transition-all duration-700 bg-gradient-to-r ${slide.bgGradient} p-8 sm:p-12 lg:p-16 min-h-[460px] flex items-center`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-5 animate-in fade-in slide-in-from-left duration-500">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider text-blue-400 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{slide.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
              {slide.title}
            </h1>

            <p className="text-lg sm:text-xl font-bold text-slate-300">
              {slide.subtitle}
            </p>

            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              {slide.desc}
            </p>

            {/* Price & CTA */}
            <div className="pt-2 flex flex-wrap items-center gap-6">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-slate-400 font-medium">Special Offer:</span>
                <span className="text-2xl sm:text-3xl font-black text-white">{slide.price}</span>
                <span className="text-sm text-slate-500 line-through">{slide.oldPrice}</span>
              </div>

              <Link
                href={slide.link}
                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-extrabold flex items-center gap-2 shadow-xl shadow-blue-500/30 transition hover:scale-105 active:scale-95"
              >
                <span>Buy Now with Warranty</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Product Spotlight Image */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
              {/* Glow background orb */}
              <div className="absolute inset-0 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse-subtle" />
              <img
                src={slide.image}
                alt={slide.title}
                className="relative z-10 w-full h-full object-contain filter drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation Indicators */}
      <div className="absolute bottom-6 left-8 sm:left-12 flex items-center gap-2 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all ${
              current === idx ? 'w-8 bg-blue-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
