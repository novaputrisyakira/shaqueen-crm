'use client';

import React, { useMemo } from 'react';
import { useCRM } from '@/context/CRMContext';
import { StatCard } from './StatCard';
import { RevenueComparisonChart } from './RevenueComparisonChart';
import { SalesTrendChart } from './SalesTrendChart';
import { DueFollowupsAlert } from './DueFollowupsAlert';
import { TopPartnersTable } from './TopPartnersTable';
import { 
  DollarSign, 
  ShoppingBag, 
  Store, 
  MessageSquare, 
  AlertTriangle,
  Package,
  TrendingUp,
  Sparkles,
  Calendar,
  Filter,
  RotateCcw
} from 'lucide-react';
import { formatRupiah, formatNumber, formatMonthName, formatMonthShort, getTransactionMonth } from '@/lib/utils';
import { B2COrder } from '@/lib/types';

interface DashboardViewProps {
  onOpenWAModal: (order: B2COrder) => void;
  onOpenNewOrderModal: () => void;
  onOpenNewDropModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenWAModal,
  onOpenNewOrderModal,
  onOpenNewDropModal,
}) => {
  const { 
    dueFollowUpsCount, 
    activePartnersCount, 
    orders, 
    settlements,
    products, 
    lowStockCount,
    setActiveTab,
    selectedMonth,
    setSelectedMonth,
    filteredOrders,
    filteredSettlements,
    displayTotalOmzet,
    displayGrossProfit,
    displayB2COmzet,
    displayB2BOmzet,
    displayGrossProfitMargin
  } = useCRM();

  // Automatically detect all available months from transactions + last 6-12 months (Single-pass O(N+M))
  const monthOptions = useMemo(() => {
    const monthsSet = new Set<string>();
    const orderCountMap = new Map<string, number>();
    const stlCountMap = new Map<string, number>();

    // 1. Gather all months from orders in single pass
    for (const o of orders) {
      const m = getTransactionMonth(o);
      if (m) {
        monthsSet.add(m);
        orderCountMap.set(m, (orderCountMap.get(m) || 0) + 1);
      }
    }

    // 2. Gather all months from settlements in single pass
    for (const s of settlements) {
      const m = getTransactionMonth(s);
      if (m) {
        monthsSet.add(m);
        stlCountMap.set(m, (stlCountMap.get(m) || 0) + 1);
      }
    }

    // 3. Ensure sequence covering last 12 months up to late 2026
    const baseYear = 2026;
    const baseMonth = 11;
    for (let i = 0; i < 12; i++) {
      const d = new Date(baseYear, baseMonth - 1 - i, 1);
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      monthsSet.add(`${y}-${mo}`);
    }

    const sortedMonths = Array.from(monthsSet).sort().reverse();

    return sortedMonths.map(mKey => {
      const orderCount = orderCountMap.get(mKey) || 0;
      const stlCount = stlCountMap.get(mKey) || 0;
      return {
        key: mKey,
        label: formatMonthName(mKey),
        shortLabel: formatMonthShort(mKey),
        totalTx: orderCount + stlCount,
        orderCount,
        stlCount,
      };
    });
  }, [orders, settlements]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HIGHLIGHT BANNER */}
      <div className="bg-gradient-to-r from-[#E85D04] via-[#E85D04] to-[#40796C] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-[#E85D04]/20 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute right-40 top-0 w-24 h-24 bg-[#40796C]/30 rounded-full blur-md pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#F4F1DE]" />
              Sistem Operasional Shaqueen Food
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              Halo Admin! Operasional Siap Hari Ini.
            </h1>
            <p className="text-sm text-white/95 max-w-xl font-normal leading-relaxed">
              Pantau arus penjualan retail Cuanki & Keripik Moringa, retensi pembeli eceran & Grosir B2B, dan trigger pesan otomatis WhatsApp H+2 & H+30.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={onOpenNewOrderModal}
              className="px-5 py-2.5 rounded-xl bg-white text-[#E85D04] font-extrabold text-xs shadow-md hover:bg-[#F4F1DE] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            >
              + Transaksi B2C Baru
            </button>
            <button
              onClick={onOpenNewDropModal}
              className="px-5 py-2.5 rounded-xl bg-[#2B1E16]/80 hover:bg-[#2B1E16] text-white font-extrabold text-xs backdrop-blur-md border border-white/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            >
              Transaksi Grosir B2B
            </button>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC CALENDAR FILTER CONTROL BAR (Pojok Kanan Atas Dashboard) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:px-6 sm:py-4 rounded-3xl border border-slate-200/80 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E85D04]/10 text-[#E85D04] flex items-center justify-center shadow-xs shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Filter Kalender Dinamis
              </span>
              {selectedMonth !== 'all' ? (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#E85D04] text-white">
                  Aktif: {formatMonthName(selectedMonth)}
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Semua Waktu
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Metrik 'Total Omzet' dan 'Laba Kotor' otomatis terhitung ulang real-time sesuai transaksi bulan terpilih.
            </p>
          </div>
        </div>

        {/* Dropdown pemilih Bulan & Tahun di pojok kanan atas */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <label htmlFor="dashboard-month-filter" className="text-xs font-bold text-slate-700 whitespace-nowrap">
              Bulan & Tahun:
            </label>
          </div>

          <div className="relative">
            <select
              id="dashboard-month-filter"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3.5 py-2 pr-9 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 shadow-xs hover:border-[#E85D04] focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:bg-white transition-all cursor-pointer"
            >
              <option value="all">Semua Waktu (Akumulasi)</option>
              {monthOptions.map(opt => (
                <option key={opt.key} value={opt.key}>
                  {opt.label} ({opt.totalTx} transaksi)
                </option>
              ))}
            </select>
          </div>

          {selectedMonth !== 'all' && (
            <button
              onClick={() => setSelectedMonth('all')}
              title="Reset ke Semua Waktu"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. CORE STAT CARDS (Auto-Refresh on Month Selection) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title={selectedMonth === 'all' ? 'Total Omzet (Semua Waktu)' : `Total Omzet (${formatMonthShort(selectedMonth)})`}
          value={formatRupiah(displayTotalOmzet)}
          subtitle={selectedMonth === 'all' ? 'Gabungan Retail B2C & Grosir B2B' : `Gabungan B2C & B2B Periode Ini`}
          icon={<DollarSign className="w-5 h-5" />}
          accentColor="brand"
          trend={
            selectedMonth === 'all' 
              ? { value: '+18.4% vs periode lalu', isPositive: true }
              : { value: `${filteredOrders.length + filteredSettlements.length} Transaksi`, isPositive: true }
          }
        />

        <StatCard
          title={selectedMonth === 'all' ? 'Laba Kotor (Semua Waktu)' : `Laba Kotor (${formatMonthShort(selectedMonth)})`}
          value={formatRupiah(displayGrossProfit)}
          subtitle={selectedMonth === 'all' ? 'Akumulasi Laba (B2C + B2B)' : `${displayGrossProfitMargin}% Margin Kotor`}
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="emerald"
          trend={{ value: `${displayGrossProfitMargin}% Margin Kotor`, isPositive: true }}
        />

        <StatCard
          title="Penjualan Retail B2C"
          value={formatRupiah(displayB2COmzet)}
          subtitle={`${filteredOrders.length} Transaksi (${selectedMonth === 'all' ? 'Semua' : formatMonthShort(selectedMonth)})`}
          icon={<ShoppingBag className="w-5 h-5" />}
          accentColor="warm"
          trend={{ value: 'Margin Optimal', isPositive: true }}
        />

        <StatCard
          title="Omzet Grosir (B2B)"
          value={formatRupiah(displayB2BOmzet)}
          subtitle={`${filteredSettlements.length} Transaksi Lunas (${selectedMonth === 'all' ? 'Semua' : formatMonthShort(selectedMonth)})`}
          icon={<Store className="w-5 h-5" />}
          accentColor="sage"
          trend={{ value: 'Cash & Carry', isPositive: true }}
        />

        <StatCard
          title="Follow-Up Menunggu"
          value={`${dueFollowUpsCount} Pesanan`}
          subtitle="Review H+2 & Restock H+30"
          icon={<MessageSquare className="w-5 h-5" />}
          accentColor="purple"
          trend={{ value: 'Prioritas Hari Ini', isPositive: false }}
        />
      </div>

      {/* 4. GRAFIK TREN PENJUALAN (LINE / AREA CHART INTERAKTIF DITEMPATKAN PERSIS DI BAWAH WIDGET ANGKA) */}
      <SalesTrendChart 
        selectedMonth={selectedMonth} 
        onSelectMonth={setSelectedMonth} 
      />

      {/* 5. URGENT NOTIFICATION WIDGET: LOW STOCK ALERT (If any) */}
      {lowStockCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-950">
                Peringatan Stok Terbatas ({lowStockCount} Produk Menipis)
              </h3>
              <p className="text-xs text-amber-800">
                Ada varian Cuanki atau Keripik Moringa dengan sisa stok di bawah 25 pcs. Segera siapkan batch produksi baru.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('products')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
          >
            Lihat Stok Produk →
          </button>
        </div>
      )}

      {/* 6. PERFORMA SALURAN ROW */}
      <RevenueComparisonChart 
        filteredB2COmzet={displayB2COmzet}
        filteredB2BOmzet={displayB2BOmzet}
        filteredTotalOmzet={displayTotalOmzet}
        filteredB2CCount={filteredOrders.length}
        filteredB2BCount={filteredSettlements.length}
        selectedPeriodLabel={formatMonthName(selectedMonth)}
      />

      {/* 7. OPERATIONAL WIDGETS ROW: PIPELINE WA DUE & TOP B2B PARTNERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DueFollowupsAlert onOpenWAModal={onOpenWAModal} />
        <TopPartnersTable />
      </div>
    </div>
  );
};
