'use client';

import React from 'react';
import { SettlementModal } from './SettlementModal';

interface DropStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPartnerId?: string;
}

export const DropStockModal: React.FC<DropStockModalProps> = (props) => {
  // Seamless alias for B2B Wholesale Transaction Form
  return <SettlementModal {...props} />;
};
