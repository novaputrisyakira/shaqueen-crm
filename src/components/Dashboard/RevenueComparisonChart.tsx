'use client';

import React from 'react';
import { useCRM } from '@/context/CRMContext';
import { formatRupiah } from '@/lib/utils';
import { ShoppingBag, Store, TrendingUp, DollarSign } from 'lucide-react';

interface RevenueComparisonChartProps {
  filteredB2COmzet?: number;
  filteredB2BOmzet?: number;
  filteredTotalOmzet?: number;
  filteredB2CCount?: number;
  filteredB2BCount?: number;
  selectedPeriodLabel?: string;
}

export const RevenueComparisonChart: React.FC<RevenueComparisonChartProps> = ({
  filteredB2COmzet,
  filteredB2BOmzet,
  filteredTotalOmzet,
  filteredB2CCount,
  filteredB2BCount,
  selectedPeriodLabel,
}) => {
  const crm = useCRM();

  const totalB2COmzet = filteredB2COmzet !== undefined ? filteredB2COmzet : crm.totalB2COmzet;
  const totalB2BOmzet = filteredB2BOmzet !== undefined ? filteredB2BOmzet : crm.totalB2BOmzet;
  const totalOmzet = filteredTotalOmzet !== undefined ? filteredTotalOmzet : crm.totalOmzet;
  const b2cCount = filteredB2CCount !== undefined ? filteredB2CCount : crm.orders.length;
  const b2bCount = filteredB2BCount !== undefined ? filteredB2BCount : crm.settlements.length;

  const b2cShare = totalOmzet > 0 ? Math.round((totalB2COmzet / totalOmzet) * 100) : 50;
  const b2bShare = 100 - b2cShare;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-500" />
            Performa Saluran: Retail B2C vs Grosir B2B
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedPeriodLabel && selectedPeriodLabel !== 'Semua Waktu' 
              ? `Komposisi perolehan omzet dan perputaran barang (${selectedPeriodLabel})`
              : 'Komposisi perolehan omzet dan perputaran barang'}
          </p>
        </div>
        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
          Total: {formatRupiah(totalOmzet)}
        </span>
      </div>

      {/* Visual Progress Bar */}
      <div className="space-y-2 mb-6">
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${b2cShare}%` }}
            className="h-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500 relative group"
            title={`B2C Retail: ${b2cShare}%`}
          />
          <div
            style={{ width: `${b2bShare}%` }}
            className="h-full bg-gradient-to-r from-sage-400 to-sage-500 transition-all duration-500 relative group"
            title={`Grosir B2B: ${b2bShare}%`}
          />
        </div>

        <div className="flex justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-brand-600">
            <span className="w-3 h-3 rounded-full bg-brand-500 inline-block" />
            <span>Retail B2C: {b2cShare}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-sage-600">
            <span>Grosir B2B: {b2bShare}%</span>
            <span className="w-3 h-3 rounded-full bg-sage-500 inline-block" />
          </div>
        </div>
      </div>

      {/* Detailed Cards for Each Channel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* B2C Card */}
        <div className="p-4 rounded-xl bg-brand-50/50 border border-brand-100/80">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-brand-500 text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-brand-900 block">
                Penjualan Retail B2C
              </span>
              <span className="text-[11px] text-slate-500">
                Shopee, TikTok, & WhatsApp
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Total Omzet:</span>
              <span className="font-extrabold text-slate-900">
                {formatRupiah(totalB2COmzet)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Total Transaksi:</span>
              <span className="font-bold text-slate-800">{b2cCount} Pesanan</span>
            </div>
            <div className="flex justify-between text-xs pt-1 border-t border-brand-200/50">
              <span className="text-slate-500">Karakteristik:</span>
              <span className="font-medium text-emerald-700 text-[11px]">
                Margin Tinggi (Retail Price)
              </span>
            </div>
          </div>
        </div>

        {/* B2B Card */}
        <div className="p-4 rounded-xl bg-sage-50/60 border border-sage-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-sage-500 text-white">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-sage-900 block">
                Grosir Mitra Reseller B2B
              </span>
              <span className="text-[11px] text-slate-500">
                Mitra Toko & Agen Oleh-oleh
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Total Omzet Grosir:</span>
              <span className="font-extrabold text-slate-900">
                {formatRupiah(totalB2BOmzet)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Transaksi Lunas:</span>
              <span className="font-bold text-slate-800">{b2bCount} Transaksi</span>
            </div>
            <div className="flex justify-between text-xs pt-1 border-t border-sage-200/50">
              <span className="text-slate-500">Karakteristik:</span>
              <span className="font-medium text-sage-800 text-[11px]">
                Volume Besar & Cashflow Stabil
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
