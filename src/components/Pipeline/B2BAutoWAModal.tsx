'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '@/context/CRMContext';
import { B2BSettlement, B2BPartner } from '@/lib/types';
import { cleanPhoneNumber, createDirectWALink, formatRupiah, formatDateIndo, generateSmartWAMessage } from '@/lib/utils';
import { INITIAL_TEMPLATES } from '@/lib/mockData';
import { 
  X, 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Store,
  Truck
} from 'lucide-react';

interface B2BAutoWAModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlement: B2BSettlement | null;
  partner?: B2BPartner;
}

export const B2BAutoWAModal: React.FC<B2BAutoWAModalProps> = ({
  isOpen,
  onClose,
  settlement,
  partner,
}) => {
  const { triggerWhatsAppMessage, templates } = useCRM();

  const [messageBody, setMessageBody] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSimulatingSend, setIsSimulatingSend] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!settlement) return;

    const ownerName = partner?.ownerName || 'Bapak/Ibu';
    const storeName = settlement.partnerName || partner?.storeName || 'Toko Mitra';
    const productName = settlement.productName || 'Cuanki & Cemilan Shaqueen';
    const qty = settlement.quantitySold || 1;
    const unit = settlement.b2bUnit || 'Karton';
    const stage = settlement.pipelineStage || settlement.stage || 'barang_baru_turun';

    let defaultMsg = '';

    if (stage === 'h_plus_14') {
      defaultMsg = `Halo Bapak/Ibu ${ownerName} dari ${storeName}, salam hangat dari Shaqueen Food Bandung! 🙏

Mengingat pengiriman cemilan ${productName} (${qty} ${unit}) sudah masuk pekan ke-2 (H+14), kami ingin konfirmasi apakah stok di etalase warung sudah mulai menipis?

Kebetulan armada kami sedang menyusun jadwal rute pengiriman restock batch karton baru untuk pekan ini. Mau kami siapkan berapa karton untuk pengiriman ulang berikutnya Pak/Bu agar etalase tetap terisi penuh dan pelanggan tidak kehabisan?

Bisa langsung balas chat ini ya Pak/Bu. Terima kasih banyak atas kerjasamanya! 🚚📦✨`;
    } else if (stage === 'h_plus_7') {
      defaultMsg = `Halo Bapak/Ibu ${ownerName} dari ${storeName}, salam dari Shaqueen Food Bandung! 🙏

Semoga usaha warung/tokonya makin laris dan berkah selalu. Mau silaturahmi menanyakan pergerakan stok cemilan ${productName} di etalase warung, bagaimana respon pembeli sejauh ini? Apakah stoknya masih cukup atau sudah mulai ramai diborong pembeli?

Jika etalase mulai menipis dan butuh tambahan restock batch karton baru, kami siap jadwalkan pengiriman ulang ya Pak/Bu.

Ditunggu kabar baiknya ya, terima kasih! 🚚📦✨`;
    } else {
      defaultMsg = `Halo Bapak/Ibu ${ownerName} dari ${storeName}, salam hangat dari Shaqueen Food Bandung! 🙏

Terima kasih atas transaksi grosir cemilan ${productName} (${qty} ${unit}). Barang sudah sampai dengan selamat dan rapi di etalase toko ya Pak/Bu.

Jika nanti perputaran cemilannya cepat dan butuh jadwal restock karton baru, silakan langsung hubungi kami kembali. Semoga dagangannya laris manis berkah melimpah! 🚚📦✨`;
    }
 
    const b2bTpl = templates?.find((t) => t.id === 'tpl_b2b_restock');
    if (b2bTpl && b2bTpl.templateText && b2bTpl.templateText.trim()) {
      const initialB2BTpl = INITIAL_TEMPLATES.find((t) => t.id === 'tpl_b2b_restock');
      if (initialB2BTpl && b2bTpl.templateText.trim() !== initialB2BTpl.templateText.trim()) {
        defaultMsg = generateSmartWAMessage(b2bTpl.templateText, {
          nama: ownerName,
          toko: storeName,
          produk: productName,
          jumlah: qty,
          total: formatRupiah(settlement.totalCollectedAmount || settlement.totalCollected || 0),
        });
      }
    }

    setMessageBody(defaultMsg);
    setSendSuccessMessage(null);
  }, [settlement, partner, isOpen, templates]);

  if (!isOpen || !settlement) return null;

  const targetPhone = partner?.phone || settlement.partnerPhone || settlement.phone || '';
  const formattedPhone = cleanPhoneNumber(targetPhone);
  const directLink = createDirectWALink(formattedPhone, messageBody);
  const isPhoneValid = formattedPhone.length >= 9;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageBody);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDirectWA = () => {
    if (!isPhoneValid) {
      alert('Nomor WhatsApp mitra toko tidak valid.');
      return;
    }

    triggerWhatsAppMessage({
      customerName: settlement.partnerName,
      customerPhone: formattedPhone,
      orderId: settlement.id,
      stage: `B2B Restock (${settlement.pipelineStage || settlement.stage || 'grosir'})`,
      messageText: messageBody,
      mode: 'direct',
    });

    window.open(directLink, '_blank');
    setSendSuccessMessage('Pesan dibuka di WhatsApp Web/App!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleSimulateGateway = () => {
    if (!isPhoneValid) {
      alert('Nomor WhatsApp mitra toko tidak valid.');
      return;
    }

    setIsSimulatingSend(true);
    setTimeout(() => {
      triggerWhatsAppMessage({
        customerName: settlement.partnerName,
        customerPhone: formattedPhone,
        orderId: settlement.id,
        stage: `B2B Restock (${settlement.pipelineStage || settlement.stage || 'grosir'})`,
        messageText: messageBody,
        mode: 'simulation',
      });
      setIsSimulatingSend(false);
      setSendSuccessMessage('Berhasil terkirim via WhatsApp Cloud Gateway! (Audit Log Tersimpan)');

      setTimeout(() => {
        onClose();
      }, 1500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sage-600 via-teal-700 to-sage-700 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Follow-up WhatsApp Grosir B2B
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                Template restock khusus grosir (Cek sisa stok warung & tawaran pengiriman ulang batch baru)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Recipient Info Card */}
          <div className="p-3.5 bg-sage-50/70 border border-sage-200/80 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-sage-600 uppercase tracking-wider block">
                Penerima (Mitra Reseller B2B)
              </span>
              <span className="text-sm font-extrabold text-slate-800">
                {settlement.partnerName}
              </span>
              <span className="text-xs text-slate-500 font-medium block">
                {partner?.ownerName || 'Pemilik Toko'} • +{targetPhone}
              </span>
            </div>
            <span className="text-xs font-bold text-sage-800 bg-white px-3 py-1 rounded-xl shadow-xs border border-sage-200">
              {settlement.quantitySold} {settlement.b2bUnit || 'Karton'}
            </span>
          </div>

          {/* Success Banner */}
          {sendSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{sendSuccessMessage}</span>
            </div>
          )}

          {/* Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Isi Pesan WhatsApp Grosir (Dapat Diedit):
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] text-sage-700 hover:text-sage-800 font-semibold flex items-center gap-1"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Tersalin!' : 'Salin Teks'}</span>
              </button>
            </div>
            <textarea
              rows={8}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sage-500 font-sans leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-all"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleSimulateGateway}
            disabled={isSimulatingSend}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            {isSimulatingSend ? 'Mengirim...' : 'Simulasi API Gateway'}
          </button>
          <button
            type="button"
            onClick={handleDirectWA}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim via wa.me</span>
          </button>
        </div>
      </div>
    </div>
  );
};
