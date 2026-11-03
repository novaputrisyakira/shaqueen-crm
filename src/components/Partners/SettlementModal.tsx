'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '@/context/CRMContext';
import { formatRupiah } from '@/lib/utils';
import { X, DollarSign, Calculator, Package, AlertCircle, ShoppingBag } from 'lucide-react';
import { ProductSelectDropdown } from '../Common/ProductSelectDropdown';

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPartnerId?: string;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({
  isOpen,
  onClose,
  preselectedPartnerId,
}) => {
  const { partners, products, addSettlement } = useCRM();

  const [partnerId, setPartnerId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantitySold, setQuantitySold] = useState<number>(2);
  const [settlementDate, setSettlementDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentStatus, setPaymentStatus] = useState<'lunas' | 'pending' | 'transfer'>('lunas');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (preselectedPartnerId) {
      setPartnerId(preselectedPartnerId);
    } else if (partners.length > 0 && !partnerId) {
      setPartnerId(partners[0].id);
    }
  }, [preselectedPartnerId, partners, isOpen]);

  useEffect(() => {
    if (products.length > 0 && !productId) {
      setProductId(products[0].id);
    }
  }, [products, isOpen]);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === productId) || products[0];
  const b2bUnit = currentProduct?.b2bUnit || 'Karton';
  const b2bConversion = currentProduct?.b2bConversion || 12;
  const b2bUnitPrice = currentProduct ? currentProduct.b2bPrice : 13000;
  
  // Total pcs grosir = Jumlah satuan B2B * konversi
  const totalSoldPcs = (Number(quantitySold) || 0) * b2bConversion;
  const totalCollectedAmount = totalSoldPcs * b2bUnitPrice;

  const currentStock = currentProduct?.stock || 0;
  const isOutOfStock = totalSoldPcs > currentStock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId || !productId) {
      alert('Pilih toko mitra reseller dan produk katalog.');
      return;
    }

    if (Number(quantitySold) <= 0) {
      alert('Jumlah pembelian grosir harus lebih dari 0.');
      return;
    }

    addSettlement({
      partnerId,
      productId,
      settlementDate,
      quantitySold: Number(quantitySold) || 1,
      paymentStatus,
      notes: notes.trim() || `Transaksi Grosir B2B Cash & Carry (${quantitySold} ${b2bUnit})`,
      customTotalAmount: totalCollectedAmount,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Input Transaksi Grosir B2B (Cash & Carry)
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                Pencatatan pembelian grosir putus mitra reseller per karton/dus & potong stok gudang
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Partner Store Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Pilih Toko Mitra Reseller B2B *
            </label>
            <select
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.storeName} ({p.ownerName}) • {p.address}
                </option>
              ))}
            </select>
          </div>

          {/* Product Selection */}
          <div>
            <ProductSelectDropdown
              products={products}
              selectedProductId={productId}
              onSelect={(id) => setProductId(id)}
              priceType="b2b"
              label="Pilih Produk dari Master Katalog"
              required
            />
          </div>

          {/* Product Info & B2B Price indicator */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-slate-200/80 shrink-0 flex items-center justify-center">
                {(currentProduct?.image_url || currentProduct?.imageUrl) ? (
                  <img
                    src={currentProduct.image_url || currentProduct.imageUrl}
                    alt={currentProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/E85D04/FFFFFF?text=SF';
                    }}
                  />
                ) : (
                  <Package className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Produk Grosir
                </span>
                <span className="font-bold text-slate-800 text-xs">
                  {currentProduct?.name}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Sisa Stok Gudang: <strong>{currentStock} pcs</strong>
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                Harga Grosir B2B
              </span>
              <span className="font-black text-emerald-700 text-xs">
                {formatRupiah(b2bUnitPrice)} / pcs
              </span>
              <span className="text-[9px] text-slate-500 block font-medium">
                ({formatRupiah(b2bUnitPrice * b2bConversion)} / {b2bUnit})
              </span>
            </div>
          </div>

          {/* Quantity Input */}
          <div className="p-3.5 bg-emerald-50/40 border border-emerald-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-emerald-950">
                Jumlah Pembelian Grosir ({b2bUnit}) *
              </label>
              <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-emerald-200 shadow-2xs">
                1 {b2bUnit} = {b2bConversion} Pcs
              </span>
            </div>
            <input
              type="number"
              min="1"
              value={quantitySold}
              onChange={(e) => setQuantitySold(Math.max(1, Number(e.target.value)))}
              required
              className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex items-center justify-between text-[11px] pt-1 text-emerald-800 font-medium">
              <span>Total Pcs Dikeluarkan:</span>
              <span className="font-extrabold">{quantitySold} {b2bUnit} × {b2bConversion} = {totalSoldPcs} Pcs</span>
            </div>

            {isOutOfStock && (
              <div className="text-[11px] text-rose-600 flex items-center gap-1 font-semibold pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Peringatan: Jumlah pesanan ({totalSoldPcs} pcs) melebihi stok fisik gudang saat ini ({currentStock} pcs).</span>
              </div>
            )}
          </div>

          {/* TOTAL PAYMENT HIGHLIGHT */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-[11px] font-bold text-emerald-950 block">
                  Total Pembayaran Grosir B2B (Lunas)
                </span>
                <span className="text-[10px] text-slate-500">
                  {quantitySold} {b2bUnit} ({totalSoldPcs} pcs) × {formatRupiah(b2bUnitPrice)}
                </span>
              </div>
            </div>
            <span className="text-xl font-black text-emerald-700 tracking-tight">
              {formatRupiah(totalCollectedAmount)}
            </span>
          </div>

          {/* Date & Payment Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Transaksi *
              </label>
              <input
                type="date"
                value={settlementDate}
                onChange={(e) => setSettlementDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Metode Pembayaran
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as 'lunas' | 'pending' | 'transfer')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
              >
                <option value="lunas">Lunas (Tunai Diterima)</option>
                <option value="transfer">Lunas (Transfer Rekening)</option>
                <option value="pending">Pending (Tempo)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Catatan Transaksi Grosir
            </label>
            <input
              type="text"
              value={notes}
              placeholder="Nomor invoice grosir, info kurir / ambil langsung di gudang..."
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              Simpan & Catat Transaksi Grosir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
