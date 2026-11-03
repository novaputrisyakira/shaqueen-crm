'use client';

import React from 'react';
import { useCRM } from '@/context/CRMContext';
import { formatRupiah } from '@/lib/utils';
import { Store, Trophy, MapPin, ArrowRight } from 'lucide-react';

export const TopPartnersTable: React.FC = () => {
  const { partners, settlements, setActiveTab } = useCRM();

  // Leaderboard: HANYA menampilkan toko dengan 'Total Akumulasi Pembelian' di atas Rp 0.
  // Jika riwayat transaksi dihapus dan totalnya jadi 0, otomatis hilangkan toko tersebut dari leaderboard.
  const sortedPartners = partners
    .map(p => {
      const partnerTx = settlements.filter(s => s.partnerId === p.id || (s.partnerName && p.storeName && s.partnerName.toLowerCase().trim() === p.storeName.toLowerCase().trim()));
      const txRevenue = partnerTx.reduce((sum, s) => sum + (s.totalCollectedAmount || (s as any).totalCollected || 0), 0);
      const txCartons = partnerTx.reduce((sum, s) => sum + (s.quantitySold || (s as any).qty || 0), 0);

      let effectiveRevenue = 0;
      if (partnerTx.length > 0) {
        effectiveRevenue = (p.totalSettledAmount !== undefined && p.totalSettledAmount > 0) ? p.totalSettledAmount : txRevenue;
      } else {
        effectiveRevenue = (settlements.length === 0 && p.totalSettledAmount !== undefined) ? p.totalSettledAmount : 0;
      }

      const effectiveCartons = partnerTx.length > 0
        ? ((p.totalPurchasedCartons !== undefined && p.totalPurchasedCartons > 0) ? p.totalPurchasedCartons : txCartons)
        : 0;

      return {
        ...p,
        totalSettledAmount: effectiveRevenue,
        totalPurchasedCartons: effectiveCartons,
      };
    })
    .filter(p => (p.totalSettledAmount || 0) > 0)
    .sort((a, b) => (b.totalSettledAmount || 0) - (a.totalSettledAmount || 0));

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sage-100 text-sage-700">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Toko Mitra Reseller Teratas
            </h2>
            <p className="text-xs text-slate-500">
              Mitra grosir B2B Cash & Carry dengan akumulasi order tertinggi
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('partners')}
          className="text-xs font-semibold text-sage-600 hover:text-sage-700 flex items-center gap-1 hover:underline"
        >
          <span>Kelola Mitra</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="pb-3 px-2">Peringkat & Toko</th>
              <th className="pb-3 px-2">Pemilik & Lokasi</th>
              <th className="pb-3 px-2 text-center">Total Pembelian</th>
              <th className="pb-3 px-2 text-right">Total Akumulasi Pembelian</th>
              <th className="pb-3 px-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedPartners.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Store className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                    <p className="font-semibold text-slate-600 text-xs">Belum ada toko mitra dengan akumulasi pembelian di atas Rp 0.</p>
                    <p className="text-[11px] text-slate-400">Toko mitra akan otomatis muncul saat ada transaksi grosir lunas.</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedPartners.slice(0, 4).map((partner, index) => (
                <tr key={partner.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          index === 0
                          ? 'bg-amber-400 text-amber-950 shadow-sm'
                          : index === 1
                          ? 'bg-slate-300 text-slate-800'
                          : index === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="font-bold text-slate-800">
                      {partner.storeName}
                    </span>
                  </div>
                </td>

                <td className="py-3 px-2">
                  <div className="text-slate-700 font-medium">{partner.ownerName}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[150px]">{partner.address}</span>
                  </div>
                </td>

                <td className="py-3 px-2 text-center">
                  <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
                    {partner.totalPurchasedCartons || 0} Karton
                  </span>
                </td>

                <td className="py-3 px-2 text-right">
                  <span className="font-extrabold text-slate-900">
                    {formatRupiah(partner.totalSettledAmount)}
                  </span>
                </td>

                <td className="py-3 px-2 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      partner.status === 'aktif'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {partner.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
