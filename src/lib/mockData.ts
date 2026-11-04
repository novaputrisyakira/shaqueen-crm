import { 
  Product, 
  RetailCustomer, 
  B2COrder, 
  B2BPartner, 
  B2BDrop, 
  B2BSettlement, 
  WATemplate, 
  CRMSettings,
  WALog
} from './types';

import defaultProductsData from '../data/products.json';
import defaultCustomersData from '../data/customers.json';
import defaultOrdersData from '../data/orders.json';
import defaultPartnersData from '../data/partners.json';
import defaultSettlementsData from '../data/settlements.json';

export const INITIAL_PRODUCTS: Product[] = defaultProductsData as Product[];
export const INITIAL_CUSTOMERS: RetailCustomer[] = defaultCustomersData as RetailCustomer[];
export const INITIAL_ORDERS: B2COrder[] = defaultOrdersData as B2COrder[];
export const INITIAL_PARTNERS: B2BPartner[] = defaultPartnersData as B2BPartner[];
export const INITIAL_DROPS: B2BDrop[] = [];
export const INITIAL_SETTLEMENTS: B2BSettlement[] = defaultSettlementsData as B2BSettlement[];

export const INITIAL_TEMPLATES: WATemplate[] = [
  {
    id: 'tpl_h2',
    title: 'Follow-up H+2: Ulasan Rasa & Kepuasan Pelanggan',
    type: 'h_plus_2',
    templateText: `Halo Kak {nama}! 👋 
Terima kasih sudah berbelanja produk {produk} di Shaqueen Food.

Paket kemarin sudah sampai dan dicoba, Kak? Semoga sensasi gurih dan renyahnya pas di lidah ya! 🥰

Kami ingin mendengar ulasan dan penilaian Kakak. Jika ada masukan atau kritik, mohon infokan ke kami ya Kak untuk terus menyajikan cemilan terbaik. 

Ditunggu kabar baiknya ya Kak! 🙏✨`,
    isActive: true
  },
  {
    id: 'tpl_h30',
    title: 'Follow-up H+30: Promo Restock & Repeat Order',
    type: 'h_plus_30',
    templateText: `Halo Kak {nama}! 👋 
Wah, sudah sebulan nih sejak pesanan {produk} kemarin.

Stok cemilan Shaqueen Food di rumah masih aman atau sudah mulai kangen gurih pedasnya Cuanki & Keripik Moringa? 🤤

Kabar baik untuk Kakak! Khusus pelanggan setia minggu ini, ada promo Gratis Ongkir / Bonus 1 Pouch Pilus Renyah Cikur untuk pemesanan berikutnya.

Kakak mau kami siapin varian apa hari ini? Tinggal balas chat ini ya! 🛒❤️`,
    isActive: true
  },
  {
    id: 'tpl_b2b_restock',
    title: 'Follow-up Grosir B2B: Cek Stok Warung & Penawaran Restock',
    type: 'custom',
    templateText: `Halo Bapak/Ibu {nama} dari {toko}, salam hangat dari Shaqueen Food Bandung! 🙏

Semoga usaha warung/tokonya makin laris dan berkah selalu. Kami ingin menanyakan sisa pergerakan stok cemilan {produk} di etalase toko, apakah saat ini perputarannya cepat dan stoknya sudah mulai menipis?

Kebetulan armada kami sedang menjadwalkan rute pengiriman restock batch karton baru minggu ini. Mau kami prioritaskan pengiriman ulang berapa karton untuk toko Bapak/Ibu agar etalase tetap terisi penuh dan pelanggan tidak kehabisan?

Ditunggu kabar baiknya ya Pak/Bu, terima kasih banyak atas kerjasamanya! 🚚📦✨`,
    isActive: true
  }
];

export const INITIAL_SETTINGS: CRMSettings = {
  brandName: 'Shaqueen Food',
  brandTagline: 'Sistem Operasional & Retensi Pelanggan Shaqueen Food',
  brandLogoUrl: '/shaqueen-logo.png', // User uploaded brand logo
  waGatewayMode: 'simulation',
  autoTriggerEnabled: true,
  supabaseUrl: '',
  supabaseAnonKey: ''
};

export const INITIAL_WA_LOGS: WALog[] = [
  {
    id: 'log-1',
    customerName: 'Clarissa Putri',
    customerPhone: '6281287654321',
    stage: 'Follow-up H+2',
    messageText: 'Halo Kak Clarissa Putri! Terima kasih sudah berbelanja produk Cuanki Ori Gurih Kaldu Sapi di Shaqueen Food...',
    sentAt: '2026-11-01 14:20:00',
    status: 'simulated'
  }
];
