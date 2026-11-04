'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/context/CRMContext';
import { RetailCustomer, B2COrder, OrderPlatform } from '@/lib/types';
import { formatRupiah, formatDateIndo, cleanPhoneNumber, createDirectWALink, paginateArray } from '@/lib/utils';
import { 
  Users, 
  ShoppingBag, 
  MessageSquare, 
  Search, 
  Filter, 
  ExternalLink, 
  Plus, 
  MapPin, 
  Phone, 
  Truck,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react';
import { CustomerModal } from './CustomerModal';
import { PaginationControls } from '../Common/PaginationControls';

interface CustomerListViewProps {
  onOpenNewOrderModal: () => void;
  onOpenWAModal: (order: B2COrder) => void;
}

export const CustomerListView: React.FC<CustomerListViewProps> = ({
  onOpenNewOrderModal,
  onOpenWAModal,
}) => {
  const { 
    customers, 
    orders, 
    searchQuery, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer, 
    deleteOrder 
  } = useCRM();

  const [activeSubTab, setActiveSubTab] = useState<'customers' | 'orders'>('customers');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');

  // Customer Modal state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<RetailCustomer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<RetailCustomer | null>(null);

  // Pagination states
  const [custPage, setCustPage] = useState(1);
  const [custPerPage, setCustPerPage] = useState(6);
  const [orderPage, setOrderPage] = useState(1);
  const [orderPerPage, setOrderPerPage] = useState(6);

  // Filter customers (Memoized)
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return customers.filter((cust) => {
      const matchesSearch =
        !q ||
        cust.name.toLowerCase().includes(q) ||
        cust.phone.includes(q) ||
        cust.city.toLowerCase().includes(q);

      const matchesPlatform = platformFilter === 'all' || cust.platform === platformFilter;
      const matchesTag =
        tagFilter === 'all' ||
        cust.tag === tagFilter ||
        (tagFilter === 'Pelanggan Baru' && cust.tag === 'Baru') ||
        (tagFilter === 'Pelanggan Loyal' && cust.tag === 'Loyal') ||
        (tagFilter === 'At-Risk (Jarang Beli)' && cust.tag === 'At-Risk');

      return matchesSearch && matchesPlatform && matchesTag;
    });
  }, [customers, searchQuery, platformFilter, tagFilter]);

  // Filter orders (Memoized)
  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return orders.filter((ord) => {
      const matchesSearch =
        !q ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.productName.toLowerCase().includes(q) ||
        ord.orderNumber.toLowerCase().includes(q);

      const matchesPlatform = platformFilter === 'all' || ord.platform === platformFilter;
      const matchesStage = stageFilter === 'all' || ord.pipelineStage === stageFilter;

      return matchesSearch && matchesPlatform && matchesStage;
    });
  }, [orders, searchQuery, platformFilter, stageFilter]);

  const customerPagination = useMemo(() => {
    return paginateArray(filteredCustomers, custPage, custPerPage);
  }, [filteredCustomers, custPage, custPerPage]);

  const orderPagination = useMemo(() => {
    return paginateArray(filteredOrders, orderPage, orderPerPage);
  }, [filteredOrders, orderPage, orderPerPage]);

  const handleEditCustomer = (c: RetailCustomer) => {
    setCustomerToEdit(c);
    setIsCustomerModalOpen(true);
  };

  const handleAddNewCustomer = () => {
    setCustomerToEdit(null);
    setIsCustomerModalOpen(true);
  };

  const handleDeleteCustomer = (c: RetailCustomer) => {
    setCustomerToDelete(c);
  };

  const handleDeleteOrder = (ord: B2COrder) => {
    if (confirm('Yakin ingin membatalkan dan menghapus transaksi ini?')) {
      deleteOrder(ord.id);
    }
  };

  const getPlatformBadge = (platform: OrderPlatform) => {
    switch (platform) {
      case 'Shopee':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'TikTok':
        return 'bg-slate-900 text-white border-slate-700';
      case 'WhatsApp':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'diproses':
        return { label: '📦 Diproses', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'dikirim':
        return { label: '🚚 Dikirim', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'h_plus_2':
        return { label: '⭐ Follow-up H+2', color: 'bg-purple-100 text-purple-800 border-purple-200 font-bold' };
      case 'h_plus_30':
        return { label: '🎁 Follow-up H+30', color: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold' };
      default:
        return { label: stage, color: 'bg-slate-100 text-slate-800' };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP SUBTABS & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveSubTab('customers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'customers'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-brand-500" />
            <span>Database Pelanggan ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'orders'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-brand-500" />
            <span>Riwayat Transaksi Retail ({orders.length})</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => {
              setPlatformFilter(e.target.value);
              setCustPage(1);
              setOrderPage(1);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">Semua Saluran</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Shopee">Shopee</option>
            <option value="TikTok">TikTok</option>
          </select>

          {/* Conditional secondary filter */}
          {activeSubTab === 'customers' ? (
            <select
              value={tagFilter}
              onChange={(e) => {
                setTagFilter(e.target.value);
                setCustPage(1);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">Semua Tag</option>
              <option value="Pelanggan Baru">Pelanggan Baru</option>
              <option value="Pelanggan Loyal">Pelanggan Loyal</option>
              <option value="At-Risk (Jarang Beli)">At-Risk</option>
            </select>
          ) : (
            <select
              value={stageFilter}
              onChange={(e) => {
                setStageFilter(e.target.value);
                setOrderPage(1);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">Semua Tahap Pipeline</option>
              <option value="diproses">Diproses</option>
              <option value="dikirim">Dikirim</option>
              <option value="h_plus_2">H+2 Review</option>
              <option value="h_plus_30">H+30 Promo</option>
            </select>
          )}

          {/* New Customer Button */}
          {activeSubTab === 'customers' && (
            <button
              onClick={handleAddNewCustomer}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Pelanggan</span>
            </button>
          )}

          {/* New Transaction Button */}
          <button
            onClick={onOpenNewOrderModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Transaksi B2C</span>
          </button>
        </div>
      </div>

      {/* 2. SUBTAB CONTENT: CUSTOMERS TABLE WITH PAGINATION */}
      {activeSubTab === 'customers' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-800">
              Daftar Pelanggan Shaqueen Food Lintas Platform
            </span>
            <span className="text-[11px] text-slate-400">
              Total {filteredCustomers.length} pelanggan terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/30">
                  <th className="py-3 px-4">Nama Pelanggan</th>
                  <th className="py-3 px-4">No. WhatsApp</th>
                  <th className="py-3 px-4">Platform Asal</th>
                  <th className="py-3 px-4">Kota & Alamat</th>
                  <th className="py-3 px-4 text-center">Status / Tag</th>
                  <th className="py-3 px-4 text-right">Total Belanja (LTV)</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerPagination.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada pelanggan yang cocok dengan pencarian atau filter.
                    </td>
                  </tr>
                ) : (
                  customerPagination.data.map((cust) => {
                    const cleanPhone = cleanPhoneNumber(cust.phone);
                    const waLink = createDirectWALink(
                      cleanPhone,
                      `Halo Kak ${cust.name}! Terima kasih sudah menjadi pelanggan setia Shaqueen Food. Ada yang bisa kami bantu seputar pesanan cemilan favorit Kakak? 😊`
                    );

                    return (
                      <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {cust.name}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          +{cleanPhone}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getPlatformBadge(
                              cust.platform
                            )}`}
                          >
                            {cust.platform}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="flex items-center gap-1 font-medium">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{cust.city}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[160px]">
                            {cust.address}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              cust.tag === 'Pelanggan Loyal' || cust.tag === 'Loyal'
                                ? 'bg-emerald-100 text-emerald-800'
                                : cust.tag === 'At-Risk (Jarang Beli)' || cust.tag === 'At-Risk'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {cust.tag}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="font-extrabold text-slate-900">
                            {formatRupiah(cust.totalSpent)}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {cust.totalOrders} kali pesanan
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
                              title="Chat WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Chat WA</span>
                            </a>
                            <button
                              onClick={() => handleEditCustomer(cust)}
                              className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                              title="Edit Data Pelanggan"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(cust)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                              title="Hapus Pelanggan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls
            currentPage={customerPagination.currentPage}
            totalPages={customerPagination.totalPages}
            totalItems={customerPagination.totalItems}
            startIndex={customerPagination.startIndex}
            endIndex={customerPagination.endIndex}
            onPageChange={setCustPage}
            perPage={custPerPage}
            onPerPageChange={(val) => {
              setCustPerPage(val);
              setCustPage(1);
            }}
          />
        </div>
      )}

      {/* 3. SUBTAB CONTENT: B2C ORDERS TABLE WITH PAGINATION */}
      {activeSubTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-800">
              Riwayat Transaksi Retail B2C (Terhubung ke Master Katalog)
            </span>
            <span className="text-[11px] text-slate-400">
              Total {filteredOrders.length} transaksi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/30">
                  <th className="py-3 px-4">No. Pesanan & Tanggal</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Produk Katalog</th>
                  <th className="py-3 px-4 text-center">Jumlah</th>
                  <th className="py-3 px-4 text-right">Total Bayar</th>
                  <th className="py-3 px-4">Saluran</th>
                  <th className="py-3 px-4 text-center">Tahap Pipeline</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orderPagination.data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Belum ada transaksi yang sesuai.
                    </td>
                  </tr>
                ) : (
                  orderPagination.data.map((ord) => {
                    const stageInfo = getStageBadge(ord.pipelineStage);

                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-slate-900 block">
                            {ord.orderNumber}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDateIndo(ord.orderDate)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 block">
                            {ord.customerName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {ord.customerPhone}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 block">
                            {ord.productName}
                          </span>
                          {ord.trackingNumber && (
                            <span className="text-[10px] text-blue-600 font-mono block">
                              Resi: {ord.trackingNumber}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                          {ord.b2bUnit 
                            ? `${ord.quantity} ${ord.b2bUnit} (${ord.quantityInPcs || (ord.quantity * (ord.b2bConversion || 1))} pcs)`
                            : `${ord.quantity} pcs`}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span className="font-extrabold text-slate-900 block">{formatRupiah(ord.totalAmount)}</span>
                          {ord.grossProfit !== undefined && (
                            <span className="text-[10px] text-emerald-700 font-semibold block">
                              Laba: +{formatRupiah(ord.grossProfit)}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getPlatformBadge(
                              ord.platform
                            )}`}
                          >
                            {ord.platform}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[10px] border shadow-xs ${stageInfo.color}`}
                          >
                            {stageInfo.label}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenWAModal(ord)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1 transition-colors"
                              title="Trigger Pesan WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Trigger WA</span>
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(ord)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Pesanan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls
            currentPage={orderPagination.currentPage}
            totalPages={orderPagination.totalPages}
            totalItems={orderPagination.totalItems}
            startIndex={orderPagination.startIndex}
            endIndex={orderPagination.endIndex}
            onPageChange={setOrderPage}
            perPage={orderPerPage}
            onPerPageChange={(val) => {
              setOrderPerPage(val);
              setOrderPage(1);
            }}
          />
        </div>
      )}

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={(data) => {
          if (customerToEdit) {
            updateCustomer(customerToEdit.id, data);
          } else {
            addCustomer(data);
          }
        }}
        customerToEdit={customerToEdit}
      />

      {/* Delete Customer Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF8EE] rounded-3xl max-w-md w-full shadow-2xl border border-[#2B1E16]/10 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-inner">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#2B1E16]">Hapus Pelanggan?</h3>
                <p className="text-[11px] text-[#2B1E16]/70">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-xs text-[#2B1E16]/80 leading-relaxed">
              Yakin ingin menghapus pelanggan <span className="font-bold text-rose-600">"{customerToDelete.name}"</span>? Data riwayat pelanggan akan dihapus dari database.
            </p>

            <div className="p-3 bg-white rounded-2xl border border-[#2B1E16]/10 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">No. WhatsApp:</span>
                <span className="font-mono font-bold text-slate-800">+{cleanPhoneNumber(customerToDelete.phone)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Platform:</span>
                <span className="font-bold text-slate-700">{customerToDelete.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Order / LTV:</span>
                <span className="font-bold text-brand-600">{customerToDelete.totalOrders}x • {formatRupiah(customerToDelete.totalSpent)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2B1E16]/10">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#2B1E16]/70 hover:text-[#2B1E16] hover:bg-black/5 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCustomer(customerToDelete.id);
                  setCustomerToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
