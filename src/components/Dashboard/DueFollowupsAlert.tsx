'use client';

import React from 'react';
import { useCRM } from '@/context/CRMContext';
import { MessageSquare, ArrowRight, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { B2COrder } from '@/lib/types';
import { cleanPhoneNumber } from '@/lib/utils';

interface DueFollowupsAlertProps {
  onOpenWAModal: (order: B2COrder) => void;
}

export const DueFollowupsAlert: React.FC<DueFollowupsAlertProps> = ({ onOpenWAModal }) => {
  const { orders, customers, setActiveTab } = useCRM();

  // Find orders in H+2 or H+30 whose customer actively exists in database
  const pendingFollowups = orders.filter((o) => {
    const stage = o.pipelineStage || (o as any).stage;
    const isDue = stage === 'h_plus_2' || stage === 'h_plus_30';
    if (!isDue) return false;
    const cleanOPhone = cleanPhoneNumber(o.customerPhone || (o as any).phone);
    return customers.some(c => 
      (o.customerId && c.id === o.customerId) ||
      (cleanOPhone && cleanPhoneNumber(c.phone) === cleanOPhone) ||
      (o.customerName && c.name && c.name.toLowerCase().trim() === o.customerName.toLowerCase().trim())
    );
  });

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-100 text-brand-600">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              Jadwal Trigger WhatsApp Hari Ini
              {pendingFollowups.length > 0 && (
                <span className="bg-brand-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                  {pendingFollowups.length} Siap Kirim
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              Pelanggan H+2 butuh review kepuasan & H+30 siap restock cemilan
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('pipeline')}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
        >
          <span>Buka Kanban</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {pendingFollowups.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">
            Luar biasa! Tidak ada follow-up yang tertunda.
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Semua pelanggan yang sudah melewati H+2 dan H+30 telah dihubungi.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingFollowups.map((order) => {
            const isH2 = (order.pipelineStage || (order as any).stage) === 'h_plus_2';
            return (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-brand-50/40 border border-slate-200/80 hover:border-brand-200 transition-all gap-3"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wide flex-shrink-0 mt-0.5 ${
                      isH2
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isH2 ? '⭐ H+2 Review' : '🎁 H+30 Restock'}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        {order.customerName}
                      </span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                        {order.platform}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Beli: <span className="font-semibold text-slate-800">{order.productName}</span> ({order.quantity} pcs)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onOpenWAModal(order)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Trigger WA Otomatis</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
