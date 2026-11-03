'use client';

import React, { useState, useEffect } from 'react';
import { RetailCustomer, OrderPlatform, CustomerTag } from '@/lib/types';
import { cleanPhoneNumber } from '@/lib/utils';
import { X, UserPlus, Users, MapPin, Phone, Tag, MessageSquare } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Omit<RetailCustomer, 'id' | 'totalOrders' | 'totalSpent' | 'lastOrderDate'>) => void;
  customerToEdit?: RetailCustomer | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customerToEdit,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [platform, setPlatform] = useState<OrderPlatform>('WhatsApp');
  const [city, setCity] = useState('Bandung');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [tag, setTag] = useState<CustomerTag>('Pelanggan Baru');

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone);
      setPlatform(customerToEdit.platform);
      setCity(customerToEdit.city);
      setAddress(customerToEdit.address || '');
      setNotes(customerToEdit.notes || '');
      setTag(customerToEdit.tag || 'Pelanggan Baru');
    } else {
      setName('');
      setPhone('');
      setPlatform('WhatsApp');
      setCity('Bandung');
      setAddress('');
      setNotes('');
      setTag('Pelanggan Baru');
    }
  }, [customerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Nama dan No. WhatsApp wajib diisi.');
      return;
    }

    onSave({
      name: name.trim(),
      phone: cleanPhoneNumber(phone.trim()),
      platform,
      city: city.trim() || 'Bandung',
      address: address.trim() || '-',
      notes: notes.trim(),
      tag,
    });

    onClose();
  };

  const previewClean = cleanPhoneNumber(phone);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-brand-50 to-brand-100/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-500 text-white shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {customerToEdit ? 'Edit Data Pelanggan' : 'Daftarkan Pelanggan Baru'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Database pembeli online & channel retensi Shaqueen Food
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Customer Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Lengkap Pelanggan *
            </label>
            <input
              type="text"
              value={name}
              placeholder="Contoh: Nadia Salsabila"
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Phone & Platform */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                No. WhatsApp *
              </label>
              <input
                type="tel"
                value={phone}
                placeholder="08123456789"
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {previewClean && (
                <span className="text-[10px] text-emerald-700 mt-0.5 block font-mono">
                  Format WA: +{previewClean}
                </span>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Platform Asal Pembeli
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
          </div>

          {/* City & Tag */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kota / Wilayah *
              </label>
              <input
                type="text"
                value={city}
                placeholder="Kota Bandung, Jakarta..."
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tag / Kategori Loyalitas
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value as CustomerTag)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Pelanggan Baru">Pelanggan Baru</option>
                <option value="Pelanggan Loyal">Pelanggan Loyal</option>
                <option value="At-Risk (Jarang Beli)">At-Risk (Jarang Beli)</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Alamat Pengiriman Lengkap
            </label>
            <textarea
              rows={2}
              value={address}
              placeholder="Jl. Tubagus Ismail No. 42, Coblong, Kota Bandung..."
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Catatan Preferensi Rasa / Pelanggan
            </label>
            <input
              type="text"
              value={notes}
              placeholder="Suka pedas level 5, langganan beli pilus kencur..."
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
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
              className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              {customerToEdit ? 'Simpan Perubahan' : 'Daftarkan Pelanggan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
