'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Product, 
  RetailCustomer, 
  B2COrder, 
  B2BPartner, 
  B2BDrop, 
  B2BSettlement, 
  WATemplate, 
  CRMSettings, 
  WALog, 
  ActiveNavigationTab, 
  PipelineStage, 
  B2BPipelineStage,
  OrderStatus, 
  OrderPlatform,
  CustomerTag
} from '@/lib/types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_ORDERS, 
  INITIAL_PARTNERS, 
  INITIAL_DROPS, 
  INITIAL_SETTLEMENTS, 
  INITIAL_TEMPLATES, 
  INITIAL_SETTINGS, 
  INITIAL_WA_LOGS 
} from '@/lib/mockData';
import { cleanPhoneNumber, createDirectWALink, getTransactionMonth } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase';

interface CRMContextType {
  // Navigation & UI state
  activeTab: ActiveNavigationTab;
  setActiveTab: (tab: ActiveNavigationTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isLoaded: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;

  // Auth state
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  login: (email: string, pass: string) => boolean;
  logout: () => void;

  // Data states
  products: Product[];
  customers: RetailCustomer[];
  orders: B2COrder[];
  partners: B2BPartner[];
  drops: B2BDrop[];
  settlements: B2BSettlement[];
  templates: WATemplate[];
  settings: CRMSettings;
  waLogs: WALog[];

  // Supabase state
  supabaseStatus: 'connected' | 'offline' | 'checking';
  testSupabaseConnection: () => Promise<{ success: boolean; message: string }>;

  // Computed metrics
  totalB2COmzet: number;
  totalB2BOmzet: number;
  totalOmzet: number;
  totalB2CGrossProfit: number;
  totalB2BGrossProfit: number;
  totalGrossProfit: number;
  calculateOrderProfit: (o: B2COrder) => number;
  calculateSettlementProfit: (s: B2BSettlement) => number;
  dueFollowUpsCount: number;
  activePartnersCount: number;
  lowStockCount: number;

  // Dynamic Calendar Filter State & Filtered Metrics
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  filteredOrders: B2COrder[];
  filteredSettlements: B2BSettlement[];
  displayedTotalRevenue: number;
  displayedTotalGrossProfit: number;
  displayedB2CRevenue: number;
  displayedB2BRevenue: number;
  displayedGrossProfitMargin: number;
  displayTotalOmzet: number;
  displayGrossProfit: number;
  displayB2COmzet: number;
  displayB2BOmzet: number;
  displayGrossProfitMargin: number;

  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string) => void;
  adjustProductStock: (id: string, delta: number) => void;

  // Customer actions
  addCustomer: (customer: Omit<RetailCustomer, 'id' | 'totalOrders' | 'totalSpent' | 'lastOrderDate' | 'tag'>) => RetailCustomer;
  updateCustomer: (id: string, updates: Partial<RetailCustomer>) => void;
  deleteCustomer: (id: string) => void;

  // B2C & B2B Order & Pipeline actions
  addB2COrder: (data: {
    customerId?: string;
    newCustomer?: { name: string; phone: string; platform: OrderPlatform; city?: string; address?: string };
    productId?: string;
    quantity?: number;
    platform: OrderPlatform;
    trackingNumber?: string;
    notes?: string;
    orderType?: 'b2c' | 'b2b';
    quantityInPcs?: number;
    customUnitPrice?: number;
    customTotalAmount?: number;
    items?: Array<{
      productId: string;
      productName?: string;
      quantity: number;
      orderType?: 'b2c' | 'b2b';
      b2bUnit?: string;
      b2bConversion?: number;
      quantityInPcs?: number;
      unitPrice?: number;
      subtotal?: number;
    }>;
  }) => B2COrder;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updatePipelineStage: (orderId: string, stage: PipelineStage) => void;
  deleteOrder: (orderId: string) => void;

  // B2B Partner actions
  addPartner: (partner: Omit<B2BPartner, 'id' | 'totalSettledAmount' | 'totalPurchasedCartons'>) => void;
  updatePartner: (id: string, updates: Partial<B2BPartner>) => void;
  deletePartner: (id: string) => void;

  // B2B Drop & Settlement actions
  addDrop: (data: {
    partnerId: string;
    productId: string;
    quantityDropped: number;
    dropDate: string;
    batchCode?: string;
    notes?: string;
  }) => void;
  deleteDrop: (dropId: string) => void;
  addSettlement: (data: {
    dropId?: string;
    partnerId: string;
    productId: string;
    settlementDate?: string;
    quantitySold: number;
    paymentStatus?: 'lunas' | 'pending' | 'transfer';
    notes?: string;
    customTotalAmount?: number;
    items?: Array<{
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
    }>;
  }) => void;
  deleteSettlement: (settlementId: string) => void;
  updateB2BPipelineStage: (settlementId: string, stage: B2BPipelineStage) => void;

  // WhatsApp & Settings actions
  updateTemplate: (id: string, templateText: string, isActive?: boolean) => void;
  triggerWhatsAppMessage: (params: {
    customerName: string;
    customerPhone: string;
    orderId?: string;
    stage: string;
    messageText: string;
    mode?: 'direct' | 'simulation';
  }) => { directUrl?: string; success: boolean };
  clearWALogs: () => void;
  updateSettings: (updates: Partial<CRMSettings>) => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  resetToDefaultData: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const STORAGE_KEYS = {
  AUTH: 'shaqueen_auth_session_v1',
  PRODUCTS: 'shaqueen_crm_products_v1',
  CUSTOMERS: 'shaqueen_crm_customers_v1',
  ORDERS: 'shaqueen_crm_orders_v1',
  PARTNERS: 'shaqueen_crm_partners_v1',
  DROPS: 'shaqueen_crm_drops_v1',
  SETTLEMENTS: 'shaqueen_crm_settlements_v1',
  TEMPLATES: 'shaqueen_crm_templates_v1',
  SETTINGS: 'shaqueen_crm_settings_v1',
  WA_LOGS: 'shaqueen_crm_wa_logs_v1',
};

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveNavigationTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth session (locked by default, requires login)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Data states
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState<RetailCustomer[]>(INITIAL_CUSTOMERS);
  const [orders, setOrders] = useState<B2COrder[]>(INITIAL_ORDERS);
  const [partners, setPartners] = useState<B2BPartner[]>(INITIAL_PARTNERS);
  const [drops, setDrops] = useState<B2BDrop[]>(INITIAL_DROPS);
  const [settlements, setSettlements] = useState<B2BSettlement[]>(() => 
    INITIAL_SETTLEMENTS.map(s => ({
      ...s,
      pipelineStage: s.pipelineStage || s.stage || 'barang_baru_turun',
      stage: s.stage || s.pipelineStage || 'barang_baru_turun'
    }))
  );
  const [templates, setTemplates] = useState<WATemplate[]>(INITIAL_TEMPLATES);
  const [settings, setSettings] = useState<CRMSettings>(INITIAL_SETTINGS);
  const [waLogs, setWaLogs] = useState<WALog[]>(INITIAL_WA_LOGS);
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'offline' | 'checking'>('offline');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      // Selalu tampilkan Landing Page saat awal buka link (/)
      setIsLoggedIn(false);

      // Version lock to ensure ONLY official authentic Shaqueen Food catalog & customers are permanently loaded on Vercel
      const DATA_VERSION = 'v20261104_official_shaqueen_pure_v5';
      const currentVersion = localStorage.getItem('shaqueen_data_version');
      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS) || localStorage.getItem('sq_products');
      const storedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || localStorage.getItem('sq_customers');
      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS) || localStorage.getItem('sq_orders');
      const storedPartners = localStorage.getItem(STORAGE_KEYS.PARTNERS) || localStorage.getItem('sq_partners');
      const storedDrops = localStorage.getItem(STORAGE_KEYS.DROPS) || localStorage.getItem('sq_drops');
      const storedSettlements = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS) || localStorage.getItem('sq_settlements');

      if (currentVersion !== DATA_VERSION || !storedProducts || !storedCustomers) {
        // Upgrade / fresh seed: purge unwanted system products and keep strictly authentic Shaqueen Food products
        const permanentCatalog = INITIAL_PRODUCTS;
        setProducts(permanentCatalog);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(permanentCatalog));
        localStorage.setItem('sq_products', JSON.stringify(permanentCatalog));

        // Customers: merge INITIAL_CUSTOMERS with any custom customers
        let customUserCustomers: RetailCustomer[] = [];
        if (storedCustomers) {
          try {
            const parsed: RetailCustomer[] = JSON.parse(storedCustomers);
            if (Array.isArray(parsed)) {
              customUserCustomers = parsed.filter(c => !INITIAL_CUSTOMERS.some(ic => ic.id === c.id || ic.phone === c.phone));
            }
          } catch {}
        }
        const permanentCustomers = [...INITIAL_CUSTOMERS, ...customUserCustomers];
        setCustomers(permanentCustomers);
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(permanentCustomers));
        localStorage.setItem('sq_customers', JSON.stringify(permanentCustomers));

        // Orders: merge INITIAL_ORDERS with any custom orders
        let customUserOrders: B2COrder[] = [];
        if (storedOrders) {
          try {
            const parsed: B2COrder[] = JSON.parse(storedOrders);
            if (Array.isArray(parsed)) {
              customUserOrders = parsed.filter(o => !INITIAL_ORDERS.some(io => io.id === o.id));
            }
          } catch {}
        }
        const permanentOrders = [...INITIAL_ORDERS, ...customUserOrders];
        setOrders(permanentOrders);
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(permanentOrders));
        localStorage.setItem('sq_orders', JSON.stringify(permanentOrders));

        // Partners: merge INITIAL_PARTNERS with any custom partners
        let customUserPartners: B2BPartner[] = [];
        if (storedPartners) {
          try {
            const parsed: B2BPartner[] = JSON.parse(storedPartners);
            if (Array.isArray(parsed)) {
              customUserPartners = parsed.filter(p => !INITIAL_PARTNERS.some(ip => ip.id === p.id));
            }
          } catch {}
        }
        const permanentPartners = [...INITIAL_PARTNERS, ...customUserPartners];
        setPartners(permanentPartners);
        localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(permanentPartners));
        localStorage.setItem('sq_partners', JSON.stringify(permanentPartners));

        // Settlements: merge INITIAL_SETTLEMENTS with any custom settlements
        let customUserSettlements: B2BSettlement[] = [];
        if (storedSettlements) {
          try {
            const parsed: B2BSettlement[] = JSON.parse(storedSettlements);
            if (Array.isArray(parsed)) {
              customUserSettlements = parsed.filter(s => !INITIAL_SETTLEMENTS.some(is => is.id === s.id));
            }
          } catch {}
        }
        const permanentSettlements = [...INITIAL_SETTLEMENTS, ...customUserSettlements];
        setSettlements(permanentSettlements);
        localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(permanentSettlements));
        localStorage.setItem('sq_settlements', JSON.stringify(permanentSettlements));

        localStorage.setItem('shaqueen_data_version', DATA_VERSION);
      } else {
        try {
          const parsed: Product[] = JSON.parse(storedProducts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Keep only authentic products matching INITIAL_PRODUCTS
            const valid = parsed.filter(p => INITIAL_PRODUCTS.some(ip => ip.id === p.id || ip.sku === p.sku));
            const enriched = (valid.length > 0 ? valid : INITIAL_PRODUCTS).map(p => {
              const defaultProd = INITIAL_PRODUCTS.find(ip => ip.id === p.id || ip.sku === p.sku);
              const img = p.image_url || p.imageUrl || defaultProd?.imageUrl || defaultProd?.image_url;
              return {
                ...p,
                imageUrl: img,
                image_url: img,
                hpp: p.hpp !== undefined ? Number(p.hpp) : (defaultProd?.hpp || 9000),
                b2bUnit: ((p.b2bUnit || '').trim() || defaultProd?.b2bUnit || 'Karton'),
                b2bConversion: Math.max(1, parseInt(String(p.b2bConversion), 10) || (defaultProd?.b2bConversion || 12)),
              };
            });
            const existingIds = new Set(enriched.map(p => p.id));
            const missingDefaults = INITIAL_PRODUCTS.filter(dp => !existingIds.has(dp.id));
            const finalProducts = [...enriched, ...missingDefaults];
            setProducts(finalProducts);
          } else {
            setProducts(INITIAL_PRODUCTS);
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
          }
        } catch {
          setProducts(INITIAL_PRODUCTS);
        }

        if (storedCustomers) {
          try {
            setCustomers(JSON.parse(storedCustomers));
          } catch {
            setCustomers(INITIAL_CUSTOMERS);
          }
        }

        if (storedOrders) {
          try {
            const parsed = JSON.parse(storedOrders);
            const normalized = (parsed || []).map((o: any) => ({
              ...o,
              pipelineStage: o.pipelineStage || o.stage || 'diproses',
              stage: o.stage || o.pipelineStage || 'diproses',
              customerPhone: o.customerPhone || o.phone || '',
              phone: o.phone || o.customerPhone || '',
              totalAmount: o.totalAmount !== undefined ? o.totalAmount : (o.total || 0),
              total: o.total !== undefined ? o.total : (o.totalAmount || 0),
              trackingNumber: o.trackingNumber || o.resi || '',
              resi: o.resi || o.trackingNumber || '',
            }));
            setOrders(normalized);
          } catch {
            setOrders(INITIAL_ORDERS);
          }
        }

        if (storedPartners) {
          try {
            setPartners(JSON.parse(storedPartners));
          } catch {
            setPartners(INITIAL_PARTNERS);
          }
        }

        if (storedDrops) {
          try {
            setDrops(JSON.parse(storedDrops));
          } catch {}
        }

        if (storedSettlements) {
          try {
            const parsed = JSON.parse(storedSettlements);
            const validStages: B2BPipelineStage[] = ['barang_baru_turun', 'h_plus_7', 'h_plus_14'];
            setSettlements(parsed.map((s: any) => {
              const stage = (s.pipelineStage && validStages.includes(s.pipelineStage))
                ? s.pipelineStage
                : (s.stage && validStages.includes(s.stage))
                  ? s.stage
                  : 'barang_baru_turun';
              return {
                ...s,
                pipelineStage: stage,
                stage: stage,
              };
            }));
          } catch {
            setSettlements(INITIAL_SETTLEMENTS);
          }
        }
      }

      const storedTemplates = localStorage.getItem(STORAGE_KEYS.TEMPLATES) || localStorage.getItem('sq_templates');
      if (storedTemplates) {
        const parsed: WATemplate[] = JSON.parse(storedTemplates);
        const merged = [...parsed];
        for (const initTpl of INITIAL_TEMPLATES) {
          if (!merged.some(t => t.id === initTpl.id)) {
            merged.push(initTpl);
          }
        }
        setTemplates(merged);
      }

      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings(parsed);
        if (parsed.supabaseUrl && parsed.supabaseAnonKey) {
          setSupabaseStatus('connected');
        }
      }

      const storedLogs = localStorage.getItem(STORAGE_KEYS.WA_LOGS);
      if (storedLogs) setWaLogs(JSON.parse(storedLogs));
    } catch (e) {
      console.error('Error loading CRM data from storage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Global Auto-Refresh Event Listener (Reactivity across tabs & views)
  useEffect(() => {
    const handleDataChanged = () => {
      try {
        const storedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || localStorage.getItem('sq_customers');
        if (storedCustomers) setCustomers(JSON.parse(storedCustomers));

        const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS) || localStorage.getItem('sq_orders');
        if (storedOrders) {
          const parsed = JSON.parse(storedOrders);
          setOrders((parsed || []).map((o: any) => ({
            ...o,
            pipelineStage: o.pipelineStage || o.stage || 'diproses',
            stage: o.stage || o.pipelineStage || 'diproses',
            customerPhone: o.customerPhone || o.phone || '',
            phone: o.phone || o.customerPhone || '',
            totalAmount: o.totalAmount !== undefined ? o.totalAmount : (o.total || 0),
            total: o.total !== undefined ? o.total : (o.totalAmount || 0),
            trackingNumber: o.trackingNumber || o.resi || '',
            resi: o.resi || o.trackingNumber || '',
          })));
        }

        const storedPartners = localStorage.getItem(STORAGE_KEYS.PARTNERS) || localStorage.getItem('sq_partners');
        if (storedPartners) setPartners(JSON.parse(storedPartners));

        const storedDrops = localStorage.getItem(STORAGE_KEYS.DROPS) || localStorage.getItem('sq_drops');
        if (storedDrops) setDrops(JSON.parse(storedDrops));

        const storedSettlements = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS) || localStorage.getItem('sq_settlements');
        if (storedSettlements) {
          const parsed = JSON.parse(storedSettlements);
          const validStages: B2BPipelineStage[] = ['barang_baru_turun', 'h_plus_7', 'h_plus_14'];
          setSettlements(parsed.map((s: any) => {
            const stage = (s.pipelineStage && validStages.includes(s.pipelineStage))
              ? s.pipelineStage
              : (s.stage && validStages.includes(s.stage))
                ? s.stage
                : 'barang_baru_turun';
            return {
              ...s,
              pipelineStage: stage,
              stage: stage,
            };
          }));
        }

        const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS) || localStorage.getItem('sq_products');
        if (storedProducts) setProducts(JSON.parse(storedProducts));

        const storedWaLogs = localStorage.getItem(STORAGE_KEYS.WA_LOGS) || localStorage.getItem('sq_wa_logs');
        if (storedWaLogs) setWaLogs(JSON.parse(storedWaLogs));
      } catch (e) {
        console.error('Error handling reactive data change:', e);
      }
    };

    window.addEventListener('shaqueen-data-changed', handleDataChanged);
    window.addEventListener('storage', handleDataChanged);
    return () => {
      window.removeEventListener('shaqueen-data-changed', handleDataChanged);
      window.removeEventListener('storage', handleDataChanged);
    };
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, String(isLoggedIn));
      localStorage.setItem('sq_logged_in', String(isLoggedIn));
      if (isLoggedIn) {
        localStorage.setItem('sq_auth_session', 'true');
        sessionStorage.setItem('sq_auth_session', 'true');
        const userObj = { email: 'admin@shaqueenfood.com', role: 'admin', name: 'Admin Shaqueen' };
        localStorage.setItem('sq_user', JSON.stringify(userObj));
        sessionStorage.setItem('sq_user', JSON.stringify(userObj));
      } else {
        localStorage.removeItem('sq_auth_session');
        localStorage.removeItem('sq_user');
        sessionStorage.removeItem('sq_auth_session');
        sessionStorage.removeItem('sq_user');
      }
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      localStorage.setItem('sq_products', JSON.stringify(products));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      localStorage.setItem('sq_customers', JSON.stringify(customers));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      localStorage.setItem('sq_orders', JSON.stringify(orders));
      localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(partners));
      localStorage.setItem('sq_partners', JSON.stringify(partners));
      localStorage.setItem(STORAGE_KEYS.DROPS, JSON.stringify(drops));
      localStorage.setItem('sq_drops', JSON.stringify(drops));
      localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(settlements));
      localStorage.setItem('sq_settlements', JSON.stringify(settlements));
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEYS.WA_LOGS, JSON.stringify(waLogs));
    } catch (e) {
      console.error('Error saving CRM data to storage:', e);
    }
  }, [isLoggedIn, products, customers, orders, partners, drops, settlements, templates, settings, waLogs, isLoaded]);

  // Auth Operations (Single-Tenant Exclusive Authentication)
  const login = (email: string, pass: string): boolean => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    if (cleanEmail === 'admin@shaqueenfood.com' && cleanPass === 'shaqueen123') {
      setIsLoggedIn(true);
      const userObj = {
        email: 'admin@shaqueenfood.com',
        role: 'admin',
        name: 'Admin Shaqueen'
      };
      try {
        localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
        localStorage.setItem('sq_logged_in', 'true');
        localStorage.setItem('sq_auth_session', 'true');
        localStorage.setItem('sq_user', JSON.stringify(userObj));
        sessionStorage.setItem('sq_auth_session', 'true');
        sessionStorage.setItem('sq_user', JSON.stringify(userObj));
      } catch (e) {
        console.error('Error saving auth session to storage:', e);
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'false');
      localStorage.setItem('sq_logged_in', 'false');
      localStorage.removeItem('sq_auth_session');
      localStorage.removeItem('sq_user');
      sessionStorage.removeItem('sq_auth_session');
      sessionStorage.removeItem('sq_user');
    } catch (e) {
      console.error('Error clearing auth from storage:', e);
    }
  };

  // Product operations
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const img = productData.image_url || productData.imageUrl;
    const newProduct: Product = {
      ...productData,
      imageUrl: img,
      image_url: img,
      hpp: productData.hpp !== undefined ? Number(productData.hpp) : 9000,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const img = updates.image_url !== undefined ? updates.image_url : updates.imageUrl;
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = {
        ...p,
        ...updates,
        ...(updates.hpp !== undefined ? { hpp: Number(updates.hpp) } : {}),
        ...(img !== undefined ? { imageUrl: img, image_url: img } : {}),
        updatedAt: new Date().toISOString()
      };
      if (updated.stock !== undefined && updated.stock > 0 && updated.status === 'habis') {
        updated.status = 'aktif';
      }
      return updated;
    }));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
        localStorage.setItem('sq_products', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving products after delete:', e);
      }
      return updated;
    });
  };

  const toggleProductStatus = (id: string) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, status: p.status === 'aktif' ? 'habis' : 'aktif' } : p))
    );
  };

  const adjustProductStock = (id: string, delta: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const newStock = Math.max(0, p.stock + delta);
        return {
          ...p,
          stock: newStock,
          status: newStock === 0 ? 'habis' : (p.status === 'habis' && newStock > 0 ? 'aktif' : p.status),
        };
      })
    );
  };

  // Customer operations
  const addCustomer = (customerData: Omit<RetailCustomer, 'id' | 'totalOrders' | 'totalSpent' | 'lastOrderDate' | 'tag'>) => {
    const cleanPhone = cleanPhoneNumber(customerData.phone);
    // Check if customer with same phone already exists
    const existing = customers.find(c => cleanPhoneNumber(c.phone) === cleanPhone);
    if (existing) {
      return existing;
    }

    const newCust: RetailCustomer = {
      ...customerData,
      phone: cleanPhone,
      id: `cust-${Date.now()}`,
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: new Date().toISOString().split('T')[0],
      tag: 'Pelanggan Baru'
    };
    setCustomers(prev => {
      const updated = [newCust, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updated));
        localStorage.setItem('sq_customers', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving customers after add:', e);
      }
      return updated;
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shaqueen-data-changed', {
        detail: { action: 'addCustomer', customerId: newCust.id }
      }));
    }
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<RetailCustomer>) => {
    setCustomers(prev => {
      const updated = prev.map(c => {
        if (c.id !== id) return c;
        const modified = { ...c, ...updates };
        if (updates.phone) {
          modified.phone = cleanPhoneNumber(updates.phone);
        }
        return modified;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updated));
        localStorage.setItem('sq_customers', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving customers:', e);
      }
      return updated;
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shaqueen-data-changed', {
        detail: { action: 'updateCustomer', customerId: id }
      }));
    }
  };

  const deleteCustomer = (id: string) => {
    const customerToDelete = customers.find(c => c.id === id);
    const custCleanPhone = customerToDelete ? cleanPhoneNumber(customerToDelete.phone) : '';
    const custName = customerToDelete?.name?.toLowerCase().trim();

    // 1. Remove customer from database
    setCustomers(prev => {
      const updated = prev.filter(c => c.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updated));
        localStorage.setItem('sq_customers', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving customers after delete:', e);
      }
      return updated;
    });

    // 2. Cascade Delete: automatically remove all cards/tickets in Pipeline WA belonging to this customer
    setOrders(prevOrders => {
      const remainingOrders = prevOrders.filter(o => {
        const orderPhoneClean = cleanPhoneNumber(o.customerPhone || (o as any).phone);
        const orderName = (o.customerName || (o as any).name || '').toLowerCase().trim();
        const isAssociated = (o.customerId && o.customerId === id) ||
          (custCleanPhone && orderPhoneClean && orderPhoneClean === custCleanPhone) ||
          (custName && orderName && orderName === custName);
        return !isAssociated;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(remainingOrders));
        localStorage.setItem('sq_orders', JSON.stringify(remainingOrders));
      } catch (e) {
        console.error('Error saving orders after customer cascade delete:', e);
      }
      return remainingOrders;
    });

    // 3. Cascade Delete: remove associated WhatsApp logs
    setWaLogs(prevLogs => {
      const remainingLogs = prevLogs.filter(log => {
        const logPhoneClean = cleanPhoneNumber(log.customerPhone || (log as any).phone);
        const logName = (log.customerName || (log as any).name || '').toLowerCase().trim();
        const isAssociated = (custCleanPhone && logPhoneClean && logPhoneClean === custCleanPhone) ||
          (custName && logName && logName === custName);
        return !isAssociated;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.WA_LOGS, JSON.stringify(remainingLogs));
        localStorage.setItem('sq_wa_logs', JSON.stringify(remainingLogs));
      } catch (e) {}
      return remainingLogs;
    });

    // 4. Auto-Refresh Global Event for instant reactive UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shaqueen-data-changed', {
        detail: { action: 'deleteCustomer', customerId: id }
      }));
    }
  };

  // B2C & B2B Order operations
  const addB2COrder = (data: {
    customerId?: string;
    newCustomer?: { name: string; phone: string; platform: OrderPlatform; city?: string; address?: string };
    productId?: string;
    quantity?: number;
    platform: OrderPlatform;
    trackingNumber?: string;
    notes?: string;
    orderType?: 'b2c' | 'b2b';
    quantityInPcs?: number;
    customUnitPrice?: number;
    customTotalAmount?: number;
    items?: Array<{
      productId: string;
      productName?: string;
      quantity: number;
      orderType?: 'b2c' | 'b2b';
      b2bUnit?: string;
      b2bConversion?: number;
      quantityInPcs?: number;
      unitPrice?: number;
      subtotal?: number;
    }>;
  }) => {
    const today = new Date().toISOString().split('T')[0];
    const orderType = data.orderType || 'b2c';
    const isB2B = orderType === 'b2b';

    // 1. Process Order Items (Support Multi-Product Cart & Single-Product Fallback)
    let processedItems: Array<{
      productId: string;
      productName: string;
      quantity: number;
      orderType: 'b2c' | 'b2b';
      b2bUnit?: string;
      b2bConversion?: number;
      quantityInPcs: number;
      unitPrice: number;
      hpp: number;
      grossProfit: number;
      subtotal: number;
    }> = [];

    if (data.items && data.items.length > 0) {
      processedItems = data.items.map(item => {
        const prod = products.find(p => p.id === item.productId) || products[0];
        const itemOrderType = item.orderType || orderType;
        const itemIsB2B = itemOrderType === 'b2b';
        const itemConv = prod?.b2bConversion || 12;
        const itemUnit = prod?.b2bUnit || 'Karton';
        const itemQty = Math.max(1, Number(item.quantity) || 1);
        const itemPcs = item.quantityInPcs !== undefined 
          ? item.quantityInPcs 
          : (itemIsB2B ? itemQty * itemConv : itemQty);
        const itemUnitPrice = item.unitPrice !== undefined 
          ? item.unitPrice 
          : (itemIsB2B ? (prod?.b2bPrice || 0) : (prod?.b2cPrice || 0));
        const itemSubtotal = item.subtotal !== undefined
          ? item.subtotal
          : (itemIsB2B ? itemPcs * itemUnitPrice : itemQty * itemUnitPrice);
        const itemHpp = (item as any).hpp !== undefined ? Number((item as any).hpp) : (prod?.hpp || 0);
        const itemGrossProfit = (itemUnitPrice - itemHpp) * itemPcs;

        return {
          productId: prod ? prod.id : item.productId,
          productName: prod ? prod.name : (item.productName || 'Produk'),
          quantity: itemQty,
          orderType: itemOrderType,
          b2bUnit: itemIsB2B ? itemUnit : undefined,
          b2bConversion: itemIsB2B ? itemConv : undefined,
          quantityInPcs: itemPcs,
          unitPrice: itemUnitPrice,
          hpp: itemHpp,
          grossProfit: itemGrossProfit,
          subtotal: itemSubtotal,
        };
      });
    } else {
      const prod = products.find(p => p.id === data.productId) || products[0];
      const prodConv = prod?.b2bConversion || 12;
      const prodUnit = prod?.b2bUnit || 'Karton';
      const prodQty = Math.max(1, Number(data.quantity) || 1);
      const prodPcs = data.quantityInPcs !== undefined 
        ? data.quantityInPcs 
        : (isB2B ? prodQty * prodConv : prodQty);
      const prodUnitPrice = data.customUnitPrice !== undefined 
        ? data.customUnitPrice 
        : (isB2B ? (prod?.b2bPrice || 0) : (prod?.b2cPrice || 0));
      const prodSubtotal = data.customTotalAmount !== undefined 
        ? data.customTotalAmount 
        : (isB2B ? prodPcs * (prod?.b2bPrice || 0) : prodQty * (prod?.b2cPrice || 0));
      const prodHpp = prod?.hpp || 0;
      const prodGrossProfit = (prodUnitPrice - prodHpp) * prodPcs;

      processedItems = [{
        productId: prod ? prod.id : (data.productId || ''),
        productName: prod ? prod.name : 'Produk',
        quantity: prodQty,
        orderType,
        b2bUnit: isB2B ? prodUnit : undefined,
        b2bConversion: isB2B ? prodConv : undefined,
        quantityInPcs: prodPcs,
        unitPrice: prodUnitPrice,
        hpp: prodHpp,
        grossProfit: prodGrossProfit,
        subtotal: prodSubtotal,
      }];
    }

    const totalAmount = data.customTotalAmount !== undefined && !data.items
      ? data.customTotalAmount 
      : processedItems.reduce((sum, it) => sum + it.subtotal, 0);
    const totalOrderProfit = processedItems.reduce((sum, it) => sum + (it.grossProfit || 0), 0);
    const totalQuantity = processedItems.reduce((sum, it) => sum + it.quantity, 0);
    const totalQuantityInPcs = processedItems.reduce((sum, it) => sum + it.quantityInPcs, 0);
    const primaryItem = processedItems[0];
    const summaryProductName = processedItems.length === 1 
      ? primaryItem.productName 
      : processedItems.map(it => `${it.productName} (${it.quantity}x)`).join(', ');

    const orderNum = `SQ-ORD-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    // 2. Sinkronisasi Pelanggan & Logika Repeat Order (Upsert)
    let checkPhone = '';
    let checkName = '';
    let checkPlatform: OrderPlatform = data.platform || 'WhatsApp';
    let checkCity = 'Bandung';
    let checkAddress = '-';

    if (data.newCustomer) {
      checkPhone = cleanPhoneNumber(data.newCustomer.phone);
      checkName = data.newCustomer.name.trim();
      checkPlatform = data.newCustomer.platform || data.platform || 'WhatsApp';
      checkCity = data.newCustomer.city?.trim() || 'Bandung';
      checkAddress = data.newCustomer.address?.trim() || '-';
    } else if (data.customerId) {
      const foundCust = customers.find(c => c.id === data.customerId);
      if (foundCust) {
        checkPhone = cleanPhoneNumber(foundCust.phone);
        checkName = foundCust.name;
        checkPlatform = foundCust.platform;
        checkCity = foundCust.city;
        checkAddress = foundCust.address;
      }
    }

    let targetCustomer: RetailCustomer;
    const existingCustIndex = checkPhone 
      ? customers.findIndex(c => cleanPhoneNumber(c.phone) === checkPhone || (data.customerId && c.id === data.customerId))
      : (data.customerId ? customers.findIndex(c => c.id === data.customerId) : -1);

    let updatedCustomers = [...customers];

    if (existingCustIndex !== -1) {
      // Repeat Order (WhatsApp number already exists): UPDATE (+1 Total Order, Accumulate LTV)
      const existingCust = updatedCustomers[existingCustIndex];
      const newTotalOrders = (existingCust.totalOrders || 0) + 1; // multi-product counted as 1x order
      const newTotalSpent = (existingCust.totalSpent || 0) + totalAmount;
      let newTag: CustomerTag = existingCust.tag || 'Pelanggan Baru';
      if (newTotalOrders >= 3) {
        newTag = 'Pelanggan Loyal';
      } else if (newTag === 'At-Risk (Jarang Beli)') {
        newTag = 'Pelanggan Baru';
      }

      const updatedCust: RetailCustomer = {
        ...existingCust,
        name: checkName || existingCust.name,
        platform: checkPlatform || existingCust.platform,
        city: (checkCity && checkCity !== 'Bandung') ? checkCity : existingCust.city,
        address: (checkAddress && checkAddress !== '-') ? checkAddress : existingCust.address,
        totalOrders: newTotalOrders,
        totalSpent: newTotalSpent,
        lastOrderDate: today,
        tag: newTag,
      };

      updatedCustomers[existingCustIndex] = updatedCust;
      targetCustomer = updatedCust;
    } else {
      // New Customer: INSERT (1x Total Order, Initial LTV = Bill Amount)
      const newCust: RetailCustomer = {
        id: `cust-${Date.now()}`,
        name: checkName || 'Pelanggan Umum',
        phone: checkPhone || '628120000000',
        platform: checkPlatform,
        city: checkCity,
        address: checkAddress,
        totalOrders: 1,
        totalSpent: totalAmount,
        lastOrderDate: today,
        tag: 'Pelanggan Baru',
      };

      updatedCustomers = [newCust, ...updatedCustomers];
      targetCustomer = newCust;
    }

    // Refresh state and persist immediately to dual-key LocalStorage
    setCustomers(updatedCustomers);
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updatedCustomers));
      localStorage.setItem('sq_customers', JSON.stringify(updatedCustomers));
    } catch (e) {}

    // 3. Potong Stok Fisik Masing-masing Produk di Master Produk Secara Akurat
    const deductionsByProduct: Record<string, number> = {};
    for (const it of processedItems) {
      deductionsByProduct[it.productId] = (deductionsByProduct[it.productId] || 0) + it.quantityInPcs;
    }

    setProducts(prev => {
      const updatedProds = prev.map(p => {
        const deduction = deductionsByProduct[p.id];
        if (!deduction) return p;
        const newStock = Math.max(0, p.stock - deduction);
        return {
          ...p,
          stock: newStock,
          status: newStock <= 0 ? 'habis' : (p.status === 'habis' && newStock > 0 ? 'aktif' : p.status),
          updatedAt: new Date().toISOString()
        };
      });
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProds));
        localStorage.setItem('sq_products', JSON.stringify(updatedProds));
      } catch (e) {}
      return updatedProds;
    });

    // 4. Catat Transaksi Pesanan B2C / B2B
    const newOrder: B2COrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      customerId: targetCustomer.id,
      customerName: targetCustomer.name,
      customerPhone: targetCustomer.phone,
      productId: primaryItem.productId,
      productName: summaryProductName,
      quantity: totalQuantity,
      orderType: orderType,
      b2bUnit: isB2B ? primaryItem.b2bUnit : undefined,
      b2bConversion: isB2B ? primaryItem.b2bConversion : undefined,
      quantityInPcs: totalQuantityInPcs,
      unitPrice: primaryItem.unitPrice,
      hpp: primaryItem.hpp,
      grossProfit: totalOrderProfit,
      totalAmount,
      platform: data.platform || targetCustomer.platform,
      status: 'diproses',
      pipelineStage: 'diproses',
      trackingNumber: data.trackingNumber || '',
      notes: data.notes || '',
      orderDate: today,
      daysPassed: 0,
      items: processedItems,
      ...({
        stage: 'diproses',
        phone: targetCustomer.phone,
        total: totalAmount,
        resi: data.trackingNumber || ''
      } as any)
    };

    setOrders(prev => {
      const updatedOrders = [newOrder, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));
        localStorage.setItem('sq_orders', JSON.stringify(updatedOrders));
      } catch (e) {}
      return updatedOrders;
    });

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)));
  };

  const updatePipelineStage = (orderId: string, stage: PipelineStage) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        let newStatus = o.status;
        if (stage === 'diproses') newStatus = 'diproses';
        if (stage === 'dikirim' || stage === 'h_plus_2') newStatus = 'dikirim';
        if (stage === 'h_plus_30') newStatus = 'selesai';
        return { ...o, pipelineStage: stage, stage: stage, status: newStatus };
      })
    );
  };

  const deleteOrder = (orderId: string) => {
    const orderToDelete = orders.find(o => o.id === orderId);
    if (!orderToDelete) return;

    // 1. Revert Stock in Master Produk (Multi-Item Cart or Single Product)
    const itemsToRestore: Array<{ productId?: string; productName?: string; pcs: number }> = [];
    if (orderToDelete.items && orderToDelete.items.length > 0) {
      for (const item of orderToDelete.items) {
        const itemPcs = item.quantityInPcs !== undefined 
          ? item.quantityInPcs 
          : (item.orderType === 'b2b' ? item.quantity * (item.b2bConversion || 12) : item.quantity);
        itemsToRestore.push({
          productId: item.productId,
          productName: item.productName,
          pcs: itemPcs
        });
      }
    } else {
      const pcs = orderToDelete.quantityInPcs !== undefined
        ? orderToDelete.quantityInPcs
        : (orderToDelete.orderType === 'b2b' ? orderToDelete.quantity * (orderToDelete.b2bConversion || 12) : orderToDelete.quantity);
      itemsToRestore.push({
        productId: orderToDelete.productId,
        productName: orderToDelete.productName,
        pcs: pcs
      });
    }

    setProducts(prev => {
      const updated = prev.map(p => {
        const matchingItems = itemsToRestore.filter(it => {
          if (it.productId && p.id && it.productId === p.id) return true;
          if (it.productName && p.name) {
            const n1 = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const n2 = it.productName.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (n1 === n2 || n1.includes(n2) || n2.includes(n1)) return true;
          }
          return false;
        });
        const restoreQty = matchingItems.reduce((sum, it) => sum + it.pcs, 0);
        if (!restoreQty) return p;
        const newStock = p.stock + restoreQty;
        return {
          ...p,
          stock: newStock,
          status: newStock > 0 && p.status === 'habis' ? 'aktif' : p.status,
          updatedAt: new Date().toISOString()
        };
      });
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
        localStorage.setItem('sq_products', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 2. Revert Customer Metrics (Total Orders -1, Total Spent / LTV - order.totalAmount)
    const cleanedOrderPhone = cleanPhoneNumber(orderToDelete.customerPhone || (orderToDelete as any).phone);
    const orderAmount = orderToDelete.totalAmount || (orderToDelete as any).total || 0;
    setCustomers(prev => {
      const updated = prev.map(c => {
        const matches = (orderToDelete.customerId && c.id === orderToDelete.customerId) ||
          (cleanedOrderPhone && cleanPhoneNumber(c.phone) === cleanedOrderPhone) ||
          (orderToDelete.customerName && c.name && c.name.toLowerCase() === orderToDelete.customerName.toLowerCase());
        if (!matches) return c;

        const custOrders = orders.filter(o => 
          (c.id && o.customerId === c.id) ||
          (cleanedOrderPhone && cleanPhoneNumber(o.customerPhone || (o as any).phone) === cleanedOrderPhone) ||
          (c.name && o.customerName && c.name.toLowerCase() === o.customerName.toLowerCase())
        );
        const txOrderCount = custOrders.length;
        const txTotalSpent = custOrders.reduce((sum, o) => sum + (o.totalAmount || (o as any).total || 0), 0);

        const currentOrders = c.totalOrders !== undefined ? c.totalOrders : txOrderCount;
        const currentSpent = c.totalSpent !== undefined ? c.totalSpent : txTotalSpent;
        const newTotalOrders = Math.max(0, currentOrders - 1);
        const newTotalSpent = Math.max(0, currentSpent - orderAmount);

        let newTag = c.tag;
        if (newTotalOrders < 3 && (c.tag === 'Pelanggan Loyal' || c.tag === 'Loyal')) {
          newTag = 'Pelanggan Baru';
        }
        return {
          ...c,
          totalOrders: newTotalOrders,
          totalSpent: newTotalSpent,
          tag: newTag
        };
      });
      try {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updated));
        localStorage.setItem('sq_customers', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 3. Remove Order from orders
    setOrders(prev => {
      const updated = prev.filter(o => o.id !== orderId);
      try {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
        localStorage.setItem('sq_orders', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 4. Cascade Delete: Remove associated WhatsApp logs
    setWaLogs(prev => {
      const updated = prev.filter(l => l.orderId !== orderId);
      try {
        localStorage.setItem(STORAGE_KEYS.WA_LOGS, JSON.stringify(updated));
        localStorage.setItem('sq_wa_logs', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 5. Auto-Refresh Global Event for instant reactive UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shaqueen-data-changed', {
        detail: { action: 'deleteOrder', orderId }
      }));
    }
  };

  // B2B Partner operations
  const addPartner = (partnerData: Omit<B2BPartner, 'id' | 'totalSettledAmount' | 'totalPurchasedCartons'>) => {
    const newPartner: B2BPartner = {
      ...partnerData,
      phone: cleanPhoneNumber(partnerData.phone),
      id: `partner-${Date.now()}`,
      totalPurchasedCartons: 0,
      totalSettledAmount: 0,
    };
    setPartners(prev => {
      const updated = [newPartner, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(updated));
        localStorage.setItem('sq_partners', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shaqueen-data-changed', {
        detail: { action: 'addPartner', partnerId: newPartner.id }
      }));
    }
  };

  const updatePartner = (id: string, updates: Partial<B2BPartner>) => {
    const cleanPhone = updates.phone ? cleanPhoneNumber(updates.phone) : undefined;
    const partnerToUpdate = partners.find(p => p.id === id);
    const oldStoreName = partnerToUpdate?.storeName?.toLowerCase().trim();
    const oldPhone = partnerToUpdate ? cleanPhoneNumber(partnerToUpdate.phone) : '';

    setPartners(prev => {
      const updated = prev.map(p => {
        if (p.id !== id) return p;
        const modified = { ...p, ...updates };
        if (cleanPhone) {
          modified.phone = cleanPhone;
        }
        return modified;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(updated));
        localStorage.setItem('sq_partners', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (updates.storeName || cleanPhone) {
      setSettlements(prev => {
        const updated = prev.map(s => {
          const isMatch = s.partnerId === id ||
            (oldStoreName && s.partnerName && s.partnerName.toLowerCase().trim() === oldStoreName) ||
            (oldPhone && s.partnerPhone && cleanPhoneNumber(s.partnerPhone) === oldPhone) ||
            (oldPhone && s.phone && cleanPhoneNumber(s.phone) === oldPhone);
          if (isMatch) {
            return {
              ...s,
              partnerId: id,
              partnerName: updates.storeName || s.partnerName,
              partnerPhone: cleanPhone || s.partnerPhone,
              phone: cleanPhone || s.phone
            };
          }
          return s;
        });
        try {
          localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(updated));
          localStorage.setItem('sq_settlements', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shaqueen-data-changed', {
        detail: { action: 'updatePartner', partnerId: id, id: id }
      }));
    }
  };

  const deletePartner = (id: string) => {
    const partnerToDelete = partners.find(p => p.id === id);
    const partnerName = partnerToDelete?.storeName?.toLowerCase().trim();
    const partnerPhone = partnerToDelete ? cleanPhoneNumber(partnerToDelete.phone) : '';

    // a. Hapus data toko mitra dari partners
    setPartners(prev => {
      const updated = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(updated));
        localStorage.setItem('sq_partners', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Record matching settlement IDs for comprehensive cascade
    const deletedSettlementIds = new Set(
      settlements
        .filter(s => s.partnerId === id ||
          (partnerName && s.partnerName && s.partnerName.toLowerCase().trim() === partnerName) ||
          (partnerPhone && s.partnerPhone && cleanPhoneNumber(s.partnerPhone) === partnerPhone) ||
          (partnerPhone && s.phone && cleanPhoneNumber(s.phone) === partnerPhone))
        .map(s => s.id)
    );

    // b. Hapus seluruh riwayat transaksi grosir toko tersebut dari settlements
    // c. Hapus tiket follow-up toko tersebut di halaman Pipeline Restock B2B tanpa sisa
    setSettlements(prev => {
      const updated = prev.filter(s => {
        const isMatch = s.partnerId === id ||
          (partnerName && s.partnerName && s.partnerName.toLowerCase().trim() === partnerName) ||
          (partnerPhone && s.partnerPhone && cleanPhoneNumber(s.partnerPhone) === partnerPhone) ||
          (partnerPhone && s.phone && cleanPhoneNumber(s.phone) === partnerPhone);
        return !isMatch;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(updated));
        localStorage.setItem('sq_settlements', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Cascade remove drops
    setDrops(prev => {
      const updated = prev.filter(d => d.partnerId !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.DROPS, JSON.stringify(updated));
        localStorage.setItem('sq_drops', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Cascade remove associated WA logs
    setWaLogs(prev => {
      const updated = prev.filter(l => {
        if (l.orderId && deletedSettlementIds.has(l.orderId)) return false;
        const lPhone = cleanPhoneNumber(l.customerPhone || (l as any).phone || '');
        const lName = (l.customerName || (l as any).name || '').toLowerCase().trim();
        const isMatch = (partnerPhone && lPhone === partnerPhone) || (partnerName && lName === partnerName);
        return !isMatch;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.WA_LOGS, JSON.stringify(updated));
        localStorage.setItem('sq_wa_logs', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // d. Picu event auto-refresh global shaqueen-data-changed
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shaqueen-data-changed', {
        detail: { action: 'deletePartner', partnerId: id, id: id }
      }));
    }
  };

  // B2B Drop operations (Legacy / internal stock movements)
  const addDrop = (data: {
    partnerId: string;
    productId: string;
    quantityDropped: number; // Dalam satuan B2B (misal: Karton)
    dropDate: string;
    batchCode?: string;
    notes?: string;
  }) => {
    const partner = partners.find(p => p.id === data.partnerId);
    const product = products.find(p => p.id === data.productId);
    if (!partner || !product) return;

    const b2bUnit = product.b2bUnit || 'Karton';
    const b2bConversion = product.b2bConversion || 12;
    const quantityInPcs = data.quantityDropped * b2bConversion;
    const b2bUnitPrice = product.b2bPrice;
    const totalEstimatedValue = b2bUnitPrice * quantityInPcs;

    const newDrop: B2BDrop = {
      id: `drop-${Date.now()}`,
      partnerId: partner.id,
      partnerName: partner.storeName,
      productId: product.id,
      productName: product.name,
      dropDate: data.dropDate || new Date().toISOString().split('T')[0],
      quantityDropped: data.quantityDropped,
      quantityInPcs,
      b2bUnit,
      b2bConversion,
      b2bUnitPrice,
      totalEstimatedValue,
      batchCode: data.batchCode || `BATCH-${Date.now().toString().slice(-6)}`,
      status: 'active',
      notes: data.notes || '',
    };

    setDrops(prev => [newDrop, ...prev]);

    // Reduce physical inventory stock (Pcs) otomatis
    adjustProductStock(product.id, -quantityInPcs);
  };

  const deleteDrop = (dropId: string) => {
    const drop = drops.find(d => d.id === dropId);
    if (!drop) return;

    const product = products.find(p => p.id === drop.productId);
    const conversion = drop.b2bConversion || (product ? product.b2bConversion : 12) || 12;
    const restorePcs = drop.quantityInPcs || ((drop.quantityDropped || 0) * conversion);

    // Restore inventory stock in Pcs
    if (drop.productId) {
      adjustProductStock(drop.productId, restorePcs);
    }

    setDrops(prev => prev.filter(d => d.id !== dropId));
  };

  // B2B Wholesale Transaction operations (Beli Putus / Cash & Carry)
  const addSettlement = (data: {
    dropId?: string;
    partnerId: string;
    productId: string;
    settlementDate?: string;
    quantitySold: number; // Dalam satuan B2B (misal: Karton)
    paymentStatus?: 'lunas' | 'pending' | 'transfer';
    notes?: string;
    customTotalAmount?: number;
    items?: Array<{
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
    }>;
  }) => {
    const partner = partners.find(p => p.id === data.partnerId);
    const product = products.find(p => p.id === data.productId) || products[0];
    if (!partner) return;

    const hasMultiItems = data.items && Array.isArray(data.items) && data.items.length > 0;
    const b2bUnit = product?.b2bUnit || 'Karton';
    const b2bConversion = product?.b2bConversion || 12;

    let totalSoldCartons = data.quantitySold;
    let totalSoldPcs = 0;
    let totalCollectedAmount = 0;
    let totalGrossProfit = 0;

    if (hasMultiItems) {
      totalSoldCartons = data.items!.reduce((sum, it) => sum + (it.quantity || 1), 0);
      totalSoldPcs = data.items!.reduce((sum, it) => {
        const conv = it.b2bConversion || 12;
        return sum + (it.quantityInPcs || (it.quantity * conv));
      }, 0);
      totalCollectedAmount = data.customTotalAmount !== undefined
        ? data.customTotalAmount
        : data.items!.reduce((sum, it) => sum + (it.subtotal || 0), 0);
      totalGrossProfit = data.items!.reduce((sum, it) => sum + (it.grossProfit || 0), 0);
    } else {
      totalSoldPcs = data.quantitySold * b2bConversion;
      const b2bUnitPrice = product?.b2bPrice || 13000;
      totalCollectedAmount = data.customTotalAmount !== undefined 
        ? data.customTotalAmount 
        : totalSoldPcs * b2bUnitPrice;
      const hpp = product?.hpp !== undefined ? product.hpp : 0;
      totalGrossProfit = (b2bUnitPrice - hpp) * totalSoldPcs;
    }

    const summaryProductName = hasMultiItems
      ? (data.items!.length === 1 ? (data.items![0].productName || product?.name || 'Produk Shaqueen') : `${data.items![0].productName || product?.name || 'Produk'} + ${data.items!.length - 1} varian lainnya`)
      : (product?.name || 'Produk Shaqueen');

    const newSettlement: B2BSettlement = {
      id: `stl-${Date.now()}`,
      partnerId: partner.id,
      partnerName: partner.storeName,
      partnerPhone: partner.phone,
      phone: partner.phone,
      productId: product?.id || data.productId,
      productName: summaryProductName,
      settlementDate: data.settlementDate || new Date().toISOString().split('T')[0],
      quantitySold: totalSoldCartons,
      quantitySoldPcs: totalSoldPcs,
      b2bUnit,
      b2bConversion,
      b2bUnitPrice: (product?.b2bPrice || 13000) * b2bConversion,
      hpp: product?.hpp || 0,
      grossProfit: totalGrossProfit,
      totalCollectedAmount,
      totalCollected: totalCollectedAmount,
      paymentStatus: data.paymentStatus || 'lunas',
      notes: data.notes || '',
      items: hasMultiItems ? data.items : undefined,
      pipelineStage: 'barang_baru_turun',
      stage: 'barang_baru_turun',
    };

    setSettlements(prev => {
      const updated = [newSettlement, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(updated));
        localStorage.setItem('sq_settlements', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shaqueen-data-changed', {
        detail: { action: 'addSettlement', id: newSettlement.id }
      }));
    }

    // Update partner statistics (total purchased cartons & total amount)
    setPartners(prev =>
      prev.map(p => {
        if (p.id !== partner.id) return p;
        return {
          ...p,
          totalPurchasedCartons: (p.totalPurchasedCartons || 0) + totalSoldCartons,
          totalSettledAmount: (p.totalSettledAmount || 0) + totalCollectedAmount,
        };
      })
    );

    // Reduce physical inventory stock (Pcs) otomatis
    if (hasMultiItems) {
      for (const it of data.items!) {
        const itConv = it.b2bConversion || 12;
        const itPcs = it.quantityInPcs || (it.quantity * itConv);
        adjustProductStock(it.productId, -itPcs);
      }
    } else if (product) {
      adjustProductStock(product.id, -totalSoldPcs);
    }
  };

  const deleteSettlement = (settlementId: string) => {
    const stl = settlements.find(s => s.id === settlementId);
    if (!stl) return;

    const totalCartons = stl.quantitySold || (stl as any).qty || 1;
    const amountToRevert = stl.totalCollectedAmount || (stl as any).totalCollected || 0;

    // 1. Revert partner stats (totalPurchasedCartons & totalSettledAmount)
    setPartners(prev => {
      const updated = prev.map(p => {
        const matches = (stl.partnerId && p.id === stl.partnerId) || 
          (stl.partnerName && p.storeName && (
            p.storeName.toLowerCase() === stl.partnerName.toLowerCase() ||
            p.storeName.toLowerCase().replace(/[^a-z0-9]/g, '').includes(stl.partnerName.toLowerCase().replace(/[^a-z0-9]/g, ''))
          ));
        if (!matches) return p;

        const partnerTx = settlements.filter(s => s.partnerId === p.id || (stl.partnerName && s.partnerName?.toLowerCase() === stl.partnerName.toLowerCase()));
        const txCartons = partnerTx.reduce((sum, s) => sum + (s.quantitySold || (s as any).qty || 0), 0);
        const txRevenue = partnerTx.reduce((sum, s) => sum + (s.totalCollectedAmount || (s as any).totalCollected || 0), 0);
        const currentCartons = p.totalPurchasedCartons !== undefined ? p.totalPurchasedCartons : txCartons;
        const currentRevenue = p.totalSettledAmount !== undefined ? p.totalSettledAmount : txRevenue;

        return {
          ...p,
          totalPurchasedCartons: Math.max(0, currentCartons - totalCartons),
          totalSettledAmount: Math.max(0, currentRevenue - amountToRevert),
        };
      });
      try {
        localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(updated));
        localStorage.setItem('sq_partners', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 2. Restore stock to inventory
    const itemsToRestore: Array<{ productId?: string; productName?: string; pcs: number }> = [];
    if (stl.items && stl.items.length > 0) {
      for (const item of stl.items) {
        const itemPcs = item.quantityInPcs !== undefined 
          ? item.quantityInPcs 
          : item.quantity * (item.b2bConversion || 12);
        itemsToRestore.push({
          productId: item.productId,
          productName: item.productName,
          pcs: itemPcs
        });
      }
    } else {
      const isProductMatch = (p: Product) => {
        if (stl.productId && p.id === stl.productId) return true;
        if (stl.productName && p.name) {
          const sName = stl.productName.toLowerCase().replace(/[^a-z0-9]/g, '');
          const pName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (sName === pName || sName.includes(pName) || pName.includes(sName)) return true;
        }
        return false;
      };
      const matchedProduct = products.find(isProductMatch);
      const conversion = stl.b2bConversion || (stl as any).conversion || matchedProduct?.b2bConversion || 12;
      const restorePcs = stl.quantitySoldPcs || (stl as any).qtyPcs || (totalCartons * conversion);
      itemsToRestore.push({
        productId: stl.productId,
        productName: stl.productName,
        pcs: restorePcs
      });
    }

    setProducts(prev => {
      const updated = prev.map(p => {
        const matchingItems = itemsToRestore.filter(it => {
          if (it.productId && p.id && it.productId === p.id) return true;
          if (it.productName && p.name) {
            const n1 = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const n2 = it.productName.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (n1 === n2 || n1.includes(n2) || n2.includes(n1)) return true;
          }
          return false;
        });
        const restoreQty = matchingItems.reduce((sum, it) => sum + it.pcs, 0);
        if (!restoreQty) return p;
        const newStock = p.stock + restoreQty;
        return {
          ...p,
          stock: newStock,
          status: newStock > 0 && p.status === 'habis' ? 'aktif' : p.status,
          updatedAt: new Date().toISOString()
        };
      });
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
        localStorage.setItem('sq_products', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 3. Remove settlement from settlements
    setSettlements(prev => {
      const updated = prev.filter(s => s.id !== settlementId);
      try {
        localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(updated));
        localStorage.setItem('sq_settlements', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 4. Cascade Delete: Remove associated WhatsApp logs
    setWaLogs(prev => {
      const updated = prev.filter(l => l.orderId !== settlementId);
      try {
        localStorage.setItem(STORAGE_KEYS.WA_LOGS, JSON.stringify(updated));
        localStorage.setItem('sq_wa_logs', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shaqueen-data-changed', {
        detail: { action: 'deleteSettlement', settlementId }
      }));
    }
  };

  const updateB2BPipelineStage = (settlementId: string, stage: B2BPipelineStage) => {
    setSettlements(prev => {
      const updated = prev.map(s => {
        if (s.id !== settlementId) return s;
        return {
          ...s,
          pipelineStage: stage,
          stage: stage,
        };
      });
      try {
        localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(updated));
        localStorage.setItem('sq_settlements', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shaqueen-data-changed', {
        detail: { action: 'updateB2BPipelineStage', settlementId, stage }
      }));
    }
  };

  // WhatsApp Operations
  const updateTemplate = (id: string, templateText: string, isActive?: boolean) => {
    setTemplates(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              templateText,
              isActive: isActive !== undefined ? isActive : t.isActive,
            }
          : t
      )
    );
  };

  const triggerWhatsAppMessage = (params: {
    customerName: string;
    customerPhone: string;
    orderId?: string;
    stage: string;
    messageText: string;
    mode?: 'direct' | 'simulation';
  }) => {
    const formattedPhone = cleanPhoneNumber(params.customerPhone);
    const directUrl = createDirectWALink(formattedPhone, params.messageText);

    const logEntry: WALog = {
      id: `log-${Date.now()}`,
      customerName: params.customerName,
      customerPhone: formattedPhone,
      orderId: params.orderId,
      stage: params.stage,
      messageText: params.messageText,
      sentAt: new Date().toLocaleString('id-ID'),
      status: params.mode === 'direct' ? 'sent' : 'simulated',
    };

    setWaLogs(prev => [logEntry, ...prev]);

    return {
      directUrl,
      success: true,
    };
  };

  const clearWALogs = () => {
    setWaLogs([]);
    localStorage.removeItem(STORAGE_KEYS.WA_LOGS);
  };

  // Settings & Storage
  const updateSettings = (updates: Partial<CRMSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    if (updates.supabaseUrl && updates.supabaseAnonKey) {
      setSupabaseStatus('connected');
    }
  };

  const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
    setSupabaseStatus('checking');
    if (!settings.supabaseUrl || !settings.supabaseAnonKey) {
      setSupabaseStatus('offline');
      return {
        success: false,
        message: 'Kredensial Supabase Project URL dan Anon Key belum diisi.',
      };
    }

    try {
      const client = getSupabaseClient(settings.supabaseUrl, settings.supabaseAnonKey);
      if (!client) {
        setSupabaseStatus('offline');
        return { success: false, message: 'Gagal menginisialisasi client Supabase.' };
      }

      // Test query
      const { error } = await client.from('products').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') {
        // Table might need schema migration, but connection to Supabase was successful
        setSupabaseStatus('connected');
        return {
          success: true,
          message: `Koneksi ke Supabase berhasil! Pastikan skrip schema.sql sudah dijalankan di Supabase SQL Editor (${error.message}).`,
        };
      }

      setSupabaseStatus('connected');
      return {
        success: true,
        message: 'Koneksi ke Supabase PostgreSQL berhasil dan tabel terverifikasi aktif!',
      };
    } catch (e: any) {
      setSupabaseStatus('offline');
      return {
        success: false,
        message: `Koneksi gagal: ${e?.message || 'Periksa URL dan Anon Key Anda.'}`,
      };
    }
  };

  const exportDataJSON = () => {
    return JSON.stringify(
      {
        products,
        customers,
        orders,
        partners,
        drops,
        settlements,
        templates,
        settings,
        waLogs,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.products && Array.isArray(data.products)) setProducts(data.products);
      if (data.customers && Array.isArray(data.customers)) setCustomers(data.customers);
      if (data.orders && Array.isArray(data.orders)) setOrders(data.orders);
      if (data.partners && Array.isArray(data.partners)) setPartners(data.partners);
      if (data.drops && Array.isArray(data.drops)) setDrops(data.drops);
      if (data.settlements && Array.isArray(data.settlements)) setSettlements(data.settlements);
      if (data.templates && Array.isArray(data.templates)) setTemplates(data.templates);
      if (data.settings) setSettings(data.settings);
      if (data.waLogs && Array.isArray(data.waLogs)) setWaLogs(data.waLogs);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  const resetToDefaultData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setOrders(INITIAL_ORDERS);
    setPartners(INITIAL_PARTNERS);
    setDrops(INITIAL_DROPS);
    setSettlements(INITIAL_SETTLEMENTS);
    setTemplates(INITIAL_TEMPLATES);
    setSettings(INITIAL_SETTINGS);
    setWaLogs(INITIAL_WA_LOGS);
    localStorage.clear();
    setIsLoggedIn(true);
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    localStorage.setItem('sq_logged_in', 'true');
    const userObj = { email: 'admin@shaqueenfood.com', role: 'admin', name: 'Admin Shaqueen' };
    localStorage.setItem('sq_auth_session', 'true');
    localStorage.setItem('sq_user', JSON.stringify(userObj));
    sessionStorage.setItem('sq_auth_session', 'true');
    sessionStorage.setItem('sq_user', JSON.stringify(userObj));
  };

  // Computed metrics
  const totalB2COmzet = orders.reduce((sum, o) => sum + (o.totalAmount || (o as any).total || 0), 0);
  const totalB2BOmzet = settlements.reduce((sum, s) => sum + (s.totalCollectedAmount || (s as any).totalCollected || 0), 0);
  const totalOmzet = totalB2COmzet + totalB2BOmzet;

  const calculateOrderProfit = (o: B2COrder): number => {
    if (o.grossProfit !== undefined) return o.grossProfit;
    if (o.items && o.items.length > 0) {
      return o.items.reduce((sum, it) => {
        const itemPcs = it.quantityInPcs !== undefined ? it.quantityInPcs : it.quantity;
        const prod = products.find(p => p.id === it.productId);
        const itemHpp = it.hpp !== undefined ? it.hpp : (prod?.hpp || 0);
        const itemPrice = it.unitPrice !== undefined ? it.unitPrice : (prod?.b2cPrice || 0);
        return sum + ((itemPrice - itemHpp) * itemPcs);
      }, 0);
    }
    const prod = products.find(p => p.id === o.productId || (o.productName && p.name && p.name.toLowerCase() === o.productName.toLowerCase()));
    const hpp = o.hpp !== undefined ? o.hpp : (prod?.hpp || 0);
    const pcs = o.quantityInPcs !== undefined ? o.quantityInPcs : o.quantity;
    const price = o.unitPrice !== undefined ? o.unitPrice : (((o.totalAmount || (o as any).total || 0)) / (pcs || 1));
    return (price - hpp) * pcs;
  };

  const calculateSettlementProfit = (s: B2BSettlement): number => {
    if (s.grossProfit !== undefined) return s.grossProfit;
    if (s.items && s.items.length > 0) {
      return s.items.reduce((sum, it) => {
        const prod = products.find(p => p.id === it.productId || (it.productName && p.name && p.name.toLowerCase() === it.productName.toLowerCase()));
        const hpp = it.hpp !== undefined ? it.hpp : (prod?.hpp || 0);
        const conv = it.b2bConversion || prod?.b2bConversion || 12;
        const pcs = it.quantityInPcs !== undefined ? it.quantityInPcs : (it.quantity * conv);
        const unitPrice = it.unitPrice !== undefined ? it.unitPrice : (prod?.b2bPrice || 0);
        return sum + ((unitPrice - hpp) * pcs);
      }, 0);
    }
    const prod = products.find(p => p.id === s.productId || (s.productName && p.name && p.name.toLowerCase() === s.productName.toLowerCase()));
    const hpp = s.hpp !== undefined ? s.hpp : (prod?.hpp || 0);
    const conv = s.b2bConversion || prod?.b2bConversion || 12;
    const pcs = s.quantitySoldPcs !== undefined ? s.quantitySoldPcs : ((s.quantitySold || (s as any).qty || 1) * conv);
    const b2bUnitPrice = prod?.b2bPrice || (((s.totalCollectedAmount || (s as any).totalCollected || 0)) / (pcs || 1));
    return (b2bUnitPrice - hpp) * pcs;
  };

  const totalB2CGrossProfit = orders.reduce((sum, o) => sum + calculateOrderProfit(o), 0);
  const totalB2BGrossProfit = settlements.reduce((sum, s) => sum + calculateSettlementProfit(s), 0);
  const totalGrossProfit = totalB2CGrossProfit + totalB2BGrossProfit;

  // Filtered metrics by selectedMonth
  const {
    filteredOrders,
    filteredSettlements,
    displayedTotalRevenue,
    displayedTotalGrossProfit,
    displayedB2CRevenue,
    displayedB2BRevenue,
    displayedGrossProfitMargin,
  } = useMemo(() => {
    if (selectedMonth === 'all') {
      const margin = totalOmzet > 0 ? Math.round((totalGrossProfit / totalOmzet) * 100) : 0;
      return {
        filteredOrders: orders,
        filteredSettlements: settlements,
        displayedTotalRevenue: totalOmzet,
        displayedTotalGrossProfit: totalGrossProfit,
        displayedB2CRevenue: totalB2COmzet,
        displayedB2BRevenue: totalB2BOmzet,
        displayedGrossProfitMargin: margin,
      };
    }

    const fOrders = orders.filter(o => getTransactionMonth(o) === selectedMonth);
    const fSettlements = settlements.filter(s => getTransactionMonth(s) === selectedMonth);

    const b2cRev = fOrders.reduce((sum, o) => sum + (o.totalAmount || (o as any).total || 0), 0);
    const b2bRev = fSettlements.reduce((sum, s) => sum + (s.totalCollectedAmount || (s as any).totalCollected || 0), 0);
    const totOmzet = b2cRev + b2bRev;

    const b2cProfit = fOrders.reduce((sum, o) => sum + calculateOrderProfit(o), 0);
    const b2bProfit = fSettlements.reduce((sum, s) => sum + calculateSettlementProfit(s), 0);
    const totProfit = b2cProfit + b2bProfit;
    const margin = totOmzet > 0 ? Math.round((totProfit / totOmzet) * 100) : 0;

    return {
      filteredOrders: fOrders,
      filteredSettlements: fSettlements,
      displayedTotalRevenue: totOmzet,
      displayedTotalGrossProfit: totProfit,
      displayedB2CRevenue: b2cRev,
      displayedB2BRevenue: b2bRev,
      displayedGrossProfitMargin: margin,
    };
  }, [selectedMonth, orders, settlements, totalOmzet, totalGrossProfit, totalB2COmzet, totalB2BOmzet, calculateOrderProfit, calculateSettlementProfit]);

  const displayTotalOmzet = displayedTotalRevenue;
  const displayGrossProfit = displayedTotalGrossProfit;
  const displayB2COmzet = displayedB2CRevenue;
  const displayB2BOmzet = displayedB2BRevenue;
  const displayGrossProfitMargin = displayedGrossProfitMargin;

  const dueFollowUpsCount = orders.filter(o => {
    const stage = o.pipelineStage || (o as any).stage;
    const isDue = stage === 'h_plus_2' || stage === 'h_plus_30';
    if (!isDue) return false;
    const cleanOPhone = cleanPhoneNumber(o.customerPhone || (o as any).phone);
    return customers.some(c => 
      (o.customerId && c.id === o.customerId) ||
      (cleanOPhone && cleanPhoneNumber(c.phone) === cleanOPhone) ||
      (o.customerName && c.name && c.name.toLowerCase().trim() === o.customerName.toLowerCase().trim())
    );
  }).length;

  const activePartnersCount = partners.filter(p => p.status === 'aktif').length;
  const lowStockCount = products.filter(p => p.stock < 25 || p.status === 'habis').length;

  return (
    <CRMContext.Provider
      value={{
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        isLoaded,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isLoggedIn,
        setIsLoggedIn,
        login,
        logout,
        products,
        customers,
        orders,
        partners,
        drops,
        settlements,
        templates,
        settings,
        waLogs,
        supabaseStatus,
        testSupabaseConnection,
        totalB2COmzet,
        totalB2BOmzet,
        totalOmzet,
        totalB2CGrossProfit,
        totalB2BGrossProfit,
        totalGrossProfit,
        selectedMonth,
        setSelectedMonth,
        filteredOrders,
        filteredSettlements,
        displayedTotalRevenue,
        displayedTotalGrossProfit,
        displayedB2CRevenue,
        displayedB2BRevenue,
        displayedGrossProfitMargin,
        displayTotalOmzet,
        displayGrossProfit,
        displayB2COmzet,
        displayB2BOmzet,
        displayGrossProfitMargin,
        calculateOrderProfit,
        calculateSettlementProfit,
        dueFollowUpsCount,
        activePartnersCount,
        lowStockCount,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStatus,
        adjustProductStock,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addB2COrder,
        updateOrderStatus,
        updatePipelineStage,
        deleteOrder,
        addPartner,
        updatePartner,
        deletePartner,
        addDrop,
        deleteDrop,
        addSettlement,
        deleteSettlement,
        updateB2BPipelineStage,
        updateTemplate,
        triggerWhatsAppMessage,
        clearWALogs,
        updateSettings,
        exportDataJSON,
        importDataJSON,
        resetToDefaultData,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
