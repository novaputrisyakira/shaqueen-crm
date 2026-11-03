'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '@/context/CRMContext';
import { B2COrder } from '@/lib/types';
import { generateSmartWAMessage, cleanPhoneNumber, createDirectWALink, formatRupiah, formatDateIndo } from '@/lib/utils';
import { 
  X, 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Zap, 
  AlertCircle 
} from 'lucide-react';

interface AutoWAModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: B2COrder | null;
}

export const AutoWAModal: React.FC<AutoWAModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const { templates, triggerWhatsAppMessage, updatePipelineStage } = useCRM();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl_h2');
  const [messageBody, setMessageBody] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSimulatingSend, setIsSimulatingSend] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  // When modal opens or order changes, set default template & interpolate variables
  useEffect(() => {
    if (!order) return;

    // Pick appropriate template based on stage
    const defaultTplId = order.pipelineStage === 'h_plus_30' ? 'tpl_h30' : 'tpl_h2';
    setSelectedTemplateId(defaultTplId);

    const tpl = templates.find((t) => t.id === defaultTplId) || templates[0];
    if (tpl) {
      const generated = generateSmartWAMessage(tpl.templateText, {
        nama: order.customerName,
        produk: order.productName,
        orderNumber: order.orderNumber,
        platform: order.platform,
        resi: order.trackingNumber || '-',
        tanggal: formatDateIndo(order.orderDate),
        jumlah: order.quantity,
        total: formatRupiah(order.totalAmount),
      });
      setMessageBody(generated);
    }
    setSendSuccessMessage(null);
  }, [order, isOpen, templates]);

  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    if (!order) return;

    const tpl = templates.find((t) => t.id === tplId);
    if (tpl) {
      const generated = generateSmartWAMessage(tpl.templateText, {
        nama: order.customerName,
        produk: order.productName,
        orderNumber: order.orderNumber,
        platform: order.platform,
        resi: order.trackingNumber || '-',
        tanggal: formatDateIndo(order.orderDate),
        jumlah: order.quantity,
        total: formatRupiah(order.totalAmount),
      });
      setMessageBody(generated);
    }
  };

  if (!isOpen || !order) return null;

  const formattedPhone = cleanPhoneNumber(order.customerPhone);
  const directLink = createDirectWALink(formattedPhone, messageBody);
  const isPhoneValid = formattedPhone.length >= 9;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageBody);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDirectWA = () => {
    if (!isPhoneValid) {
      alert('Nomor WhatsApp pelanggan tidak valid.');
      return;
    }

    // Log the message dispatch
    triggerWhatsAppMessage({
      customerName: order.customerName,
      customerPhone: formattedPhone,
      orderId: order.id,
      stage: order.pipelineStage,
      messageText: messageBody,
      mode: 'direct',
    });

    // Advance stage from H+2 to H+30 if currently at H+2
    if (order.pipelineStage === 'h_plus_2') {
      updatePipelineStage(order.id, 'h_plus_30');
    }

    window.open(directLink, '_blank');
    setSendSuccessMessage('Pesan dibuka di WhatsApp Web/App!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleSimulateGateway = () => {
    if (!isPhoneValid) {
      alert('Nomor WhatsApp pelanggan tidak valid.');
      return;
    }

    setIsSimulatingSend(true);
    setTimeout(() => {
      triggerWhatsAppMessage({
        customerName: order.customerName,
        customerPhone: formattedPhone,
        orderId: order.id,
        stage: order.pipelineStage,
        messageText: messageBody,
        mode: 'simulation',
      });
      setIsSimulatingSend(false);
      setSendSuccessMessage('Berhasil terkirim via WhatsApp Cloud Gateway! (Audit Log Tersimpan)');

      // Advance stage if currently at H+2
      if (order.pipelineStage === 'h_plus_2') {
        updatePipelineStage(order.id, 'h_plus_30');
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                Trigger Pesan WhatsApp Pintar
                <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-bold uppercase">
                  Auto-Substitusi
                </span>
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                Mengotomatisasi pesan ulasan rasa & promo restock sesuai data transaksi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Recipient Details Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">
                  {order.customerName}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isPhoneValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  +{formattedPhone || 'Nomor Tidak Valid'}
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                Produk Terakhir: <span className="font-bold text-slate-800">{order.productName}</span> ({order.quantity} pcs)
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Tahap Pesanan:</span>
              <span className="font-bold text-brand-600 uppercase text-[11px]">
                {order.pipelineStage === 'h_plus_2' ? '⭐ Follow-up H+2 (Review)' : order.pipelineStage === 'h_plus_30' ? '🎁 Follow-up H+30 (Restock)' : order.pipelineStage}
              </span>
            </div>
          </div>

          {!isPhoneValid && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>Nomor WhatsApp pelanggan tidak memiliki format yang valid. Silakan edit nomor pelanggan terlebih dahulu.</span>
            </div>
          )}

          {/* Template Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Pilih Template Pesan
            </label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleTemplateChange(tpl.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    selectedTemplateId === tpl.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs">{tpl.title}</span>
                    {selectedTemplateId === tpl.id && (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    {tpl.type === 'h_plus_2' ? 'Minta ulasan rasa & kepuasan' : 'Tawaran promo restock repeat order'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Message Preview & Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700">
                Isi Pesan WhatsApp (Dapat Diedit Langsung)
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-slate-500 hover:text-slate-800 text-[11px] font-semibold flex items-center gap-1 hover:underline"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'Tersalin!' : 'Salin Teks'}</span>
              </button>
            </div>

            <textarea
              rows={7}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="w-full p-3.5 bg-emerald-50/20 border border-emerald-200 rounded-2xl text-slate-800 font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs leading-relaxed"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Variabel <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">{"{nama}"}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">{"{produk}"}</code>, dan <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">{"{resi}"}</code> otomatis diganti dengan data transaksi.
            </span>
          </div>

          {/* Success Banner */}
          {sendSuccessMessage && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>{sendSuccessMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-slate-600 hover:bg-slate-200 font-semibold rounded-xl transition-colors text-xs"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Simulate API dispatch */}
            <button
              type="button"
              disabled={isSimulatingSend || !isPhoneValid}
              onClick={handleSimulateGateway}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{isSimulatingSend ? 'Mengirim...' : 'Simulasi API Gateway'}</span>
            </button>

            {/* Direct wa.me open */}
            <button
              type="button"
              disabled={!isPhoneValid}
              onClick={handleDirectWA}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka di WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
