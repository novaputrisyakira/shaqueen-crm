'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { Product, ProductCategory } from '@/lib/types';
import { formatRupiah, formatNumber, paginateArray } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Package, 
  PlusCircle, 
  MinusCircle,
  TrendingUp,
  Tag,
  LayoutGrid,
  List
} from 'lucide-react';
import { ProductModal } from './ProductModal';
import { PaginationControls } from '../Common/PaginationControls';

export const ProductCatalogView: React.FC = () => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    toggleProductStatus, 
    adjustProductStock,
    searchQuery 
  } = useCRM();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(6);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
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

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sq_categories');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCategories(parsed);
            if (selectedCategory !== 'all' && !parsed.includes(selectedCategory)) {
              setSelectedCategory('all');
            }
          }
        } catch (e) {}
      }
    }
  }, [isModalOpen, products, selectedCategory]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || prod.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' || prod.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const pagination = paginateArray(filteredProducts, currentPage, perPage);

  const handleEdit = (prod: Product) => {
    setProductToEdit(prod);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleDelete = (prod: Product) => {
    setProductToDelete(prod);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Tabs */}
          {['all', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'Semua Produk' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif Saja</option>
            <option value="habis">Habis Saja</option>
          </select>

          {/* View Mode Toggle: Cards vs Table */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Tampilan Tabel Bersih"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Add Product Button */}
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* 2. PRODUCT VIEW: EMPTY STATE */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-soft">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">
            Tidak ada produk yang cocok dengan pencarian atau filter.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Coba ubah kata kunci atau tambahkan produk baru ke katalog Shaqueen Food.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* 3A. PRODUCT CARDS GRID */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagination.data.map((prod) => {
              const marginRp = prod.b2cPrice - prod.b2bPrice;
              const marginPct = prod.b2cPrice > 0 ? Math.round((marginRp / prod.b2cPrice) * 100) : 0;
              const isLowStock = prod.stock < 25 && prod.status === 'aktif';

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-premium transition-all duration-200 overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                      {/* Image / Header Banner */}
                      <div className="h-40 w-full bg-slate-100 relative overflow-hidden">
                        {(prod.imageUrl || prod.image_url) ? (
                          <img
                            src={prod.imageUrl || prod.image_url}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/E85D04/FFFFFF?text=Shaqueen+Food';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center text-brand-600">
                            <Package className="w-12 h-12 opacity-40" />
                          </div>
                        )}

                      {/* Category & SKU Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-extrabold rounded-lg shadow-sm">
                          {prod.category}
                        </span>
                        <span className="px-2 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono rounded-lg">
                          {prod.sku}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <button
                        onClick={() => toggleProductStatus(prod.id)}
                        title="Klik untuk ubah status aktif/habis"
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-extrabold shadow-sm transition-transform active:scale-90 ${
                          prod.status === 'aktif'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {prod.status === 'aktif' ? '● Aktif' : '✕ Habis'}
                      </button>
                    </div>

                    {/* Body Content */}
                    <div className="p-5">
                      <h3 className="font-extrabold text-slate-900 text-sm mb-1 leading-snug line-clamp-2">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                        {prod.description || 'Varian cemilan gurih khas Shaqueen Food.'}
                      </p>

                      {/* Dual Pricing Boxes + HPP */}
                      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs mb-4">
                        <div>
                          <span className="text-[10px] text-brand-700 font-bold uppercase block">
                            Retail B2C
                          </span>
                          <span className="font-black text-slate-900 text-sm">
                            {formatRupiah(prod.b2cPrice)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">Jual Online</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-[#40796C] font-bold uppercase block">
                            Grosir B2B
                          </span>
                          <span className="font-black text-slate-900 text-sm">
                            {formatRupiah(prod.b2bPrice)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">Reseller</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-amber-700 font-bold uppercase block">
                            HPP
                          </span>
                          <span className="font-black text-amber-900 text-sm">
                            {formatRupiah(prod.hpp || 0)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">Modal/pcs</span>
                        </div>
                      </div>

                      {/* Margin Info */}
                      <div className="flex items-center justify-between text-xs px-1 mb-2">
                        <span className="text-slate-500 font-medium">Margin Reseller (Potensi Laba Toko):</span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 text-[11px]">
                          +{formatRupiah(marginRp)} ({marginPct}%)
                        </span>
                      </div>

                      {/* B2B Unit Conversion Badge */}
                      <div className="flex items-center justify-between text-xs px-1 mb-3">
                        <span className="text-slate-500 font-medium">Konversi Grosir B2B:</span>
                        <span className="font-extrabold text-sage-800 bg-sage-50 px-2 py-0.5 rounded-md border border-sage-200/80 text-[11px] inline-flex items-center gap-1">
                          📦 1 {prod.b2bUnit || 'Karton'} = {prod.b2bConversion || 12} Pcs
                        </span>
                      </div>

                      {/* Stock Counter with Quick Adjust */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/60 border border-slate-200/60">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase">
                            Stok Tersedia
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-base font-black ${isLowStock ? 'text-amber-600' : 'text-slate-900'}`}>
                              {formatNumber(prod.stock)} pcs
                            </span>
                            {isLowStock && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                                Menipis!
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => adjustProductStock(prod.id, -10)}
                            title="Kurangi stok (-10)"
                            className="p-1 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => adjustProductStock(prod.id, +10)}
                            title="Tambah stok (+10)"
                            className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-white rounded-lg transition-colors"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Bar */}
                  <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {prod.sku}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEdit(prod)}
                        className="flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-brand-600 bg-white hover:bg-brand-50 rounded-lg transition-colors border border-slate-200 text-xs font-bold"
                        title="Edit Produk"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(prod)}
                        className="flex items-center gap-1 px-2.5 py-1 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 text-xs font-bold"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cards Pagination */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
            <PaginationControls
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              startIndex={pagination.startIndex}
              endIndex={pagination.endIndex}
              onPageChange={setCurrentPage}
              perPage={perPage}
              onPerPageChange={(val) => {
                setPerPage(val);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      ) : (
        /* 3B. PRODUCT CLEAN TABLE VIEW WITH PAGINATION */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/30">
                  <th className="py-3 px-4 w-16 text-center">Foto</th>
                  <th className="py-3 px-4">SKU & Produk</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-right">HPP (Modal Produksi)</th>
                  <th className="py-3 px-4 text-right">Harga Retail B2C</th>
                  <th className="py-3 px-4 text-right">Harga Grosir B2B</th>
                  <th className="py-3 px-4 text-right">Margin Reseller (Potensi Laba Toko)</th>
                  <th className="py-3 px-4 text-center">Stok Fisik</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagination.data.map((prod) => {
                  const marginRp = prod.b2cPrice - prod.b2bPrice;
                  const marginPct = prod.b2cPrice > 0 ? Math.round((marginRp / prod.b2cPrice) * 100) : 0;
                  const isLow = prod.stock < 25 && prod.status === 'aktif';
                  const prodImg = prod.imageUrl || prod.image_url;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs flex-shrink-0 flex items-center justify-center">
                          {prodImg ? (
                            <img
                              src={prodImg}
                              alt={prod.name}
                              className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/E85D04/FFFFFF?text=SF';
                              }}
                            />
                          ) : (
                            <Package className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-slate-900 block">
                          {prod.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-[10px] font-mono text-slate-400">
                            {prod.sku}
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sage-50 text-sage-800 border border-sage-200/80 font-bold text-[10px]">
                            📦 1 {prod.b2bUnit || 'Karton'} = {prod.b2bConversion || 12} Pcs
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                          {prod.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-medium">
                        <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 text-[11px] inline-block">
                          {formatRupiah(prod.hpp || 0)}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal mt-0.5">/ pcs</span>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatRupiah(prod.b2cPrice)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-[#40796C] block">
                          {formatRupiah(prod.b2bPrice)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium block">
                          1 {prod.b2bUnit || 'Karton'} = {prod.b2bConversion || 12} Pcs
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[11px]">
                          +{formatRupiah(marginRp)} ({marginPct}%)
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => adjustProductStock(prod.id, -10)}
                            className="text-slate-400 hover:text-rose-600 p-0.5"
                          >
                            <MinusCircle className="w-3.5 h-3.5" />
                          </button>
                          <span className={`font-black px-1.5 ${isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                            {formatNumber(prod.stock)} pcs
                          </span>
                          <button
                            onClick={() => adjustProductStock(prod.id, +10)}
                            className="text-slate-400 hover:text-emerald-600 p-0.5"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                          ≈ {(prod.stock / (prod.b2bConversion || 12)).toFixed(1).replace('.0', '')} {prod.b2bUnit || 'Karton'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleProductStatus(prod.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            prod.status === 'aktif'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {prod.status === 'aktif' ? 'Aktif' : 'Habis'}
                        </button>
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <div className="flex flex-col gap-1 items-stretch w-20 ml-auto">
                          <button
                            onClick={() => handleEdit(prod)}
                            className="flex items-center justify-center gap-1 py-1 px-2 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-[11px] font-bold transition-colors border border-brand-200/60 active:scale-95 shadow-2xs"
                            title="Edit Produk"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(prod)}
                            className="flex items-center justify-center gap-1 py-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-[11px] font-bold transition-colors active:scale-95 shadow-2xs"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <PaginationControls
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            onPageChange={setCurrentPage}
            perPage={perPage}
            onPerPageChange={(val) => {
              setPerPage(val);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => {
          if (productToEdit) {
            updateProduct(productToEdit.id, data);
          } else {
            addProduct(data);
          }
        }}
        productToEdit={productToEdit}
      />

      {/* Modal Konfirmasi Hapus Produk */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Konfirmasi Hapus Produk</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Yakin ingin menghapus produk <span className="font-bold text-rose-600">"{productToDelete.name}"</span>? Tindakan ini tidak dapat dibatalkan.
            </p>

            {/* Thumbnail Preview */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                <img
                  src={productToDelete.imageUrl || productToDelete.image_url}
                  alt={productToDelete.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/E85D04/FFFFFF?text=SF';
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-slate-900 truncate">{productToDelete.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">{productToDelete.sku} • {productToDelete.category}</p>
                <p className="text-xs font-bold text-brand-600 mt-0.5">{formatRupiah(productToDelete.b2cPrice)}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const name = productToDelete.name;
                  deleteProduct(productToDelete.id);
                  setProductToDelete(null);
                  showToast(`Produk "${name}" berhasil dihapus dari database.`);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/25 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-[#2B1E16] text-[#F4F1DE] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-3">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-ping" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
