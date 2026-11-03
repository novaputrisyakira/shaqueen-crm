'use client';

import React from 'react';
import { useCRM } from '@/context/CRMContext';
import { BrandLogo } from './BrandLogo';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Store, 
  KanbanSquare, 
  RefreshCw,
  Settings, 
  LogOut,
  TrendingUp,
  X
} from 'lucide-react';
import { ActiveNavigationTab } from '@/lib/types';
import { formatRupiah, formatMonthShort } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    dueFollowUpsCount, 
    lowStockCount, 
    selectedMonth,
    displayedTotalRevenue,
    displayedTotalGrossProfit,
    logout,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useCRM();

  const navItems: {
    id: ActiveNavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'products',
      label: 'Master Produk',
      icon: <Package className="w-5 h-5" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'customers',
      label: 'Pelanggan Retail',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'pipeline',
      label: 'Pipeline WA Retail',
      icon: <KanbanSquare className="w-5 h-5" />,
      badge: dueFollowUpsCount > 0 ? dueFollowUpsCount : undefined,
      badgeColor: 'bg-brand-500 text-white animate-pulse',
    },
    {
      id: 'pipeline_b2b',
      label: 'Pipeline Restock B2B',
      icon: <RefreshCw className="w-5 h-5" />,
    },
    {
      id: 'partners',
      label: 'Mitra Reseller B2B',
      icon: <Store className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Pengaturan',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleSelectTab = (tabId: ActiveNavigationTab) => {
    setActiveTab(tabId);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Keluar dari sesi admin Shaqueen?')) {
      logout();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#2B1E16] text-[#F4F1DE] border-r border-[#3D2C22] flex flex-col shadow-xl select-none z-50 transition-transform duration-200 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* 1. DOMINANT BRAND LOGO AREA */}
        <div className="p-5 border-b border-[#3D2C22] bg-[#241912] flex items-center justify-between">
          <BrandLogo size="md" showTagline={true} />
          {/* Close button on mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-[#C4B7AC] hover:text-white rounded-lg hover:bg-[#3D2C22]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. NAVIGATION MENU */}
        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-extrabold text-[#9E9085] uppercase tracking-wider">
            Menu Operasional
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                  isActive
                    ? 'bg-[#E85D04] text-white shadow-md shadow-[#E85D04]/30'
                    : 'text-[#C4B7AC] hover:bg-[#3D2C22] hover:text-[#F4F1DE]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-[#9E9085]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold shadow-sm ${
                      isActive ? 'bg-white text-[#E85D04]' : 'bg-[#40796C] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 3. MINI SUMMARY WIDGET */}
        <div className="px-4 py-3 m-3 bg-[#38271D] rounded-2xl border border-[#4D392B] text-[#F4F1DE] space-y-2">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[#F4F1DE]/90 mb-1">
              <span className="flex items-center gap-1.5 truncate">
                <TrendingUp className="w-3.5 h-3.5 text-[#E85D04] shrink-0" />
                <span className="truncate">
                  Total Omzet {selectedMonth === 'all' ? '(Semua Waktu)' : `(${formatMonthShort(selectedMonth)})`}
                </span>
              </span>
              <span className="w-2 h-2 rounded-full bg-[#40796C] animate-ping shrink-0" />
            </div>
            <div className="text-base font-black text-[#FAF8EE] tracking-tight">
              {formatRupiah(displayedTotalRevenue)}
            </div>
          </div>
          <div className="pt-2 border-t border-[#4D392B]/80 flex items-center justify-between">
            <span className="text-[11px] text-[#A89C92] font-medium">Laba Kotor:</span>
            <span className="text-xs font-black text-emerald-400">
              {formatRupiah(displayedTotalGrossProfit)}
            </span>
          </div>
        </div>

        {/* 4. USER PROFILE FOOTER */}
        <div className="p-3 border-t border-[#3D2C22] flex items-center justify-between bg-[#241912]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E85D04] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              SF
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-[#F4F1DE]">Admin Shaqueen</span>
              <span className="text-[10px] text-[#40796C] font-semibold">● Localhost Aktif</span>
            </div>
          </div>

          <button 
            title="Keluar dari Sesi"
            onClick={handleLogout}
            className="p-2 text-[#A89C92] hover:text-[#E85D04] hover:bg-[#3D2C22] rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
