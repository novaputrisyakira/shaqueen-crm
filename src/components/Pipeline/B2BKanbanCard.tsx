'use client';

import React from 'react';
import { B2BSettlement, B2BPipelineStage, B2BPartner } from '@/lib/types';
import { formatRupiah, formatDateIndo } from '@/lib/utils';
import { 
  MessageSquare, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  Package, 
  Store,
  Phone,
  Trash2,
  CheckCircle2,
  Truck
} from 'lucide-react';

interface B2BKanbanCardProps {
  settlement: B2BSettlement;
  partner?: B2BPartner;
  onAdvanceStage: (settlementId: string, nextStage: B2BPipelineStage) => void;
  onPrevStage: (settlementId: string, prevStage: B2BPipelineStage) => void;
  onTriggerWA: (settlement: B2BSettlement) => void;
  onDeleteSettlement: (settlement: B2BSettlement) => void;
}

export const B2BKanbanCard: React.FC<B2BKanbanCardProps> = ({
  settlement,
  partner,
  onAdvanceStage,
  onPrevStage,
  onTriggerWA,
  onDeleteSettlement,
}) => {
  const stageOrder: B2BPipelineStage[] = ['barang_baru_turun', 'h_plus_7', 'h_plus_14'];
  const rawStage = settlement.pipelineStage || settlement.stage || 'barang_baru_turun';
  const currentStage: B2BPipelineStage = stageOrder.includes(rawStage as B2BPipelineStage) 
    ? (rawStage as B2BPipelineStage) 
    : 'barang_baru_turun';
  const currentIndex = stageOrder.indexOf(currentStage);
  const nextStage = currentIndex < stageOrder.length - 1 ? stageOrder[currentIndex + 1] : null;
  const prevStage = currentIndex > 0 ? stageOrder[currentIndex - 1] : null;

  const ownerName = partner?.ownerName || 'Pemilik Toko';
  const ownerPhone = partner?.phone || settlement.partnerPhone || settlement.phone || '-';

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-soft hover:shadow-card transition-all duration-150 flex flex-col justify-between space-y-3 group relative">
      {/* Top Row: Store Name & Delete Button */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-xl bg-sage-500/10 text-sage-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-xs tracking-tight line-clamp-1">
                {settlement.partnerName}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                {ownerName} • <span className="font-mono text-[10px] text-slate-400">+{ownerPhone}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              Cash & Carry
            </span>
            <button
              type="button"
              onClick={() => onDeleteSettlement(settlement)}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Hapus Transaksi Grosir"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Product & Qty */}
        <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Package className="w-3.5 h-3.5 text-sage-600 shrink-0" />
            <span className="line-clamp-1">{settlement.productName}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-semibold">
              {settlement.quantitySold} {settlement.b2bUnit || 'Karton'} ({settlement.quantitySoldPcs || (settlement.quantitySold * (settlement.b2bConversion || 12))} pcs)
            </span>
            <span className="font-black text-sage-700">
              {formatRupiah(settlement.totalCollectedAmount || settlement.totalCollected || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Date & Stage Tag */}
      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100/80">
        <span className="text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{formatDateIndo(settlement.settlementDate)}</span>
        </span>

        {currentStage === 'barang_baru_turun' && (
          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-200">
            📦 Barang Baru Turun
          </span>
        )}
        {currentStage === 'h_plus_7' && (
          <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full animate-pulse border border-purple-200">
            🔍 H+7 Cek Stok Warung
          </span>
        )}
        {currentStage === 'h_plus_14' && (
          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full animate-pulse border border-amber-200">
            🚚 H+14 Tawaran Restock
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
        {prevStage && (
          <button
            type="button"
            onClick={() => onPrevStage(settlement.id, prevStage)}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-bold transition-all"
            title="Mundur ke tahap sebelumnya"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={() => onTriggerWA(settlement)}
          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Kirim WA Restock</span>
        </button>

        {nextStage ? (
          <button
            type="button"
            onClick={() => onAdvanceStage(settlement.id, nextStage)}
            className="px-2.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all active:scale-95"
            title="Maju ke tahap berikutnya"
          >
            <span>Maju Tahap ➔</span>
          </button>
        ) : (
          <span className="px-2 py-1 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-bold">
            Tahap Akhir
          </span>
        )}
      </div>
    </div>
  );
};
