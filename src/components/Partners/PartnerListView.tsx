'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/context/CRMContext';
import { B2BPartner, B2BSettlement, PartnerStatus } from '@/lib/types';
import { formatRupiah, formatDateIndo, cleanPhoneNumber, createDirectWALink, paginateArray } from '@/lib/utils';
import { 
  Store, 
  DollarSign, 
  Trophy, 
  Plus, 
  MapPin, 
  Phone, 
  Edit, 
  Trash2, 
  CheckCircle, 
  ShoppingBag,
  Package,
  Zap,
  ArrowRight
} from 'lucide-react';
import { PartnerModal } from './PartnerModal';
import { SettlementModal } from './SettlementModal';
import { PaginationControls } from '../Common/PaginationControls';

export const PartnerListView: React.FC = () => {
  const { 
    partners, 
    settlements, 
    addPartner, 
    updatePartner, 
    deletePartner,
    deleteSettlement,
    searchQuery 
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'partners' | 'settlements' | 'performance'>('partners');
  
  // Modals state
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerToEdit, setPartnerToEdit] = useState<B2BPartner | null>(null);
  const [partnerToDelete, setPartnerToDelete] = useState<B2BPartner | null>(null);

  const [isWholesaleModalOpen, setIsWholesaleModalOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | undefined>(undefined);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination states
  const [partnerPage, setPartnerPage] = useState(1);
  const [partnerPerPage, setPartnerPerPage] = useState(6);

  const [stlPage, setStlPage] = useState(1);
  const [stlPerPage, setStlPerPage] = useState(6);

  // Filter partners (Memoized)
  const filteredPartners = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return partners.filter((p) => {
      const matchesSearch =
        !q ||
        p.storeName.toLowerCase().includes(q) ||
        p.ownerName.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.phone.includes(q);

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [partners, searchQuery, statusFilter]);

  // Filter settlements (Riwayat Transaksi Grosir) (Memoized)
  const filteredSettlements = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return settlements.filter((s) => {
      return (
        !q ||
        s.partnerName.toLowerCase().includes(q) ||
        s.productName.toLowerCase().includes(q) ||
        (s.notes && s.notes.toLowerCase().includes(q))
      );
    });
  }, [settlements, searchQuery]);

  const partnerPagination = useMemo(() => {
    return paginateArray(filteredPartners, partnerPage, partnerPerPage);
  }, [filteredPartners, partnerPage, partnerPerPage]);

  const settlementPagination = useMemo(() => {
    return paginateArray(filteredSettlements, stlPage, stlPerPage);
  }, [filteredSettlements, stlPage, stlPerPage]);

  const handleEditPartner = (p: B2BPartner) => {
    setPartnerToEdit(p);
    setIsPartnerModalOpen(true);
  };

  const handleNewPartner = () => {
    setPartnerToEdit(null);
    setIsPartnerModalOpen(true);
  };

  const handleDeletePartner = (p: B2BPartner) => {
    setPartnerToDelete(p);
  };

  const handleDeleteSettlement = (stl: B2BSettlement) => {
    if (confirm('Yakin ingin membatalkan dan menghapus transaksi ini?')) {
      deleteSettlement(stl.id);
    }
  };

  const openWholesaleForPartner = (pId: string) => {
    setSelectedPartnerId(pId);
    setIsWholesaleModalOpen(true);
  };

  // Performance calculations: Ranking based on Total Akumulasi Pembelian & Cartons (Memoized)
  const partnerPerformance = useMemo(() => {
    // Pre-calculate settlements map by partnerId
    const settlementsByPartner = new Map<string, { cartons: number; revenue: number }>();
    for (const s of settlements) {
      if (!s.partnerId) continue;
      const cur = settlementsByPartner.get(s.partnerId) || { cartons: 0, revenue: 0 };
      cur.cartons += (s.quantitySold || 0);
      cur.revenue += (s.totalCollectedAmount || (s as any).totalCollected || 0);
      settlementsByPartner.set(s.partnerId, cur);
    }

    return partners.map((p) => {
      const pStats = settlementsByPartner.get(p.id) || { cartons: 0, revenue: 0 };
      const totalCartons = p.totalPurchasedCartons !== undefined ? p.totalPurchasedCartons : pStats.cartons;
      const totalRevenue = p.totalSettledAmount !== undefined ? p.totalSettledAmount : pStats.revenue;

      return {
        partner: p,
        totalCartons,
        totalRevenue,
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue || b.totalCartons - a.totalCartons);
  }, [partners, settlements]);

  const highestRevenue = useMemo(() => {
    return Math.max(...partnerPerformance.map(p => p.totalRevenue), 1);
  }, [partnerPerformance]);

  const totalB2BOmzetAll = useMemo(() => {
    return settlements.reduce((sum, s) => sum + (s.totalCollectedAmount || (s as any).totalCollected || 0), 0);
  }, [settlements]);

  const totalCartonsAll = useMemo(() => {
    return settlements.reduce((sum, s) => sum + (s.quantitySold || 0), 0);
  }, [settlements]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP TABS & ACTION BUTTONS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('partners')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'partners'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-4 h-4 text-sage-600" />
            <span>Mitra Reseller B2B ({partners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settlements')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'settlements'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span>Riwayat Transaksi Grosir ({settlements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'performance'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Kinerja Mitra Reseller</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleNewPartner}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Mitra Baru</span>
          </button>

          <button
            onClick={() => {
              setSelectedPartnerId(undefined);
              setIsWholesaleModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#40796C] hover:bg-[#326156] text-white rounded-xl text-xs font-bold shadow-md shadow-[#40796C]/20 hover:shadow-lg transition-all active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>+ Transaksi Grosir B2B</span>
          </button>
        </div>
      </div>

      {/* 2. SUBTAB 1: PARTNERS LIST */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Database Mitra Reseller B2B (Beli Putus / Cash & Carry)
                </span>
                <span className="text-[11px] text-slate-500">
                  Pembelian putus per karton/dus dengan harga grosir B2B
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPartnerPage(1);
                  }}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                >
                  <option value="all">Semua</option>
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/30">
                    <th className="py-3 px-4">Nama Toko & Alamat</th>
                    <th className="py-3 px-4">Pemilik & WhatsApp</th>
                    <th className="py-3 px-4 text-center">Total Pembelian</th>
                    <th className="py-3 px-4 text-right">Total Akumulasi Pembelian</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Aksi Operasional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partnerPagination.data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Tidak ada mitra reseller yang cocok dengan filter atau pencarian.
                      </td>
                    </tr>
                  ) : (
                    partnerPagination.data.map((partner) => {
                      const cleanPhone = cleanPhoneNumber(partner.phone);
                      const waLink = createDirectWALink(
                        cleanPhone,
                        `Halo ${partner.ownerName} dari ${partner.storeName}! 👋 Salam dari Shaqueen Food. Mau konfirmasi stok cemilan Cuanki & Keripik di toko masih aman atau siap pesan grosir baru minggu ini? Terima kasih! 🙏`
                      );

                      const partnerTx = settlements.filter(s => s.partnerId === partner.id);
                      const txCartons = partnerTx.reduce((sum, s) => sum + (s.quantitySold || 0), 0);
                      const txRevenue = partnerTx.reduce((sum, s) => sum + (s.totalCollectedAmount || (s as any).totalCollected || 0), 0);
                      const cartons = partner.totalPurchasedCartons !== undefined ? partner.totalPurchasedCartons : txCartons;
                      const revenue = partner.totalSettledAmount !== undefined ? partner.totalSettledAmount : txRevenue;

                      return (
                        <tr key={partner.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-slate-900 block text-xs">
                              {partner.storeName}
                            </span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[220px]">{partner.address}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800 block">
                              {partner.ownerName}
                            </span>
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-emerald-600 hover:text-emerald-700 font-mono inline-flex items-center gap-1 hover:underline mt-0.5"
                              title="Chat WhatsApp Pemilik Toko"
                            >
                              <Phone className="w-2.5 h-2.5" />
                              <span>+{cleanPhone}</span>
                            </a>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                              {cartons} Karton
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <span className="font-extrabold text-slate-900 text-xs">
                              {formatRupiah(revenue)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                partner.status === 'aktif'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {partner.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {/* Edit (ikon pensil) */}
                              <button
                                type="button"
                                onClick={() => handleEditPartner(partner)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                                title="Edit Data Mitra"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Hapus (ikon tempat sampah berwarna merah) */}
                              <button
                                type="button"
                                onClick={() => handleDeletePartner(partner)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                                title="Hapus Toko Mitra"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Input Transaksi Grosir Button (Hijau) */}
                              <button
                                type="button"
                                onClick={() => openWholesaleForPartner(partner.id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#40796C] hover:bg-[#326156] text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
                                title="Input Transaksi Grosir untuk Mitra Ini"
                              >
                                <ShoppingBag className="w-3 h-3" />
                                <span>Input Transaksi</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={partnerPagination.currentPage}
              totalPages={partnerPagination.totalPages}
              totalItems={partnerPagination.totalItems}
              startIndex={partnerPagination.startIndex}
              endIndex={partnerPagination.endIndex}
              onPageChange={setPartnerPage}
              perPage={partnerPerPage}
              onPerPageChange={(val) => {
                setPartnerPerPage(val);
                setPartnerPage(1);
              }}
            />
          </div>

          {/* Bottom Table: Riwayat Transaksi Grosir */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Riwayat Transaksi Grosir (Cash & Carry Lunas)
                </span>
                <span className="text-[11px] text-slate-500">
                  Transaksi grosir B2B beli putus yang otomatis memotong stok gudang
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">
                Total {filteredSettlements.length} transaksi grosir
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/30">
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Nama Toko Mitra</th>
                    <th className="py-3 px-4">Produk & Jumlah Grosir</th>
                    <th className="py-3 px-4 text-right">Total Pembayaran Lunas</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Catatan</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {settlementPagination.data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Belum ada riwayat transaksi grosir B2B.
                      </td>
                    </tr>
                  ) : (
                    settlementPagination.data.map((stl) => {
                      const amount = stl.totalCollectedAmount || (stl as any).totalCollected || 0;
                      return (
                        <tr key={stl.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                            {formatDateIndo(stl.settlementDate)}
                          </td>

                          <td className="py-3 px-4 font-bold text-slate-900">
                            {stl.partnerName}
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800 block">
                              {stl.productName}
                            </span>
                            <span className="font-extrabold text-sage-700 bg-sage-50 px-2 py-0.5 rounded text-[11px] inline-block mt-0.5 border border-sage-200">
                              {stl.quantitySold} {stl.b2bUnit || 'Karton'} ({stl.quantitySoldPcs || (stl.quantitySold * (stl.b2bConversion || 12))} pcs)
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <span className="font-extrabold text-slate-900 block">{formatRupiah(amount)}</span>
                            {stl.grossProfit !== undefined && (
                              <span className="text-[10px] text-emerald-700 font-semibold block">
                                Laba: +{formatRupiah(stl.grossProfit)}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Lunas
                            </span>
                          </td>

                          <td className="py-3 px-4 text-slate-500 text-[11px] max-w-[200px] truncate">
                            {stl.notes || '-'}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteSettlement(stl)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Hapus Transaksi Grosir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={settlementPagination.currentPage}
              totalPages={settlementPagination.totalPages}
              totalItems={settlementPagination.totalItems}
              startIndex={settlementPagination.startIndex}
              endIndex={settlementPagination.endIndex}
              onPageChange={setStlPage}
              perPage={stlPerPage}
              onPerPageChange={(val) => {
                setStlPerPage(val);
                setStlPage(1);
              }}
            />
          </div>
        </div>
      )}

      {/* 3. SUBTAB 2: SETTLEMENTS ONLY TABLE */}
      {activeTab === 'settlements' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Riwayat Transaksi Grosir (Cash & Carry Lunas)
              </span>
              <span className="text-[11px] text-slate-500">
                Pencatatan pembelian grosir reseller B2B
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-semibold">
              Total {filteredSettlements.length} transaksi grosir
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/30">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Nama Toko Mitra</th>
                  <th className="py-3 px-4">Produk & Jumlah Grosir</th>
                  <th className="py-3 px-4 text-right">Total Pembayaran Lunas</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Catatan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settlementPagination.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Belum ada transaksi grosir B2B.
                    </td>
                  </tr>
                ) : (
                  settlementPagination.data.map((stl) => {
                    const amount = stl.totalCollectedAmount || (stl as any).totalCollected || 0;
                    return (
                      <tr key={stl.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                          {formatDateIndo(stl.settlementDate)}
                        </td>

                        <td className="py-3 px-4 font-bold text-slate-900">
                          {stl.partnerName}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 block">
                            {stl.productName}
                          </span>
                          <span className="font-extrabold text-sage-700 bg-sage-50 px-2 py-0.5 rounded text-[11px] inline-block mt-0.5 border border-sage-200">
                            {stl.quantitySold} {stl.b2bUnit || 'Karton'} ({stl.quantitySoldPcs || (stl.quantitySold * (stl.b2bConversion || 12))} pcs)
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span className="font-extrabold text-slate-900 block">{formatRupiah(amount)}</span>
                          {stl.grossProfit !== undefined && (
                            <span className="text-[10px] text-emerald-700 font-semibold block">
                              Laba: +{formatRupiah(stl.grossProfit)}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Lunas
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-500 text-[11px] max-w-[220px] truncate">
                          {stl.notes || '-'}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteSettlement(stl)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Hapus Transaksi Grosir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls
            currentPage={settlementPagination.currentPage}
            totalPages={settlementPagination.totalPages}
            totalItems={settlementPagination.totalItems}
            startIndex={settlementPagination.startIndex}
            endIndex={settlementPagination.endIndex}
            onPageChange={setStlPage}
            perPage={stlPerPage}
            onPerPageChange={(val) => {
              setStlPerPage(val);
              setStlPage(1);
            }}
          />
        </div>
      )}

      {/* 4. SUBTAB 3: PARTNER PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft">
              <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Mitra Reseller Teratas
              </span>
              <div className="text-lg font-black text-slate-900 mt-1">
                {partnerPerformance[0]?.partner.storeName || '-'}
              </div>
              <p className="text-xs text-emerald-600 font-medium mt-0.5">
                Total Akumulasi Pembelian: <strong>{formatRupiah(partnerPerformance[0]?.totalRevenue || 0)}</strong>
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft">
              <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-brand-500" />
                Total Pembelian Grosir
              </span>
              <div className="text-lg font-black text-slate-900 mt-1">
                {totalCartonsAll} Karton Lunas
              </div>
              <p className="text-xs text-sage-600 font-medium mt-0.5">
                Tersebar di {partners.length} titik toko mitra reseller
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft">
              <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                Total Omzet Grosir (B2B)
              </span>
              <div className="text-lg font-black text-slate-900 mt-1">
                {formatRupiah(totalB2BOmzetAll)}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                100% Cash & Carry Beli Putus
              </p>
            </div>
          </div>

          {/* Dynamic Leaderboard Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Laporan Ranking Toko Mitra Reseller B2B
            </h3>

            <div className="space-y-4">
              {partnerPerformance.map((item, idx) => {
                const revenuePct = Math.min(100, Math.round((item.totalRevenue / highestRevenue) * 100));

                return (
                  <div key={item.partner.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          idx === 0 ? 'bg-amber-400 text-amber-950 font-black' : 'bg-slate-900 text-white'
                        }`}>
                          #{idx + 1}
                        </span>
                        <div>
                          <span className="font-extrabold text-slate-900 text-xs">
                            {item.partner.storeName}
                          </span>
                          <span className="text-[11px] text-slate-500 ml-2">
                            PIC: {item.partner.ownerName} ({item.partner.address})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full">
                          {item.totalCartons} Karton
                        </span>
                        <span className="font-black text-slate-900 text-sm">
                          {formatRupiah(item.totalRevenue)}
                        </span>
                      </div>
                    </div>

                    {/* Revenue Progress Bar */}
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.max(8, revenuePct)}%` }}
                        className="bg-gradient-to-r from-sage-500 to-brand-500 h-full rounded-full transition-all duration-500"
                        title={`Akumulasi: ${revenuePct}%`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <PartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        onSave={(data) => {
          if (partnerToEdit) {
            updatePartner(partnerToEdit.id, data);
          } else {
            addPartner(data);
          }
        }}
        partnerToEdit={partnerToEdit}
      />

      <SettlementModal
        isOpen={isWholesaleModalOpen}
        onClose={() => setIsWholesaleModalOpen(false)}
        preselectedPartnerId={selectedPartnerId}
      />

      {/* Modal Konfirmasi Hapus Toko Mitra (Cascade Delete) */}
      {partnerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF8EE] rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-inner">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Yakin ingin menghapus toko ini?</h3>
                <p className="text-[11px] text-slate-500">Cascade Delete: Riwayat transaksi & tiket follow-up pipeline akan terhapus.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Yakin ingin menghapus toko <span className="font-bold text-rose-600">"{partnerToDelete.storeName}"</span>? Sistem otomatis menghapus data toko ini, seluruh riwayat transaksi grosirnya, dan membuang kartu tiket follow-up miliknya di halaman Pipeline Restock B2B tanpa sisa.
            </p>

            {/* Detail info box */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Nama Toko:</span>
                <span className="font-bold text-slate-800">{partnerToDelete.storeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pemilik:</span>
                <span className="font-semibold text-slate-800">{partnerToDelete.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">No. WhatsApp:</span>
                <span className="font-mono font-bold text-slate-800">{partnerToDelete.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lokasi / Alamat:</span>
                <span className="font-medium text-slate-700 truncate max-w-[200px]">{partnerToDelete.address || partnerToDelete.location || '-'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setPartnerToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deletePartner(partnerToDelete.id);
                  setPartnerToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Toko</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
