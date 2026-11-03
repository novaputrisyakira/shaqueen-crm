import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0062')) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62') && cleaned.length > 5) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function generateSmartWAMessage(
  template: string,
  params: {
    nama?: string;
    produk?: string;
    orderNumber?: string;
    platform?: string;
    toko?: string;
    nominal?: string;
    resi?: string;
    tanggal?: string;
    jumlah?: string | number;
    total?: string;
  }
): string {
  let msg = template;
  msg = msg.replace(/{nama}/gi, params.nama || 'Pelanggan');
  msg = msg.replace(/{produk}/gi, params.produk || 'Produk Shaqueen');
  msg = msg.replace(/{orderNumber}/gi, params.orderNumber || '-');
  msg = msg.replace(/{platform}/gi, params.platform || 'Online');
  msg = msg.replace(/{toko}/gi, params.toko || 'Toko Mitra');
  msg = msg.replace(/{nominal}/gi, params.nominal || 'Rp 0');
  msg = msg.replace(/{resi}/gi, params.resi || '-');
  msg = msg.replace(/{tanggal}/gi, params.tanggal || '-');
  msg = msg.replace(/{jumlah}/gi, params.jumlah !== undefined ? String(params.jumlah) : '1');
  msg = msg.replace(/{total}/gi, params.total || params.nominal || 'Rp 0');
  return msg;
}

export function createDirectWALink(phone: string, text: string): string {
  const cleanPhone = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function paginateArray<T>(items: T[], page: number, perPage: number): {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  startIndex: number;
  endIndex: number;
} {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalItems);
  const data = items.slice(startIndex, endIndex);

  return {
    data,
    totalItems,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
  };
}

export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const MONTH_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export function formatMonthName(monthKey: string): string {
  if (!monthKey || monthKey === 'all') return 'Semua Waktu';
  const parts = monthKey.split('-');
  if (parts.length < 2) return monthKey;
  const y = parts[0];
  const m = parseInt(parts[1], 10);
  const name = MONTH_NAMES_ID[m - 1] || parts[1];
  return `${name} ${y}`;
}

export function formatMonthShort(monthKey: string): string {
  if (!monthKey || monthKey === 'all') return 'Semua Waktu';
  const parts = monthKey.split('-');
  if (parts.length < 2) return monthKey;
  const y = parts[0];
  const m = parseInt(parts[1], 10);
  const name = MONTH_SHORT_ID[m - 1] || parts[1];
  return `${name} '${y.slice(2)}`;
}

export function getTransactionMonth(item: any): string {
  if (!item) return '';
  const d = item.orderDate || item.order_date || item.settlementDate || item.settlement_date || item.date || item.createdAt || item.created_at;
  if (!d) return '';
  const str = String(d).trim();
  const m = str.match(/^(\d{4})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}`;
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const mo = String(parsed.getMonth() + 1).padStart(2, '0');
    return `${y}-${mo}`;
  }
  return '';
}
