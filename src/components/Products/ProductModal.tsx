'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductCategory } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';
import { X, Sparkles, Tag, DollarSign, Layers, UploadCloud, RefreshCw, Trash2, ChevronDown, Plus } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>) => void;
  productToEdit?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
}) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const DEFAULT_CATEGORIES = ['Cuanki', 'Keripik', 'Pilus', 'Paket Bundle'];
  const [categories, setCategories] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sq_categories');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return DEFAULT_CATEGORIES;
  });
  const [category, setCategory] = useState<ProductCategory>('Cuanki');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [b2cPrice, setB2cPrice] = useState<number>(18000);
  const [b2bPrice, setB2bPrice] = useState<number>(13000);
  const [hpp, setHpp] = useState<number>(9000);
  const [b2bUnit, setB2bUnit] = useState('Karton');
  const [b2bConversion, setB2bConversion] = useState<number | string>(12);
  const [stock, setStock] = useState<number>(100);
  const [status, setStatus] = useState<'aktif' | 'habis'>('aktif');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newCatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let currentCats = DEFAULT_CATEGORIES;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sq_categories');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            currentCats = parsed;
            setCategories(currentCats);
          }
        } catch (e) {}
      }
    }
    if (productToEdit) {
      setSku(productToEdit.sku);
      setName(productToEdit.name);
      setCategory(productToEdit.category || (currentCats[0] || 'Cuanki'));
      setB2cPrice(productToEdit.b2cPrice);
      setB2bPrice(productToEdit.b2bPrice);
      setHpp(productToEdit.hpp !== undefined ? productToEdit.hpp : 9000);
      setB2bUnit(productToEdit.b2bUnit || 'Karton');
      setB2bConversion(productToEdit.b2bConversion || 12);
      setStock(productToEdit.stock);
      setStatus(productToEdit.status);
      setDescription(productToEdit.description || '');
      setImageUrl(productToEdit.imageUrl || productToEdit.image_url || '');
    } else {
      // New product defaults
      setSku(`SQ-PROD-${Math.floor(100 + Math.random() * 900)}`);
      setName('');
      setCategory(currentCats[0] || 'Cuanki');
      setB2cPrice(18000);
      setB2bPrice(13000);
      setHpp(9000);
      setB2bUnit('Karton');
      setB2bConversion(12);
      setStock(100);
      setStatus('aktif');
      setDescription('');
      setImageUrl('');
    }
    setIsCategoryOpen(false);
    setNewCategoryInput('');
    setShowAddInput(false);
  }, [productToEdit, isOpen]);

  useEffect(() => {
    if (productToEdit && productToEdit.category) {
      if (!categories.includes(productToEdit.category)) {
        const updated = [...categories, productToEdit.category];
        setCategories(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem('sq_categories', JSON.stringify(updated));
        }
      }
    }
  }, [productToEdit]);

  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      alert(`Kategori "${trimmed}" sudah ada.`);
      return;
    }
    const updated = [...categories, trimmed];
    setCategories(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sq_categories', JSON.stringify(updated));
    }
    setCategory(trimmed);
    setNewCategoryInput('');
    setShowAddInput(false);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (categories.length <= 1) {
      alert('Minimal harus ada 1 kategori.');
      return;
    }
    if (confirm(`Hapus kategori "${catToDelete}"?`)) {
      const updated = categories.filter((c) => c !== catToDelete);
      setCategories(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('sq_categories', JSON.stringify(updated));
      }
      if (category === catToDelete) {
        setCategory(updated[0] || '');
      }
    }
  };

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar (JPG, PNG, WebP) yang diperbolehkan.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto maksimal 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl((e.target?.result as string) || '');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama produk wajib diisi.');
      return;
    }
    onSave({
      sku: sku.trim() || `SQ-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      category,
      b2cPrice: Number(b2cPrice) || 0,
      b2bPrice: Number(b2bPrice) || 0,
      hpp: Number(hpp) || 0,
      b2bUnit: ((b2bUnit || '').trim() || 'Karton'),
      b2bConversion: Math.max(1, parseInt(String(b2bConversion), 10) || 12),
      stock: Number(stock) || 0,
      status: Number(stock) === 0 ? 'habis' : status,
      description,
      imageUrl,
      image_url: imageUrl,
    });
    onClose();
  };

  const marginRp = Math.max(0, b2cPrice - b2bPrice);
  const marginPct = b2cPrice > 0 ? Math.round((marginRp / b2cPrice) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-brand-50/50 to-sage-50/30">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {productToEdit ? 'Edit Data Produk' : 'Tambah Produk Baru ke Katalog'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Master data produk ini digunakan untuk transaksi retail B2C dan grosir B2B
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* SKU & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kode SKU
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700">
                  Kategori *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryOpen(true);
                    setShowAddInput(true);
                    setTimeout(() => newCatInputRef.current?.focus(), 50);
                  }}
                  className="text-[11px] font-bold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah</span>
                </button>
              </div>

              {/* Trigger */}
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-left flex items-center justify-between text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:bg-slate-100/70 transition-colors text-xs"
              >
                <span className="font-semibold truncate">{category || 'Pilih Kategori'}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 ml-1 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu / Popover */}
              {isCategoryOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsCategoryOpen(false)}
                  />
                  <div className="absolute right-0 w-[300px] sm:w-[320px] max-w-[calc(100vw-3rem)] z-40 mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2.5 space-y-2">
                    {/* Add Category Input */}
                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <input
                        ref={newCatInputRef}
                        type="text"
                        placeholder="Ketik kategori baru..."
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCategory();
                          }
                        }}
                        className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500"
                        autoFocus={showAddInput}
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="px-2.5 py-1 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg text-xs shrink-0 transition-colors shadow-2xs"
                      >
                        + Tambah
                      </button>
                    </div>

                    {/* Category List */}
                    <div className="max-h-44 overflow-y-auto space-y-1 custom-scrollbar">
                      {categories.map((cat) => (
                        <div
                          key={cat}
                          onClick={() => {
                            setCategory(cat);
                            setIsCategoryOpen(false);
                          }}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition-colors ${
                            category === cat
                              ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200/60'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${category === cat ? 'bg-brand-500' : 'bg-slate-300'}`} />
                            <span className="truncate">{cat}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCategory(cat);
                            }}
                            title={`Hapus kategori "${cat}"`}
                            className="p-1 text-rose-500 hover:text-white hover:bg-rose-500 rounded-lg transition-colors ml-2 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Produk Dagangan *
            </label>
            <input
              type="text"
              value={name}
              placeholder="Contoh: Cuanki Instan Super Pedas (Pouch 150g)"
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
            />
          </div>

          {/* Pricing & HPP Grid */}
          <div className="space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-brand-900 mb-1">
                  Harga Jual B2C (Retail) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={b2cPrice}
                    onChange={(e) => setB2cPrice(Number(e.target.value))}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-white border border-brand-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Shopee / TikTok / Pembeli WA
                </span>
              </div>

              <div>
                <label className="block font-semibold text-sage-900 mb-1">
                  Harga Grosir B2B *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={b2bPrice}
                    onChange={(e) => setB2bPrice(Number(e.target.value))}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-white border border-sage-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Dasar harga jual grosir per pcs
                </span>
              </div>
            </div>

            {/* Input HPP (Modal Produksi per pcs) */}
            <div className="pt-2 border-t border-slate-200">
              <label className="block font-bold text-slate-800 mb-1">
                HPP (Modal Produksi per pcs) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  Rp
                </span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={hpp}
                  onChange={(e) => setHpp(Number(e.target.value))}
                  required
                  placeholder="Contoh: 9000"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Biaya bahan baku + kemasan + operasional produksi per pcs (Dasar perhitungan Laba Kotor)
              </span>
            </div>

            {/* Margin Reseller (Potensi Laba Toko) */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
              <span className="text-slate-600 font-semibold">Margin Reseller (Potensi Laba Toko):</span>
              <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                {formatRupiah(marginRp)} ({marginPct}% margin)
              </span>
            </div>
          </div>

          {/* B2B Unit & Conversion Settings */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-sage-50/50 border border-sage-200/80 rounded-2xl">
            <div>
              <label className="block font-bold text-sage-900 mb-1">
                Nama Satuan Grosir *
              </label>
              <input
                type="text"
                value={b2bUnit}
                onChange={(e) => setB2bUnit(e.target.value)}
                required
                placeholder="Karton, Dus, Bal, Pack"
                className="w-full px-3 py-2 bg-white border border-sage-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
              <span className="text-[10px] text-sage-700 mt-0.5 block">
                Misal: Karton, Dus, Pack, Bal
              </span>
            </div>

            <div>
              <label className="block font-bold text-sage-900 mb-1">
                Isi per Satuan Grosir *
              </label>
              <input
                type="number"
                min="1"
                value={b2bConversion}
                onChange={(e) => setB2bConversion(e.target.value)}
                required
                placeholder="12"
                className="w-full px-3 py-2 bg-white border border-sage-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
              <span className="text-[10px] text-sage-700 mt-0.5 block font-semibold">
                1 {b2bUnit || 'Karton'} = {b2bConversion || 12} Pcs
              </span>
            </div>
          </div>

          {/* Stock & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Stok Fisik Tersedia (Pcs)
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status Produk
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'aktif' | 'habis')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="aktif">Aktif (Tersedia Dijual)</option>
                <option value="habis">Habis (Kosong)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Deskripsi Singkat / Varian Rasa
            </label>
            <textarea
              rows={2}
              value={description}
              placeholder="Komposisi bumbu, rasa pedas, keunggulan cemilan..."
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Upload Foto Produk Bergaya Drag-and-Drop */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Foto Produk (Unggah Drag-and-Drop / File / URL)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            {imageUrl ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xs shrink-0 flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Preview Produk"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/F87171/FFFFFF?text=Error';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-800 block truncate">
                    Foto Produk Siap Dipakai
                  </span>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {imageUrl.startsWith('data:') ? 'Foto lokal tersimpan (Base64 Data)' : imageUrl}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-semibold transition-colors shadow-2xs"
                    >
                      <RefreshCw className="w-3 h-3 text-slate-500" />
                      <span>Ganti Foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-semibold transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-rose-500" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${
                  isDragging
                    ? 'border-brand-500 bg-brand-50/60 scale-[1.01]'
                    : 'border-slate-300 hover:border-brand-400 bg-slate-50/50 hover:bg-brand-50/20'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100 shadow-2xs">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-xs block">
                    Tarik & lepas foto produk ke sini, atau <span className="text-brand-600 underline">pilih file</span>
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Format JPG, PNG, WEBP (maks. 5MB)
                  </span>
                </div>
              </div>
            )}

            <div className="pt-1">
              <input
                type="url"
                value={imageUrl}
                placeholder="Atau tempel URL gambar (https://...)"
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-[11px] focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Footer Submit Buttons */}
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
              {productToEdit ? 'Simpan Perubahan' : 'Daftarkan Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
