'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/context/CRMContext';
import { KanbanCard } from './KanbanCard';
import { B2COrder, PipelineStage, OrderPlatform } from '@/lib/types';
import { formatRupiah, formatDateIndo, cleanPhoneNumber } from '@/lib/utils';
import { 
  KanbanSquare, 
  Plus, 
  Package, 
  Truck, 
  Star, 
  Gift, 
  Filter, 
  Sparkles,
  Info,
  Clock,
  CheckCircle2,
  Trash2,
  ExternalLink
} from 'lucide-react';

interface KanbanBoardViewProps {
  onOpenWAModal: (order: B2COrder) => void;
  onOpenNewOrderModal: () => void;
}

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
  onOpenWAModal,
  onOpenNewOrderModal,
}) => {
  const { orders, customers, updatePipelineStage, updateOrderStatus, deleteOrder, searchQuery, waLogs, clearWALogs } = useCRM();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [activeViewTab, setActiveViewTab] = useState<'board' | 'logs'>('board');
  const [dragOverCol, setDragOverCol] = useState<PipelineStage | null>(null);

  const filteredOrders = useMemo(() => {
    const custIdSet = new Set<string>();
    const custPhoneSet = new Set<string>();
    const custNameSet = new Set<string>();

    for (const c of customers) {
      if (c.id) custIdSet.add(c.id);
      const cleanP = cleanPhoneNumber(c.phone);
      if (cleanP) custPhoneSet.add(cleanP);
      if (c.name) custNameSet.add(c.name.toLowerCase().trim());
    }

    const q = searchQuery.toLowerCase().trim();

    return orders.filter((o) => {
      // Only display orders whose customer actively exists in customers database
      const cleanOPhone = cleanPhoneNumber(o.customerPhone || (o as any).phone);
      const cleanOName = (o.customerName || (o as any).name || '').toLowerCase().trim();
      const hasValidCust =
        (o.customerId && custIdSet.has(o.customerId)) ||
        (cleanOPhone && custPhoneSet.has(cleanOPhone)) ||
        (cleanOName && custNameSet.has(cleanOName));
      if (!hasValidCust) return false;

      const matchesSearch =
        !q ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.productName || '').toLowerCase().includes(q) ||
        ((o.orderNumber || (o as any).id || '')).toLowerCase().includes(q);

      const matchesPlatform =
        selectedPlatform === 'all' || o.platform === selectedPlatform;

      return matchesSearch && matchesPlatform;
    });
  }, [orders, customers, searchQuery, selectedPlatform]);

  const columns: {
    id: PipelineStage;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    headerBg: string;
    borderColor: string;
  }[] = [
    {
      id: 'diproses',
      title: '1. Pesanan Diproses',
      description: 'Menyiapkan pesanan & packing bubble wrap',
      icon: <Package className="w-4 h-4 text-blue-600" />,
      color: 'text-blue-700',
      headerBg: 'bg-blue-50/80',
      borderColor: 'border-blue-200',
    },
    {
      id: 'dikirim',
      title: '2. Sedang Dikirim',
      description: 'Paket dalam perjalanan kurir / no resi aktif',
      icon: <Truck className="w-4 h-4 text-amber-600" />,
      color: 'text-amber-700',
      headerBg: 'bg-amber-50/80',
      borderColor: 'border-amber-200',
    },
    {
      id: 'h_plus_2',
      title: '3. Follow-up H+2 (Review)',
      description: 'Pesanan sampai, tanyakan ulasan rasa & kepuasan',
      icon: <Star className="w-4 h-4 text-purple-600" />,
      color: 'text-purple-700',
      headerBg: 'bg-purple-50/80',
      borderColor: 'border-purple-200',
    },
    {
      id: 'h_plus_30',
      title: '4. Follow-up H+30 (Promo)',
      description: 'Cemilan habis, berikan voucher promo restock',
      icon: <Gift className="w-4 h-4 text-emerald-600" />,
      color: 'text-emerald-700',
      headerBg: 'bg-emerald-50/80',
      borderColor: 'border-emerald-200',
    },
  ];

  const handleDragOver = (e: React.DragEvent, colId: PipelineStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDrop = (e: React.DragEvent, colId: PipelineStage) => {
    e.preventDefault();
    setDragOverCol(null);
    const orderId = e.dataTransfer.getData('text/plain');
    if (orderId) {
      updatePipelineStage(orderId, colId);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleCompleteOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'selesai');
    alert('Pesanan berhasil ditandai selesai.');
  };

  const handleDeleteOrder = (order: B2COrder) => {
    if (confirm('Yakin ingin membatalkan dan menghapus transaksi ini?')) {
      deleteOrder(order.id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle: Board vs WA Logs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mr-2">
            <button
              onClick={() => setActiveViewTab('board')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeViewTab === 'board'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setActiveViewTab('logs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeViewTab === 'logs'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Log Audit WA ({waLogs.length})
            </button>
          </div>

          {activeViewTab === 'board' && (
            <>
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Saluran:
              </span>
              {['all', 'WhatsApp', 'Shopee', 'TikTok'].map((plat) => (
                <button
                  key={plat}
                  onClick={() => setSelectedPlatform(plat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedPlatform === plat
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {plat === 'all' ? 'Semua Saluran' : plat}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 font-medium hidden md:block">
            Tips: Geser & letakkan (drag-and-drop) kartu antar kolom
          </div>
          <button
            onClick={onOpenNewOrderModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Pesanan B2C</span>
          </button>
        </div>
      </div>

      {/* 2. KANBAN BOARD VIEW (4 COLUMNS WITH DRAG AND DROP) */}
      {activeViewTab === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {columns.map((col) => {
            const colOrders = filteredOrders.filter((o) => (o.pipelineStage || (o as any).stage) === col.id);
            const colTotalAmount = colOrders.reduce((sum, o) => sum + (o.totalAmount || (o as any).total || 0), 0);
            const isHovered = dragOverCol === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`bg-slate-100/70 rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col max-h-[85vh] shadow-inner ${
                  isHovered
                    ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/30'
                    : 'border-slate-200/90'
                }`}
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
                    <span className="bg-white text-slate-800 text-xs font-extrabold px-2 py-0.5 rounded-full shadow-xs border border-slate-200">
                      {colOrders.length}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-1">
                    {col.description}
                  </p>

                  <div className="text-[10px] text-slate-500 font-semibold mt-2 pt-1 border-t border-slate-200/50 flex justify-between">
                    <span>Total Nilai:</span>
                    <span className="font-bold text-slate-800">{formatRupiah(colTotalAmount)}</span>
                  </div>
                </div>

                {/* Column Card Container */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1 min-h-[160px]">
                  {colOrders.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 bg-white/40 rounded-xl border border-dashed border-slate-200 text-xs flex flex-col items-center justify-center h-32">
                      <span>Tidak ada pesanan di tahap ini.</span>
                      <span className="text-[10px] text-slate-400 mt-1">Tarik kartu ke sini</span>
                    </div>
                  ) : (
                    colOrders.map((order) => (
                      <KanbanCard
                        key={order.id}
                        order={order}
                        onAdvanceStage={(id, stage) => updatePipelineStage(id, stage)}
                        onPrevStage={(id, stage) => updatePipelineStage(id, stage)}
                        onTriggerWA={onOpenWAModal}
                        onCompleteOrder={handleCompleteOrder}
                        onDeleteOrder={handleDeleteOrder}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 3. AUDIT LOG TRIGGER WHATSAPP VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Log Audit Trigger WhatsApp (Simulasi Gateway & Direct)
              </h3>
              <p className="text-xs text-slate-500">
                Riwayat pesan otomatis yang dipicu ke pembeli Shopee, TikTok, dan WhatsApp
              </p>
            </div>
            {waLogs.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Hapus seluruh riwayat log pengiriman WhatsApp?')) {
                    clearWALogs();
                  }
                }}
                className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-semibold rounded-xl border border-rose-200 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan Log</span>
              </button>
            )}
          </div>

          {waLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Belum ada pesan WhatsApp yang dipicu. Coba buka kartu pesanan di tahap H+2 atau H+30 dan klik <strong>Trigger Auto-WA</strong>.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/50">
                    <th className="py-2.5 px-3">Waktu</th>
                    <th className="py-2.5 px-3">Penerima</th>
                    <th className="py-2.5 px-3">Tahap</th>
                    <th className="py-2.5 px-3">Status Pengiriman</th>
                    <th className="py-2.5 px-3">Isi Pesan Terkirim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {waLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {log.sentAt}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{log.customerName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">+{log.customerPhone}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {log.stage}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'sent' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {log.status === 'sent' ? 'Direct wa.me' : 'Simulasi Gateway'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-md">
                        <p className="line-clamp-2 text-[11px] font-sans bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {log.messageText}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
