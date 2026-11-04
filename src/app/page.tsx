'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { CRMProvider, useCRM } from '@/context/CRMContext';
import { Sidebar } from '@/components/Layout/Sidebar';
import { TopHeader } from '@/components/Layout/TopHeader';
import { LandingPage } from '@/components/Landing/LandingPage';
import { B2COrder } from '@/lib/types';

const ViewLoadingPlaceholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center p-12 min-h-[300px] bg-white/60 rounded-3xl border border-slate-200/60 animate-pulse">
    <div className="flex flex-col items-center gap-2">
      <div className="w-8 h-8 rounded-xl bg-[#E85D04]/20 animate-spin flex items-center justify-center text-[#E85D04] font-bold text-xs">
        SQ
      </div>
      <span className="text-xs font-semibold text-slate-500">Memuat {title}...</span>
    </div>
  </div>
);

// Dynamic lazy-loaded view chunks
const DashboardView = dynamic(() => import('@/components/Dashboard/DashboardView').then(m => m.DashboardView), {
  loading: () => <ViewLoadingPlaceholder title="Dashboard" />,
  ssr: false,
});
const ProductCatalogView = dynamic(() => import('@/components/Products/ProductCatalogView').then(m => m.ProductCatalogView), {
  loading: () => <ViewLoadingPlaceholder title="Master Produk" />,
  ssr: false,
});
const CustomerListView = dynamic(() => import('@/components/Customers/CustomerListView').then(m => m.CustomerListView), {
  loading: () => <ViewLoadingPlaceholder title="Pelanggan Retail" />,
  ssr: false,
});
const KanbanBoardView = dynamic(() => import('@/components/Pipeline/KanbanBoardView').then(m => m.KanbanBoardView), {
  loading: () => <ViewLoadingPlaceholder title="Pipeline WA Retail" />,
  ssr: false,
});
const B2BPipelineBoardView = dynamic(() => import('@/components/Pipeline/B2BPipelineBoardView').then(m => m.B2BPipelineBoardView), {
  loading: () => <ViewLoadingPlaceholder title="Pipeline Restock B2B" />,
  ssr: false,
});
const PartnerListView = dynamic(() => import('@/components/Partners/PartnerListView').then(m => m.PartnerListView), {
  loading: () => <ViewLoadingPlaceholder title="Mitra Reseller B2B" />,
  ssr: false,
});
const BrandSettings = dynamic(() => import('@/components/Settings/BrandSettings').then(m => m.BrandSettings), {
  loading: () => <ViewLoadingPlaceholder title="Pengaturan Sistem" />,
  ssr: false,
});

// Modals: code-split & lazy loaded on demand
const NewTransactionModal = dynamic(() => import('@/components/Customers/NewTransactionModal').then(m => m.NewTransactionModal), { ssr: false });
const DropStockModal = dynamic(() => import('@/components/Partners/DropStockModal').then(m => m.DropStockModal), { ssr: false });
const AutoWAModal = dynamic(() => import('@/components/Pipeline/AutoWAModal').then(m => m.AutoWAModal), { ssr: false });
const LoginModal = dynamic(() => import('@/components/Auth/LoginModal').then(m => m.LoginModal), { ssr: false });


function CRMContent() {
  const { activeTab, isLoaded, isLoggedIn, setIsLoggedIn } = useCRM();

  // Landing & Auth modal state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Global modals state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);
  const [isWAModalOpen, setIsWAModalOpen] = useState(false);
  const [selectedOrderForWA, setSelectedOrderForWA] = useState<B2COrder | null>(null);

  const handleOpenWAModal = (order: B2COrder) => {
    setSelectedOrderForWA(order);
    setIsWAModalOpen(true);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F4F1DE]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E85D04] animate-spin flex items-center justify-center text-white font-extrabold shadow-lg shadow-[#E85D04]/30">
            SQ
          </div>
          <span className="text-xs font-bold text-[#2B1E16] tracking-wide">
            Memuat Sistem Shaqueen...
          </span>
        </div>
      </div>
    );
  }

  // 1. PUBLIC LANDING PAGE (Locks all internal routes until authenticated)
  if (!isLoggedIn) {
    return (
      <>
        <LandingPage onOpenLogin={() => setIsLoginModalOpen(true)} />
        {isLoginModalOpen && (
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onLoginSuccess={() => {
              setIsLoggedIn(true);
              setIsLoginModalOpen(false);
            }}
          />
        )}
      </>
    );
  }

  // 2. PROTECTED INTERNAL OPERATIONAL SYSTEM
  return (
    <div className="flex min-h-screen bg-[#F4F1DE] text-[#2B1E16]">
      {/* 1. SIDEBAR (Deep Espresso #2B1E16) */}
      <Sidebar />

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <TopHeader
          onOpenNewOrderModal={() => setIsOrderModalOpen(true)}
          onOpenNewDropModal={() => setIsDropModalOpen(true)}
        />

        {/* Dynamic Screen View */}
        <main className="p-4 sm:p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenWAModal={handleOpenWAModal}
              onOpenNewOrderModal={() => setIsOrderModalOpen(true)}
              onOpenNewDropModal={() => setIsDropModalOpen(true)}
            />
          )}

          {activeTab === 'products' && <ProductCatalogView />}

          {activeTab === 'customers' && (
            <CustomerListView
              onOpenNewOrderModal={() => setIsOrderModalOpen(true)}
              onOpenWAModal={handleOpenWAModal}
            />
          )}

          {activeTab === 'partners' && <PartnerListView />}

          {activeTab === 'pipeline' && (
            <KanbanBoardView
              onOpenWAModal={handleOpenWAModal}
              onOpenNewOrderModal={() => setIsOrderModalOpen(true)}
            />
          )}

          {activeTab === 'pipeline_b2b' && (
            <B2BPipelineBoardView
              onOpenNewB2BOrder={() => setIsDropModalOpen(true)}
            />
          )}

          {activeTab === 'settings' && <BrandSettings />}
        </main>
      </div>

      {/* 3. GLOBAL MODALS */}
      {isOrderModalOpen && (
        <NewTransactionModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
        />
      )}

      {isDropModalOpen && (
        <DropStockModal
          isOpen={isDropModalOpen}
          onClose={() => setIsDropModalOpen(false)}
        />
      )}

      {isWAModalOpen && (
        <AutoWAModal
          isOpen={isWAModalOpen}
          onClose={() => {
            setIsWAModalOpen(false);
            setSelectedOrderForWA(null);
          }}
          order={selectedOrderForWA}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <CRMProvider>
      <CRMContent />
    </CRMProvider>
  );
}
