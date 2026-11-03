'use client';

import React, { useState } from 'react';
import { CRMProvider, useCRM } from '@/context/CRMContext';
import { Sidebar } from '@/components/Layout/Sidebar';
import { TopHeader } from '@/components/Layout/TopHeader';
import { DashboardView } from '@/components/Dashboard/DashboardView';
import { ProductCatalogView } from '@/components/Products/ProductCatalogView';
import { CustomerListView } from '@/components/Customers/CustomerListView';
import { KanbanBoardView } from '@/components/Pipeline/KanbanBoardView';
import { B2BPipelineBoardView } from '@/components/Pipeline/B2BPipelineBoardView';
import { PartnerListView } from '@/components/Partners/PartnerListView';
import { BrandSettings } from '@/components/Settings/BrandSettings';
import { NewTransactionModal } from '@/components/Customers/NewTransactionModal';
import { DropStockModal } from '@/components/Partners/DropStockModal';
import { AutoWAModal } from '@/components/Pipeline/AutoWAModal';
import { LoginModal } from '@/components/Auth/LoginModal';
import { LandingPage } from '@/components/Landing/LandingPage';
import { B2COrder } from '@/lib/types';

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
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={() => {
            setIsLoggedIn(true);
            setIsLoginModalOpen(false);
          }}
        />
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
      <NewTransactionModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />

      <DropStockModal
        isOpen={isDropModalOpen}
        onClose={() => setIsDropModalOpen(false)}
      />

      <AutoWAModal
        isOpen={isWAModalOpen}
        onClose={() => {
          setIsWAModalOpen(false);
          setSelectedOrderForWA(null);
        }}
        order={selectedOrderForWA}
      />
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
