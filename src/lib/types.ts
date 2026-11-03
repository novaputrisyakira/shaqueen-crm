// TypeScript definitions for Shaqueen

export type ProductCategory = 'Cuanki' | 'Keripik' | 'Pilus' | 'Paket Bundle' | string;

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  b2cPrice: number;
  b2bPrice: number;
  hpp?: number; // HPP (Modal Produksi per pcs)
  stock: number;
  status: 'aktif' | 'habis';
  description?: string;
  imageUrl?: string;
  image_url?: string;
  b2bUnit?: string;
  b2bConversion?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type OrderPlatform = 'WhatsApp' | 'Shopee' | 'TikTok';
export type CustomerTag = 'Pelanggan Baru' | 'Pelanggan Loyal' | 'At-Risk (Jarang Beli)';

export interface RetailCustomer {
  id: string;
  name: string;
  phone: string;
  platform: OrderPlatform;
  city: string;
  address: string;
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  tag: CustomerTag;
}

export type OrderStatus = 'diproses' | 'dikirim' | 'selesai' | 'dibatalkan';
export type PipelineStage = 'diproses' | 'dikirim' | 'h_plus_2' | 'h_plus_30';

export interface OrderItem {
  productId: string;
  productName?: string;
  quantity: number;
  orderType?: 'b2c' | 'b2b';
  b2bUnit?: string;
  b2bConversion?: number;
  quantityInPcs?: number;
  unitPrice?: number;
  hpp?: number;
  grossProfit?: number;
  subtotal?: number;
}

export interface B2COrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  productId: string;
  productName: string;
  quantity: number;
  orderType?: 'b2c' | 'b2b';
  b2bUnit?: string;
  b2bConversion?: number;
  quantityInPcs?: number;
  unitPrice: number;
  hpp?: number;
  grossProfit?: number;
  totalAmount: number;
  platform: OrderPlatform;
  status: OrderStatus;
  pipelineStage: PipelineStage;
  trackingNumber?: string;
  notes?: string;
  orderDate: string; // YYYY-MM-DD
  daysPassed?: number;
  items?: OrderItem[];
}

export type PartnerStatus = 'aktif' | 'nonaktif';

export interface B2BPartner {
  id: string;
  storeName: string;
  ownerName: string;
  phone: string;
  address: string;
  location?: string;
  coordinatesLat?: number;
  coordinatesLng?: number;
  joinDate: string;
  status: PartnerStatus;
  notes?: string;
  totalPurchasedCartons?: number;
  totalSettledAmount: number;
}

export interface B2BDrop {
  id: string;
  partnerId?: string;
  productId?: string;
  status?: string;
}

export type B2BPipelineStage = 'barang_baru_turun' | 'h_plus_7' | 'h_plus_14';

export interface B2BSettlement {
  id: string;
  partnerId: string;
  partnerName: string;
  productId: string;
  productName: string;
  settlementDate: string;
  quantitySold: number; // Dalam satuan B2B (Karton)
  quantitySoldPcs?: number;
  b2bUnit?: string;
  b2bConversion?: number;
  b2bUnitPrice: number;
  hpp?: number;
  grossProfit?: number;
  totalCollectedAmount: number;
  totalCollected?: number;
  paymentStatus: 'lunas' | 'pending' | 'transfer';
  notes?: string;
  items?: OrderItem[];
  pipelineStage?: B2BPipelineStage;
  stage?: B2BPipelineStage;
  phone?: string;
  partnerPhone?: string;
}

export interface WATemplate {
  id: string;
  title: string;
  type: 'h_plus_2' | 'h_plus_30' | 'custom';
  templateText: string;
  isActive: boolean;
}

export interface WALog {
  id: string;
  customerName: string;
  customerPhone: string;
  orderId?: string;
  stage: string;
  messageText: string;
  sentAt: string;
  status: 'sent' | 'simulated' | 'failed';
}

export interface CRMSettings {
  brandName: string;
  brandTagline: string;
  brandLogoUrl: string;
  waGatewayMode: 'simulation' | 'direct_wa_me' | 'third_party_api';
  autoTriggerEnabled: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export type ActiveNavigationTab = 
  | 'dashboard' 
  | 'products' 
  | 'customers' 
  | 'partners' 
  | 'pipeline' 
  | 'pipeline_b2b'
  | 'settings';
