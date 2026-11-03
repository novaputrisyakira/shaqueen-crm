'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '@/context/CRMContext';
import { OrderPlatform } from '@/lib/types';
import { formatRupiah, cleanPhoneNumber } from '@/lib/utils';
import { X, ShoppingBag, UserCheck, Plus, Truck } from 'lucide-react';
import { ProductSelectDropdown } from '../Common/ProductSelectDropdown';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { products, customers, addB2COrder } = useCRM();

  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  // New customer inputs
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newAddress, setNewAddress] = useState('');
  
  // Order inputs (Multi-product cart system)
  interface OrderItemRow {
    id: string;
    productId: string;
    qty: number | string;
  }

  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([
    { id: 'item-1', productId: '', qty: 1 }
  ]);
  const [orderType, setOrderType] = useState<'b2c' | 'b2b'>('b2c');
  const [platform, setPlatform] = useState<OrderPlatform>('WhatsApp');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Set default product and customer
  useEffect(() => {
    if (products.length > 0) {
      setOrderItems((prev) => {
        if (prev.length === 0) {
          return [{ id: 'item-1', productId: products[0].id, qty: 1 }];
        }
        return prev.map((item) => ({
          ...item,
          productId: item.productId || products[0].id,
        }));
      });
    }
    if (customers.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [products, customers, isOpen]);

  if (!isOpen) return null;

  const isB2B = orderType === 'b2b';

  const handleAddItem = () => {
    setOrderItems((prev) => [
      ...prev,
      { id: `item-${Date.now()}-${Math.random()}`, productId: products[0]?.id || '', qty: 1 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (orderItems.length <= 1) {
      setOrderItems([{ id: `item-${Date.now()}`, productId: products[0]?.id || '', qty: 1 }]);
      return;
    }
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateProduct = (index: number, productId: string) => {
    setOrderItems((prev) => prev.map((item, i) => (i === index ? { ...item, productId } : item)));
  };

  const handleUpdateQty = (index: number, qty: number | string) => {
    setOrderItems((prev) => prev.map((item, i) => (i === index ? { ...item, qty } : item)));
  };

  const calculatedItems = orderItems.map((item) => {
    const currentProduct = products.find((p) => p.id === item.productId) || products[0];
    const b2bUnit = currentProduct?.b2bUnit || 'Karton';
    const b2bConv = currentProduct?.b2bConversion || 12;
    const parsedQty = Math.max(1, Number(item.qty) || 1);
    const totalPcs = isB2B ? parsedQty * b2bConv : parsedQty;
    const unitPrice = isB2B ? (currentProduct?.b2bPrice || 0) : (currentProduct?.b2cPrice || 0);
    const subtotal = isB2B ? totalPcs * unitPrice : parsedQty * unitPrice;

    return {
      ...item,
      currentProduct,
      b2bUnit,
      b2bConv,
      parsedQty,
      totalPcs,
      unitPrice,
      subtotal,
    };
  });

  const totalAmount = calculatedItems.reduce((acc, it) => acc + it.subtotal, 0);
  const totalPcsAll = calculatedItems.reduce((acc, it) => acc + it.totalPcs, 0);
  const totalQtyAll = calculatedItems.reduce((acc, it) => acc + it.parsedQty, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (calculatedItems.length === 0) {
      alert('Pilih minimal 1 produk.');
      return;
    }

    const itemsPayload = calculatedItems.map((it) => ({
      productId: it.currentProduct?.id || it.productId,
      productName: it.currentProduct?.name || 'Produk',
      quantity: it.parsedQty,
      orderType,
      b2bUnit: isB2B ? it.b2bUnit : undefined,
      b2bConversion: isB2B ? it.b2bConv : undefined,
      quantityInPcs: it.totalPcs,
      unitPrice: it.unitPrice,
      subtotal: it.subtotal,
    }));

    const summaryProductName = itemsPayload.length === 1
      ? itemsPayload[0].productName
      : itemsPayload.map((it) => `${it.productName} (${it.quantity}x)`).join(', ');

    const orderPayload = {
      productId: itemsPayload[0]?.productId || products[0]?.id || '',
      productName: summaryProductName,
      quantity: totalQtyAll,
      orderType,
      quantityInPcs: totalPcsAll,
      customUnitPrice: itemsPayload[0]?.unitPrice || 0,
      customTotalAmount: totalAmount,
      platform,
      trackingNumber: trackingNumber.trim(),
      notes: isB2B
        ? `[Grosir B2B Multi-Produk: ${totalQtyAll} satuan = ${totalPcsAll} Pcs] ${notes.trim()}`.trim()
        : notes.trim(),
      items: itemsPayload,
    };

    if (customerMode === 'new') {
      if (!newName.trim() || !newPhone.trim()) {
        alert('Nama dan No. WhatsApp pelanggan baru wajib diisi.');
        return;
      }
      addB2COrder({
        ...orderPayload,
        newCustomer: {
          name: newName.trim(),
          phone: cleanPhoneNumber(newPhone.trim()),
          platform,
          city: newCity.trim() || 'Bandung',
          address: newAddress.trim() || '-',
        },
      });
    } else {
      if (!selectedCustomerId) {
        alert('Silakan pilih pelanggan yang terdaftar.');
        return;
      }
      addB2COrder({
        ...orderPayload,
        customerId: selectedCustomerId,
      });
    }

    // Reset and close
    setOrderItems([{ id: 'item-1', productId: products[0]?.id || '', qty: 1 }]);
    setNewName('');
    setNewPhone('');
    setNewCity('');
    setNewAddress('');
    setTrackingNumber('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-brand-50 to-brand-100/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-500 text-white shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Input Transaksi Retail B2C Baru
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Otomatis terhubung ke Master Produk & masuk ke Pipeline Follow-Up
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Customer Selection Mode Toggle */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Pilih Data Pelanggan
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setCustomerMode('existing')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  customerMode === 'existing'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pelanggan Terdaftar
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode('new')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  customerMode === 'new'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                + Pelanggan Baru
              </button>
            </div>
          </div>

          {/* Mode Existing */}
          {customerMode === 'existing' ? (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pilih Nama Pelanggan *
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — ({c.phone}) • {c.platform} • {c.city}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* Mode New Customer Inputs */
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Pembeli *
                  </label>
                  <input
                    type="text"
                    value={newName}
                    placeholder="Nama Lengkap"
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    No. WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    placeholder="08123456789"
                    onChange={(e) => setNewPhone(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kota / Wilayah
                  </label>
                  <input
                    type="text"
                    value={newCity}
                    placeholder="Kota Bandung"
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alamat Lengkap
                  </label>
                  <input
                    type="text"
                    value={newAddress}
                    placeholder="Jl..."
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tipe Penjualan Switch */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Tipe Penjualan *
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setOrderType('b2c')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  !isB2B ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Retail (B2C - Pcs)
              </button>
              <button
                type="button"
                onClick={() => setOrderType('b2b')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  isB2B ? 'bg-white text-sage-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grosir (B2B - {calculatedItems[0]?.b2bUnit || 'Karton'})
              </button>
            </div>
          </div>

          {/* Multi-Product Basket / Keranjang Item */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-700">
                Pilih Produk Pesanan ({orderItems.length} Produk)
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                {isB2B ? 'Grosir (Satuan Karton/Dus)' : 'Retail (Pcs)'}
              </span>
            </div>

            <div className="space-y-3">
              {calculatedItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                        {index + 1}
                      </span>
                      Varian Produk #{index + 1}
                    </span>
                    {orderItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1 px-2 text-rose-500 hover:text-white hover:bg-rose-500 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold"
                        title="Hapus baris produk ini"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>

                  {/* Product Selection with Thumbnail Dropdown */}
                  <ProductSelectDropdown
                    products={products}
                    selectedProductId={item.productId}
                    onSelect={(id) => handleUpdateProduct(index, id)}
                    priceType={isB2B ? 'b2b' : 'b2c'}
                    label=""
                    required
                  />

                  {/* Quantity & Subtotal per item */}
                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                        Jumlah Pembelian ({isB2B ? (item.b2bUnit || 'Karton') : 'Pcs'}) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleUpdateQty(index, e.target.value)}
                        required
                        className={`w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 text-xs ${
                          isB2B ? 'focus:ring-sage-500' : 'focus:ring-brand-500'
                        }`}
                      />
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-200 text-right">
                      <span className="block text-[10px] text-slate-400 font-medium">Subtotal Item</span>
                      <span className={`font-extrabold text-xs block ${isB2B ? 'text-sage-700' : 'text-brand-600'}`}>
                        {formatRupiah(item.subtotal)}
                      </span>
                      {isB2B && (
                        <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                          {item.parsedQty} {item.b2bUnit} = {item.totalPcs} pcs
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tombol + Tambah Produk Lain */}
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2.5 border-2 border-dashed border-brand-300 hover:border-brand-500 bg-brand-50/50 hover:bg-brand-50 text-brand-600 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] text-xs shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Produk Lain</span>
            </button>
          </div>

          {/* Platform Pembelian */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Platform Pembelian *
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as OrderPlatform)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="WhatsApp">WhatsApp (Direct)</option>
              <option value="Shopee">Shopee</option>
              <option value="TikTok">TikTok Shop</option>
            </select>
          </div>

          {/* Order Total / B2B Conversion Highlight Box (Otomatis Menjumlahkan Seluruh Subtotal) */}
          {isB2B ? (
            <div className="p-3.5 bg-sage-50 border border-sage-200 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sage-900 text-xs">
                  Kalkulasi Konversi Stok Otomatis:
                </span>
                <span className="font-black text-sage-800 text-xs bg-white px-2.5 py-0.5 rounded-lg border border-sage-200 shadow-2xs">
                  Total {totalPcsAll} Pcs ({calculatedItems.length} Varian Produk)
                </span>
              </div>
              <p className="text-[11px] text-sage-700">
                ⚡ Sistem otomatis memotong total <strong>{totalPcsAll} Pcs</strong> dari Stok Fisik Utama masing-masing produk terpilih.
              </p>
              <div className="pt-1.5 border-t border-sage-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Total Tagihan Grosir ({calculatedItems.length} produk):</span>
                <span className="text-xl font-black text-sage-800 tracking-tight">{formatRupiah(totalAmount)}</span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-brand-50/70 border border-brand-200/80 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-brand-800 font-semibold block">
                  Total Tagihan Retail B2C
                </span>
                <span className="text-[10px] text-slate-500">
                  {totalQtyAll} pcs ({calculatedItems.length} varian produk terpilih)
                </span>
              </div>
              <span className="text-xl font-black text-brand-700 tracking-tight">
                {formatRupiah(totalAmount)}
              </span>
            </div>
          )}

          {/* Tracking Number / Resi */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nomor Resi Ekspedisi (Opsional)
            </label>
            <input
              type="text"
              value={trackingNumber}
              placeholder="Contoh: JNT992817264, SICEPAT8829"
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Catatan Khusus Pesanan
            </label>
            <input
              type="text"
              value={notes}
              placeholder="Level pedas, kemasan bubble wrap, catatan kurir..."
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Action Buttons */}
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
              className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              Simpan & Masukkan ke Pipeline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
