'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMContext';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 'md', 
  showTagline = true,
  className = '' 
}) => {
  const { settings } = useCRM();
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: { img: 'w-8 h-8', text: 'text-base', sub: 'text-[10px]' },
    md: { img: 'w-11 h-11', text: 'text-lg', sub: 'text-xs' },
    lg: { img: 'w-16 h-16', text: 'text-2xl', sub: 'text-sm' },
    xl: { img: 'w-24 h-24', text: 'text-3xl', sub: 'text-base' },
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Brand Icon or Uploaded Image */}
      <div className={`relative flex-shrink-0 ${sizeClasses.img} rounded-2xl overflow-hidden bg-white p-1 shadow-sm flex items-center justify-center border border-white/20`}>
        <img 
          src={settings.brandLogoUrl || '/shaqueen-logo.png'} 
          alt={settings.brandName || "Shaqueen Food"} 
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/E85D04/FFFFFF?text=SF'; }}
          className="w-full h-full object-contain rounded-xl"
        />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight text-current ${sizeClasses.text}`}>
            SHAQUEEN
          </span>
        </div>
        {showTagline && (
          <span className={`text-[#BDB2A9] font-medium ${sizeClasses.sub} line-clamp-1`}>
            {settings.brandName || "Shaqueen Food"} • Operasional & Retensi
          </span>
        )}
      </div>
    </div>
  );
};
