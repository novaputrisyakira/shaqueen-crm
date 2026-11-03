'use client';

import React from 'react';
import { B2COrder, PipelineStage } from '@/lib/types';
import { formatRupiah, formatDateIndo } from '@/lib/utils';
import { 
  MessageSquare, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  Package, 
  Truck,
  CheckCircle2,
  GripVertical,
  Trash2
} from 'lucide-react';

interface KanbanCardProps {
  order: B2COrder;
  onAdvanceStage: (orderId: string, nextStage: PipelineStage) => void;
  onPrevStage: (orderId: string, prevStage: PipelineStage) => void;
  onTriggerWA: (order: B2COrder) => void;
  onCompleteOrder?: (orderId: string) => void;
  onDeleteOrder?: (order: B2COrder) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  order,
  onAdvanceStage,
  onPrevStage,
  onTriggerWA,
  onCompleteOrder,
  onDeleteOrder,
}) => {
  const stageOrder: PipelineStage[] = ['diproses', 'dikirim', 'h_plus_2', 'h_plus_30'];
  const currentStage = (order.pipelineStage || (order as any).stage || 'diproses') as PipelineStage;
  const currentIndex = stageOrder.indexOf(currentStage);
  const nextStage = currentIndex < stageOrder.length - 1 ? stageOrder[currentIndex + 1] : null;
  const prevStage = currentIndex > 0 ? stageOrder[currentIndex - 1] : null;

  const isDueH2 = currentStage === 'h_plus_2';
  const isDueH30 = currentStage === 'h_plus_30';

  const getPlatformClass = (platform: string) => {
    switch (platform) {
      case 'Shopee':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'TikTok':
        return 'bg-slate-900 text-white border-slate-700';
      case 'WhatsApp':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', order.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft hover:shadow-card transition-all duration-150 flex flex-col justify-between space-y-3 group relative cursor-grab active:cursor-grabbing"
    >
      {/* Top Row: Customer & Platform */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-start gap-1.5">
            <span className="text-slate-300 group-hover:text-slate-500 transition-colors mt-0.5" title="Tahan & geser kartu antar kolom">
              <GripVertical className="w-3.5 h-3.5" />
            </span>
            <div>
              <h4 className="font-extrabold text-slate-900 text-xs tracking-tight line-clamp-1">
                {order.customerName}
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                {order.orderNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getPlatformClass(
                order.platform
              )}`}
            >
              {order.platform}
            </span>
            {onDeleteOrder && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteOrder(order);
                }}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Hapus Pesanan"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Product & Qty */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Package className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
            <span className="line-clamp-1">{order.productName}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>
              {order.b2bUnit 
                ? `${order.quantity} ${order.b2bUnit} (${order.quantityInPcs || (order.quantity * (order.b2bConversion || 1))} pcs)`
                : `${order.quantity} pcs`}
            </span>
            <span className="font-extrabold text-slate-900">
              {formatRupiah(order.totalAmount !== undefined ? order.totalAmount : ((order as any).total || 0))}
            </span>
          </div>
          {(order.trackingNumber || (order as any).resi) && (
            <div className="text-[10px] text-blue-600 font-mono mt-1 pt-1 border-t border-slate-200/50 flex items-center gap-1">
              <Truck className="w-3 h-3 text-blue-500" />
              <span>Resi: {order.trackingNumber || (order as any).resi}</span>
            </div>
          )}
        </div>
      </div>

      {/* Timing and Special Due Tag */}
      <div className="flex items-center justify-between text-[11px] pt-1">
        <span className="text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{formatDateIndo(order.orderDate)}</span>
        </span>

        {isDueH2 && (
          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full animate-pulse border border-amber-200">
            ⭐ Minta Ulasan Rasa
          </span>
        )}

        {isDueH30 && (
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full animate-pulse border border-emerald-200">
            🎁 Promo Restock
          </span>
        )}
      </div>

      {/* Action Footer: Stage Shifts & Trigger WA */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
        {/* Previous Stage */}
        {prevStage ? (
          <button
            onClick={() => onPrevStage(order.id, prevStage)}
            title="Mundurkan tahap"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-7" />
        )}

        {/* Trigger Auto-WA Button */}
        <button
          onClick={() => onTriggerWA(order)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
            isDueH2 || isDueH30
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Trigger Auto-WA</span>
        </button>

        {/* Next Stage or Done */}
        {nextStage ? (
          <button
            onClick={() => onAdvanceStage(order.id, nextStage)}
            title="Majukan ke tahap selanjutnya"
            className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : onCompleteOrder ? (
          <button
            onClick={() => onCompleteOrder(order.id)}
            title="Tandai pesanan selesai & tuntas"
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-7" />
        )}
      </div>
    </div>
  );
};
