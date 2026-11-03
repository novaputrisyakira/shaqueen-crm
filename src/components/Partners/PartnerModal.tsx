'use client';

import React, { useState, useEffect } from 'react';
import { B2BPartner, PartnerStatus } from '@/lib/types';
import { X, Store, MapPin, Phone, User } from 'lucide-react';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (partner: Omit<B2BPartner, 'id' | 'totalSettledAmount' | 'totalPurchasedCartons'>) => void;
  partnerToEdit?: B2BPartner | null;
}

export const PartnerModal: React.FC<PartnerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  partnerToEdit,
}) => {
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<PartnerStatus>('aktif');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (partnerToEdit) {
      setStoreName(partnerToEdit.storeName || '');
      setOwnerName(partnerToEdit.ownerName || '');
      setPhone(partnerToEdit.phone || '');
      setAddress(partnerToEdit.address || partnerToEdit.location || '');
      setStatus(partnerToEdit.status || 'aktif');
      setNotes(partnerToEdit.notes || '');
    } else {
      setStoreName('');
      setOwnerName('');
      setPhone('');
      setAddress('');
      setStatus('aktif');
      setNotes('');
    }
  }, [partnerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !ownerName.trim() || !phone.trim()) {
      alert('Nama toko, nama pemilik, dan nomor WA wajib diisi.');
      return;
    }

    const cleanAddress = address.trim() || '-';
    onSave({
      storeName: storeName.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      address: cleanAddress,
      location: cleanAddress,
      status,
      notes: notes.trim(),
      joinDate: partnerToEdit ? partnerToEdit.joinDate : new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sage-50 to-sage-100/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#40796C] text-white shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {partnerToEdit ? 'Edit Data Mitra Reseller B2B' : 'Daftarkan Mitra Reseller B2B Baru'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Database mitra reseller grosir cemilan Shaqueen Food (Beli Putus Cash & Carry)
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
          {/* Store Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Toko / Warung / Agen Reseller *
            </label>
            <input
              type="text"
              value={storeName}
              placeholder="Contoh: Toko Berkah Snack, Warung Madura Barokah"
              onChange={(e) => setStoreName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#40796C]"
            />
          </div>

          {/* Owner & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Pemilik / PIC *
              </label>
              <input
                type="text"
                value={ownerName}
                placeholder="Bu Siti, Pak Hendra..."
                onChange={(e) => setOwnerName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#40796C]"
              />
            </div>
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#40796C]"
              />
            </div>
          </div>

          {/* Address / Location */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Titik Lokasi / Alamat Lengkap Toko
            </label>
            <textarea
              rows={2}
              value={address}
              placeholder="Jl. Raya Kopo No. 118, patokan depan minimarket..."
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#40796C]"
            />
          </div>

          {/* Status Kemitraan */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Status Kemitraan
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PartnerStatus)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#40796C]"
            >
              <option value="aktif">Aktif (Reseller Rutin)</option>
              <option value="nonaktif">Nonaktif / Pasif</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Catatan Khusus Mitra Reseller
            </label>
            <input
              type="text"
              value={notes}
              placeholder="Preferensi varian grosir terlaris, jam operasional toko..."
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#40796C]"
            />
          </div>

          {/* Footer Submit */}
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
              className="px-5 py-2 bg-[#40796C] hover:bg-[#326156] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              {partnerToEdit ? 'Simpan Perubahan' : 'Daftarkan Mitra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
