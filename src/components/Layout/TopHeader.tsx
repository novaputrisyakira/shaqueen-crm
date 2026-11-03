'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { 
  Search, 
  Plus, 
  ShoppingBag, 
  Truck, 
  Bell, 
  CheckCircle2, 
  Database,
  Calendar,
  Menu
} from 'lucide-react';
import { formatDateIndo } from '@/lib/utils';

interface TopHeaderProps {
  onOpenNewOrderModal: () => void;
  onOpenNewDropModal: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenNewOrderModal,
  onOpenNewDropModal,
}) => {
  const { 
    activeTab, 
    searchQuery, 
    setSearchQuery, 
    dueFollowUpsCount, 
    setActiveTab, 
    settings,
    supabaseStatus,
    setIsMobileMenuOpen
  } = useCRM();

  const [showNotifications, setShowNotifications] = useState(false);

  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard Operasional',
      subtitle: 'Ringkasan performa penjualan B2C, kemitraan B2B, dan kesehatan stok',
    },
    products: {
      title: 'Master Katalog Produk',
      subtitle: 'Kelola harga jual retail B2C, harga grosir B2B, dan varian cemilan',
    },
    customers: {
      title: 'Database Pelanggan Retail',
      subtitle: 'Data pembeli lintas platform (WhatsApp, Shopee, TikTok) dan riwayat order',
    },
    partners: {
      title: 'Mitra Reseller B2B',
      subtitle: 'Kelola data toko mitra reseller grosir (beli putus cash & carry) dan riwayat order',
    },
    pipeline: {
      title: 'Pipeline Follow-Up Retensi (Kanban)',
      subtitle: 'Alur pesanan otomatis dari proses packing hingga follow-up ulasan & repeat order',
    },
    pipeline_b2b: {
      title: 'Pipeline Restock B2B (Kanban Khusus Grosir)',
      subtitle: 'Monitoring siklus restock mitra grosir: Barang Baru Turun ➔ Follow-up H+7 ➔ Follow-up H+14',
    },
    settings: {
      title: 'Pengaturan Sistem & Branding',
      subtitle: 'Ubah logo brand, template pesan otomatis WhatsApp, dan sinkronisasi Supabase',
    },
  };

  const currentMeta = titles[activeTab] || titles.dashboard;
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
      {/* Mobile Menu & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            {currentMeta.title}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium line-clamp-1">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Center / Search & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Bar */}
        <div className="relative w-36 sm:w-64 md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari data..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Date Display */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/70 text-slate-600 rounded-xl text-xs font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{formatDateIndo(todayStr)}</span>
        </div>

        {/* Follow-up Alert Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-xl border border-slate-200 transition-colors relative"
            title="Pemberitahuan Follow-Up"
          >
            <Bell className="w-4 h-4" />
            {dueFollowUpsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {dueFollowUpsCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-800">
                  Follow-Up Pelanggan Menunggu
                </span>
                <span className="text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold">
                  {dueFollowUpsCount} Pesanan
                </span>
              </div>
              <div className="py-2 text-xs text-slate-600 space-y-2 max-h-60 overflow-y-auto">
                {dueFollowUpsCount > 0 ? (
                  <>
                    <p className="text-slate-500 text-[11px]">
                      Ada pesanan H+2 yang butuh diminta ulasan rasa & H+30 yang siap ditawari promo repeat order:
                    </p>
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        setActiveTab('pipeline');
                      }}
                      className="w-full text-center py-2 px-3 bg-brand-50 hover:bg-brand-100 text-brand-600 font-semibold rounded-xl text-xs transition-colors"
                    >
                      Buka Kanban Pipeline WA →
                    </button>
                  </>
                ) : (
                  <div className="py-4 text-center text-slate-400 text-xs">
                    Semua follow-up pelanggan hari ini sudah tuntas! 🎉
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Database Status indicator */}
        <div 
          onClick={() => setActiveTab('settings')}
          className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors border ${
            supabaseStatus === 'connected'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
          title="Klik untuk konfigurasi database"
        >
          <Database className="w-3.5 h-3.5 text-brand-500" />
          <span>{supabaseStatus === 'connected' ? 'Supabase Postgres' : 'Postgres Lokal'}</span>
        </div>

        {/* Quick Action Button: New Retail Order */}
        <button
          onClick={onOpenNewOrderModal}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-[#E85D04] hover:bg-[#D04B00] text-white rounded-xl text-xs font-bold shadow-md shadow-[#E85D04]/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">+ Transaksi B2C</span>
          <span className="sm:hidden">+ Order</span>
        </button>

        {/* Quick Action Button: New Wholesale B2B Order */}
        <button
          onClick={onOpenNewDropModal}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#40796C] hover:bg-[#326156] text-white rounded-xl text-xs font-bold shadow-md shadow-[#40796C]/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
        >
          <Truck className="w-3.5 h-3.5" />
          <span>+ Transaksi B2B</span>
        </button>
      </div>
    </header>
  );
};
