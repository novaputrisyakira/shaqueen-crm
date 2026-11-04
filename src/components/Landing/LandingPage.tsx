'use client';

import React, { useMemo } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  ShoppingBag, 
  Store, 
  MessageSquare, 
  Package, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  Flame, 
  HeartHandshake,
  Clock,
  Layers
} from 'lucide-react';

import { useCRM } from '@/context/CRMContext';
import { formatRupiah } from '@/lib/utils';
import defaultProductsData from '@/data/products.json';
import { Product } from '@/lib/types';

interface LandingPageProps {
  onOpenLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLogin }) => {
  const { products } = useCRM();
  const displayProducts: Product[] = useMemo(() => {
    return (products && products.length > 0)
      ? products
      : (defaultProductsData as Product[]);
  }, [products]);

  return (
    <div className="min-h-screen bg-[#F4F1DE] text-[#2B1E16] font-sans selection:bg-[#E85D04] selection:text-white relative overflow-hidden">
      {/* ----------------- BACKGROUND ORNAMENTS (Aesthetic Food Patterns) ----------------- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60 z-0">
        {/* Soft warmth gradient orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#E85D04]/10 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-[#40796C]/12 blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-72 h-72 rounded-full bg-[#E85D04]/8 blur-2xl" />

        {/* Minimalist SVG snack ornaments: Steaming curves, leaves, spices */}
        <svg className="absolute top-20 right-12 w-64 h-64 text-[#40796C]/10" viewBox="0 0 200 200" fill="currentColor">
          <path d="M100 20 C120 40, 140 60, 100 100 C60 140, 80 160, 100 180 C90 150, 70 130, 90 90 C110 50, 90 30, 100 20 Z" />
        </svg>
        <svg className="absolute top-96 left-8 w-48 h-48 text-[#E85D04]/10" viewBox="0 0 200 200" fill="currentColor">
          <circle cx="50" cy="50" r="30" />
          <circle cx="150" cy="70" r="20" />
          <circle cx="110" cy="140" r="25" />
        </svg>
      </div>

      {/* ----------------- TOP NAVBAR ----------------- */}
      <header className="relative z-20 border-b border-[#2B1E16]/10 bg-[#F4F1DE]/85 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 border border-white/20 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
              <img 
                src="/shaqueen-logo.png" 
                alt="Shaqueen Food" 
                width={48}
                height={48}
                loading="eager"
                decoding="async"
                className="w-full h-full object-contain" 
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/E85D04/FFFFFF?text=SF'; }} 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-[#2B1E16]">SHAQUEEN</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#40796C]/15 text-[#40796C] border border-[#40796C]/20">
                  FOOD
                </span>
              </div>
              <p className="text-[11px] text-[#2B1E16]/65 font-medium -mt-0.5">
                Pusat Kendali Operasional
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#2B1E16]/80">
            <a href="#fitur" className="hover:text-[#E85D04] transition-colors">Fitur Unggulan</a>
            <a href="#produk" className="hover:text-[#E85D04] transition-colors">Katalog Cemilan</a>
            <a href="#reseller-b2b" className="hover:text-[#E85D04] transition-colors">Grosir B2B</a>
            <a href="#retensi" className="hover:text-[#E85D04] transition-colors">Retensi WA</a>
          </nav>

          {/* Header CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E85D04] hover:bg-[#D04B00] text-white text-xs font-bold shadow-md shadow-[#E85D04]/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Masuk ke Sistem</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ----------------- HERO SECTION ----------------- */}
      <section className="relative z-10 pt-12 pb-20 lg:pt-16 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Hero Text & Main CTA */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#40796C]/12 border border-[#40796C]/25 text-[#40796C] text-xs font-bold tracking-wide shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#E85D04]" />
                <span>Sistem Operasional Terpadu & Retensi Pelanggan</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#2B1E16] tracking-tight leading-[1.15]">
                Pusat Kendali Operasional <span className="text-[#E85D04]">Shaqueen Food</span>
              </h1>

              {/* Classy Description */}
              <p className="text-base sm:text-lg text-[#2B1E16]/80 font-normal leading-relaxed max-w-2xl">
                Satu sistem terintegrasi untuk mengendalikan retensi pelanggan retail (B2C lintas WhatsApp, Shopee, & TikTok), distribusi penjualan grosir mitra reseller (B2B beli putus cash & carry), dan katalog master produk cemilan dengan kalkulasi margin otomatis.
              </p>

              {/* Large Vibrant Orange CTA Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={onOpenLogin}
                  className="px-8 py-4 rounded-2xl bg-[#E85D04] hover:bg-[#D04B00] text-white text-base font-extrabold shadow-xl shadow-[#E85D04]/35 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#E85D04]/40 active:translate-y-0 active:scale-[0.99] flex items-center justify-center gap-3 group"
                >
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>

                <a
                  href="#fitur"
                  className="px-6 py-4 rounded-2xl bg-white/80 hover:bg-white text-[#2B1E16] border border-[#2B1E16]/15 text-sm font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 text-center"
                >
                  Pelajari Fitur Operasional
                </a>
              </div>

              {/* Trust & Metric Highlights */}
              <div className="pt-6 border-t border-[#2B1E16]/10 grid grid-cols-3 gap-4 max-w-lg text-xs">
                <div className="space-y-1">
                  <div className="font-black text-lg text-[#E85D04]">H+2 & H+30</div>
                  <div className="text-[11px] text-[#2B1E16]/70 leading-tight">Follow-Up Ulasan & Repeat Order</div>
                </div>
                <div className="space-y-1">
                  <div className="font-black text-lg text-[#40796C]">Dual-Tier</div>
                  <div className="text-[11px] text-[#2B1E16]/70 leading-tight">Harga B2C Retail & B2B Mitra</div>
                </div>
                <div className="space-y-1">
                  <div className="font-black text-lg text-[#2B1E16]">100% Siap</div>
                  <div className="text-[11px] text-[#2B1E16]/70 leading-tight">Katalog Foto & Rekonsiliasi</div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Showcase Card */}
            <div className="lg:col-span-5 relative">
              {/* Decorative Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#E85D04]/20 to-[#40796C]/20 rounded-3xl blur-2xl transform -rotate-1" />

              {/* Main Visual Showcase Box */}
              <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-[#2B1E16]/10 space-y-5">
                
                {/* Header Showcase */}
                <div className="flex items-center justify-between pb-3 border-b border-[#2B1E16]/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#E85D04]" />
                    <span className="w-3 h-3 rounded-full bg-[#40796C]" />
                    <span className="w-3 h-3 rounded-full bg-[#2B1E16]" />
                    <span className="text-xs font-bold text-[#2B1E16]/70 ml-2">Produk Inti Shaqueen</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#40796C]/10 text-[#40796C]">
                    Katalog Aktif
                  </span>
                </div>

                {/* Appetizing Product Cards Preview */}
                <div className="space-y-3">
                  {displayProducts.slice(0, 3).map((p) => {
                    const pImg = p.imageUrl || p.image_url || 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60';
                    const pTag = p.name.toLowerCase().includes('super pedas')
                      ? '🔥 Best Seller'
                      : p.name.toLowerCase().includes('pedas')
                      ? '🌶️ Terlaris'
                      : p.category === 'Paket Bundle'
                      ? '🎁 Hemat'
                      : '🍲 Otentik';

                    return (
                      <div 
                        key={p.id}
                        className="p-3 rounded-2xl bg-[#F4F1DE]/50 hover:bg-[#F4F1DE] border border-[#2B1E16]/10 flex items-center gap-3.5 transition-all duration-200"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-[#2B1E16]/10 shrink-0 shadow-2xs">
                          <img 
                            src={pImg} 
                            alt={p.name}
                            width={56}
                            height={56}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover" 
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/E85D04/FFFFFF?text=SQ'; }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-xs text-[#2B1E16] truncate">{p.name}</h4>
                            <span className="text-[10px] text-[#E85D04] font-bold shrink-0">{pTag}</span>
                          </div>
                          <p className="text-[10px] text-[#2B1E16]/65 line-clamp-1 mt-0.5">{p.description || 'Camilan khas Priangan Bandung gurih renyah.'}</p>
                          <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                            <span className="font-black text-[#E85D04]">{formatRupiah(p.b2cPrice)}</span>
                            <span className="text-[#2B1E16]/30">•</span>
                            <span className="font-bold text-[#40796C]">B2B: {formatRupiah(p.b2bPrice)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Floating Metric Pill */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#40796C] to-[#2B1E16] text-white flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Auto-WA Siap Digunakan</div>
                      <div className="text-[10px] text-white/80">Kirim ulasan & promo sekali klik</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-[#E85D04] px-2.5 py-1 rounded-lg">wa.me</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ----------------- THREE PILLARS FEATURE SECTION ----------------- */}
      <section id="fitur" className="relative z-10 py-16 bg-white/70 border-y border-[#2B1E16]/10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#E85D04]/10 text-[#E85D04] tracking-wider uppercase">
              Arsitektur Operasional
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#2B1E16] tracking-tight">
              Tiga Pilar Kendali Shaqueen Food
            </h2>
            <p className="text-xs sm:text-sm text-[#2B1E16]/75">
              Didesain khusus untuk efisiensi UMKM kuliner camilan khas Bandung dalam menaikkan retensi pembeli eceran dan mengelola penjualan grosir mitra reseller.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1: Retensi Pelanggan */}
            <div id="retensi" className="bg-white rounded-3xl p-6 border border-[#2B1E16]/10 shadow-[0_4px_20px_-2px_rgba(43,30,22,0.05)] hover:shadow-xl transition-all duration-200 hover:-translate-y-1 space-y-4 scroll-mt-24">
              <div className="w-12 h-12 rounded-2xl bg-[#40796C]/15 text-[#40796C] flex items-center justify-center font-bold">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-[#2B1E16]">
                Retensi Pelanggan & Smart Auto-WA
              </h3>
              <p className="text-xs text-[#2B1E16]/75 leading-relaxed">
                Jadwalkan follow-up otomatis H+2 untuk menanyakan kepuasan rasa cuanki dan H+30 untuk restock penawaran promo loyalitas pelanggan lewat tautan wa.me langsung.
              </p>
              <ul className="text-[11px] space-y-2 text-[#2B1E16]/80 pt-2 border-t border-[#2B1E16]/10">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#40796C]" />
                  <span>Segmentasi Pelanggan Baru vs Loyal</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#40796C]" />
                  <span>Pipeline Kanban status pesanan interaktif</span>
                </li>
              </ul>
            </div>

            {/* Feature 2: Mitra Reseller B2B */}
            <div id="reseller-b2b" className="bg-white rounded-3xl p-6 border border-[#2B1E16]/10 shadow-[0_4px_20px_-2px_rgba(43,30,22,0.05)] hover:shadow-xl transition-all duration-200 hover:-translate-y-1 space-y-4 scroll-mt-24">
              <div className="w-12 h-12 rounded-2xl bg-[#E85D04]/15 text-[#E85D04] flex items-center justify-center font-bold">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-[#2B1E16]">
                Mitra Reseller & Grosir B2B
              </h3>
              <p className="text-xs text-[#2B1E16]/75 leading-relaxed">
                Kelola pesanan grosir beli putus cash &amp; carry, konversi karton/dus ke pcs, potong stok fisik gudang otomatis, dan rekap omzet transaksi lunas seketika.
              </p>
              <ul className="text-[11px] space-y-2 text-[#2B1E16]/80 pt-2 border-t border-[#2B1E16]/10">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E85D04]" />
                  <span>Pencatatan pesanan grosir per mitra toko</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E85D04]" />
                  <span>Konversi karton ke pcs & potong stok otomatis</span>
                </li>
              </ul>
            </div>

            {/* Feature 3: Master Produk */}
            <div className="bg-white rounded-3xl p-6 border border-[#2B1E16]/10 shadow-[0_4px_20px_-2px_rgba(43,30,22,0.05)] hover:shadow-xl transition-all duration-200 hover:-translate-y-1 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2B1E16]/10 text-[#2B1E16] flex items-center justify-center font-bold">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-[#2B1E16]">
                Master Produk & Dual-Tier Margin
              </h3>
              <p className="text-xs text-[#2B1E16]/75 leading-relaxed">
                Katalog master produk lengkap dengan foto cemilan menggugah selera (drag & drop upload), monitoring stok fisik, dan perhitungan margin laba retail vs grosir B2B.
              </p>
              <ul className="text-[11px] space-y-2 text-[#2B1E16]/80 pt-2 border-t border-[#2B1E16]/10">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2B1E16]" />
                  <span>Thumbnail foto cemilan di tabel & modal</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2B1E16]" />
                  <span>Peringatan otomatis saat stok menipis</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ----------------- PRODUCT SPOTLIGHT / KATALOG SECTION ----------------- */}
      <section id="produk" className="relative z-10 py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#40796C]/10 text-[#40796C] tracking-wider uppercase">
                Katalog Cemilan
              </span>
              <h2 className="text-3xl font-black text-[#2B1E16] tracking-tight mt-2">
                Varian Rasa Unggulan Shaqueen
              </h2>
            </div>
            <button
              onClick={onOpenLogin}
              className="text-xs font-bold text-[#E85D04] hover:text-[#D04B00] flex items-center gap-1.5 transition-colors"
            >
              <span>Masuk untuk kelola katalog lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.map((p) => {
              const pImg = p.imageUrl || p.image_url || 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60';
              const pTag = p.name.toLowerCase().includes('super pedas')
                ? '🔥 Best Seller'
                : p.name.toLowerCase().includes('pedas')
                ? '🌶️ Terlaris'
                : p.category === 'Paket Bundle'
                ? '🎁 Paket Hemat'
                : p.category === 'Pilus'
                ? '⭐ Favorit'
                : '🍲 Rasa Otentik';

              return (
                <div 
                  key={p.id} 
                  className="bg-white rounded-3xl p-5 border border-[#2B1E16]/10 shadow-[0_4px_20px_-2px_rgba(43,30,22,0.06)] hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4 hover:-translate-y-1"
                >
                  <div className="w-full h-44 rounded-2xl overflow-hidden bg-slate-100 border border-[#2B1E16]/10 relative">
                    <img
                      src={pImg}
                      alt={p.name}
                      width={380}
                      height={176}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x200/E85D04/FFFFFF?text=Shaqueen'; }}
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[10px] font-extrabold text-[#2B1E16] shadow-xs">
                      {p.category}
                    </span>
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#E85D04] text-white text-[10px] font-extrabold shadow-xs">
                      {pTag}
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <h4 className="font-extrabold text-sm text-[#2B1E16] leading-snug">{p.name}</h4>
                    <p className="text-xs text-[#2B1E16]/70 line-clamp-2">
                      {p.description || 'Camilan khas Priangan Bandung gurih renyah dengan bumbu rempah asli Shaqueen Food.'}
                    </p>
                    <div className="pt-1 flex items-center gap-2 text-[11px] text-[#2B1E16]/60">
                      <span className="px-2 py-0.5 rounded-md bg-[#40796C]/10 text-[#40796C] font-bold text-[10px]">
                        Stok: {p.stock} pcs
                      </span>
                      {p.b2bUnit && (
                        <span className="text-[10px] font-medium text-slate-500">
                          1 {p.b2bUnit} = {p.b2bConversion || 12} pcs
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#2B1E16]/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-[#2B1E16]/50 block font-medium">Retail (B2C)</span>
                      <span className="font-black text-[#E85D04] text-sm">{formatRupiah(p.b2cPrice)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#2B1E16]/50 block font-medium">Grosir (B2B)</span>
                      <span className="font-extrabold text-[#40796C] text-sm">{formatRupiah(p.b2bPrice)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ----------------- BOTTOM CTA BANNER ----------------- */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#2B1E16] text-[#F4F1DE] p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Background design elements */}
            <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-[#E85D04]/15 blur-3xl pointer-events-none" />
            <div className="absolute left-1/4 bottom-0 w-64 h-64 rounded-full bg-[#40796C]/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-3 max-w-xl text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#40796C]" />
                <span>Akses Internal Terproteksi</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Mulai Operasional Shaqueen Food Hari Ini
              </h2>
              <p className="text-xs sm:text-sm text-[#F4F1DE]/80 leading-relaxed">
                Masuk ke sistem untuk mulai mengelola katalog cemilan, menginput transaksi retail, dan mengontrol penjualan grosir mitra reseller secara menyeluruh.
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <button
                onClick={onOpenLogin}
                className="px-8 py-4 rounded-2xl bg-[#E85D04] hover:bg-[#D04B00] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-[#E85D04]/40 transition-all duration-200 hover:-translate-y-1 active:translate-y-0 flex items-center gap-2.5"
              >
                <span>Masuk ke Sistem</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ----------------- FOOTER ----------------- */}
      <footer className="relative z-10 border-t border-[#2B1E16]/10 py-8 bg-[#F4F1DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#2B1E16]/65">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#2B1E16]">SHAQUEEN FOOD</span>
            <span>•</span>
            <span>Pusat Kendali Operasional & Retensi UMKM Kuliner Bandung</span>
          </div>
          <div>
            <span>© 2026 Shaqueen Food. Hak Cipta Dilindungi.</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
