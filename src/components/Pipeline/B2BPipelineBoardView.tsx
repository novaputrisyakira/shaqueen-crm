'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/context/CRMContext';
import { B2BSettlement, B2BPipelineStage } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';
import { B2BKanbanCard } from './B2BKanbanCard';
import { B2BAutoWAModal } from './B2BAutoWAModal';
import { 
  Package, 
  Store, 
  Plus, 
  CalendarClock, 
  Repeat, 
  Sparkles,
  ShoppingBag,
  Truck
} from 'lucide-react';

interface B2BPipelineBoardViewProps {
  onOpenNewB2BOrder: () => void;
}

export const B2BPipelineBoardView: React.FC<B2BPipelineBoardViewProps> = ({
  onOpenNewB2BOrder,
}) => {
  const { settlements, partners, updateB2BPipelineStage, deleteSettlement, searchQuery } = useCRM();

  const [selectedSettlementForWA, setSelectedSettlementForWA] = useState<B2BSettlement | null>(null);
  const [isWAModalOpen, setIsWAModalOpen] = useState(false);

  // Filter settlements based on search query (Memoized)
  const filteredSettlements = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return settlements;
    return settlements.filter((s) => {
      const matchesSearch =
        (s.partnerName || '').toLowerCase().includes(q) ||
        (s.productName || '').toLowerCase().includes(q);
      return matchesSearch;
    });
  }, [settlements, searchQuery]);

  const columns: {
    id: B2BPipelineStage;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    headerBg: string;
    borderColor: string;
  }[] = [
    {
      id: 'barang_baru_turun',
      title: '1. Barang Baru Turun',
      description: 'Pengiriman batch baru tiba di warung/toko mitra',
      icon: <Package className="w-4 h-4 text-blue-600" />,
      color: 'text-blue-700',
      headerBg: 'bg-blue-50/80',
      borderColor: 'border-blue-200',
    },
    {
      id: 'h_plus_7',
      title: '2. Follow-up H+7 (Cek Pergerakan Stok)',
      description: 'Cek sisa barang di warung & respon pembeli etalase',
      icon: <CalendarClock className="w-4 h-4 text-purple-600" />,
      color: 'text-purple-700',
      headerBg: 'bg-purple-50/80',
      borderColor: 'border-purple-200',
    },
    {
      id: 'h_plus_14',
      title: '3. Follow-up H+14 (Penawaran Restock)',
      description: 'Tawarkan jadwal armada & kirim ulang batch karton baru',
      icon: <Repeat className="w-4 h-4 text-emerald-600" />,
      color: 'text-emerald-700',
      headerBg: 'bg-emerald-50/80',
      borderColor: 'border-emerald-200',
    },
  ];

  const handleOpenWA = (settlement: B2BSettlement) => {
    setSelectedSettlementForWA(settlement);
    setIsWAModalOpen(true);
  };

  const handleDelete = (settlement: B2BSettlement) => {
    if (confirm(`Yakin ingin membatalkan transaksi grosir ${settlement.partnerName}? Stok fisik akan dikembalikan dan kartu otomatis dihapus dari papan.`)) {
      deleteSettlement(settlement.id);
    }
  };

  const totalWholesaleValue = useMemo(() => {
    return filteredSettlements.reduce(
      (sum, s) => sum + (s.totalCollectedAmount || s.totalCollected || 0),
      0
    );
  }, [filteredSettlements]);

  const totalCartons = useMemo(() => {
    return filteredSettlements.reduce(
      (sum, s) => sum + (s.quantitySold || 1),
      0
    );
  }, [filteredSettlements]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & SUMMARY BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-sage-500/10 text-sage-600 rounded-lg">
              <Store className="w-4 h-4" />
            </span>
            <h2 className="text-base font-extrabold text-slate-900">
              Pipeline Restock B2B (Kanban Khusus Grosir)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring siklus perputaran stok mitra grosir: Barang Baru Turun ➔ Follow-up H+7 (Cek Pergerakan Stok) ➔ Follow-up H+14 (Penawaran Restock)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500">Total Grosir:</span>
            <span className="font-extrabold text-slate-900">{formatRupiah(totalWholesaleValue)}</span>
            <span className="text-slate-400">({totalCartons} Karton)</span>
          </div>

          <button
            onClick={onOpenNewB2BOrder}
            className="flex items-center gap-1.5 px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sage-600/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Transaksi Grosir B2B</span>
          </button>
        </div>
      </div>

      {/* 2. KANBAN BOARD VIEW (3 COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {columns.map((col) => {
          const colSettlements = filteredSettlements.filter(
            (s) => (s.pipelineStage || s.stage || 'barang_baru_turun') === col.id
          );
          const colTotalAmount = colSettlements.reduce(
            (sum, s) => sum + (s.totalCollectedAmount || s.totalCollected || 0),
            0
          );
          const colTotalCartons = colSettlements.reduce(
            (sum, s) => sum + (s.quantitySold || 1),
            0
          );

          return (
            <div
              key={col.id}
              className="bg-slate-100/70 rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[85vh] shadow-inner"
            >
              {/* Column Header */}
              <div className={`p-4 border-b ${col.borderColor} ${col.headerBg}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {col.icon}
                    <h3 className={`font-extrabold text-xs uppercase tracking-tight ${col.color}`}>
                      {col.title}
                    </h3>
                  </div>
                  <span className="bg-white text-slate-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full shadow-xs border border-slate-200">
                    {colSettlements.length}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-snug line-clamp-1">
                  {col.description}
                </p>

                <div className="text-[10px] text-slate-500 font-semibold mt-2 pt-1 border-t border-slate-200/50 flex justify-between">
                  <span>Total Nilai Grosir:</span>
                  <span className="font-bold text-slate-800">
                    {formatRupiah(colTotalAmount)} ({colTotalCartons} Karton)
                  </span>
                </div>
              </div>

              {/* Column Cards */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1 min-h-[160px]">
                {colSettlements.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 bg-white/40 rounded-xl border border-dashed border-slate-200 text-xs flex flex-col items-center justify-center h-32">
                    <span>Tidak ada transaksi di tahap ini.</span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      Transaksi grosir baru akan otomatis masuk ke 'Barang Baru Turun'
                    </span>
                  </div>
                ) : (
                  colSettlements.map((settlement) => {
                    const matchedPartner = partners.find(
                      (p) =>
                        p.id === settlement.partnerId ||
                        (p.storeName &&
                          settlement.partnerName &&
                          p.storeName.toLowerCase() === settlement.partnerName.toLowerCase())
                    );

                    return (
                      <B2BKanbanCard
                        key={settlement.id}
                        settlement={settlement}
                        partner={matchedPartner}
                        onAdvanceStage={(id, stage) => updateB2BPipelineStage(id, stage)}
                        onPrevStage={(id, stage) => updateB2BPipelineStage(id, stage)}
                        onTriggerWA={handleOpenWA}
                        onDeleteSettlement={handleDelete}
                      />
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. WHOLESALE WA MODAL */}
      <B2BAutoWAModal
        isOpen={isWAModalOpen}
        onClose={() => {
          setIsWAModalOpen(false);
          setSelectedSettlementForWA(null);
        }}
        settlement={selectedSettlementForWA}
        partner={
          selectedSettlementForWA
            ? partners.find(
                (p) =>
                  p.id === selectedSettlementForWA.partnerId ||
                  (p.storeName &&
                    selectedSettlementForWA.partnerName &&
                    p.storeName.toLowerCase() === selectedSettlementForWA.partnerName.toLowerCase())
              )
            : undefined
        }
      />
    </div>
  );
};
