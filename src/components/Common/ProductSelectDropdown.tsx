'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Product } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';
import { ChevronDown, Check, Package, Search } from 'lucide-react';

interface ProductSelectDropdownProps {
  products: Product[];
  selectedProductId: string;
  onSelect: (productId: string) => void;
  priceType?: 'b2c' | 'b2b';
  label?: string;
  required?: boolean;
}

export const ProductSelectDropdown: React.FC<ProductSelectDropdownProps> = ({
  products,
  selectedProductId,
  onSelect,
  priceType = 'b2c',
  label = 'Pilih Produk dari Master Katalog',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block font-semibold text-slate-700 mb-1 text-xs">
          {label} {required && <span className="text-brand-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 bg-slate-50 border rounded-xl flex items-center justify-between gap-3 text-left transition-all ${
          isOpen
            ? 'border-brand-500 ring-2 ring-brand-500/20 bg-white'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        {selectedProduct ? (
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Thumbnail */}
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0 flex items-center justify-center">
              {(selectedProduct.imageUrl || selectedProduct.image_url) ? (
                <img
                  src={selectedProduct.imageUrl || selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/E85D04/FFFFFF?text=SF';
                  }}
                />
              ) : (
                <Package className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {/* Product Meta */}
            <div className="min-w-0 flex-1">
              <span className="font-bold text-slate-900 text-xs block truncate">
                {selectedProduct.name}
              </span>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className={`font-semibold ${priceType === 'b2c' ? 'text-brand-600' : 'text-[#40796C]'}`}>
                  {formatRupiah(priceType === 'b2c' ? selectedProduct.b2cPrice : selectedProduct.b2bPrice)}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400">Sisa: {selectedProduct.stock} pcs</span>
                {priceType === 'b2b' && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-sage-700 font-bold text-[10px] bg-sage-50 px-1.5 py-0.5 rounded border border-sage-200">
                      1 {selectedProduct.b2bUnit || 'Karton'} = {selectedProduct.b2bConversion || 12} Pcs
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-slate-400 text-xs font-medium">-- Pilih Produk dari Katalog --</span>
        )}

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-brand-500' : ''
          }`}
        />
      </button>

      {/* Floating Popover Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Quick Search */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari cemilan atau SKU..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                autoFocus
              />
            </div>
          </div>

          {/* List of Products */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                Tidak ada produk ditemukan
              </div>
            ) : (
              filteredProducts.map((p) => {
                const isSelected = p.id === selectedProductId;
                const price = priceType === 'b2c' ? p.b2cPrice : p.b2bPrice;
                const pImg = p.imageUrl || p.image_url;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelect(p.id);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full p-2.5 flex items-center justify-between gap-3 text-left transition-colors ${
                      isSelected
                        ? 'bg-brand-50/80 text-brand-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Thumbnail with rounded corners */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0 flex items-center justify-center">
                        {pImg ? (
                          <img
                            src={pImg}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/E85D04/FFFFFF?text=SF';
                            }}
                          />
                        ) : (
                          <Package className="w-4 h-4 text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-900 text-xs block truncate">
                          {p.name}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                          <span className={`font-bold ${priceType === 'b2c' ? 'text-brand-600' : 'text-[#40796C]'}`}>
                            {formatRupiah(price)}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]">
                            {p.sku}
                          </span>
                          {priceType === 'b2b' && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="px-1.5 py-0.2 rounded bg-sage-50 text-sage-800 border border-sage-200/80 text-[10px] font-bold">
                                1 {p.b2bUnit || 'Karton'} = {p.b2bConversion || 12} Pcs
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        p.stock > 20
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        Sisa {p.stock}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-brand-600" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
