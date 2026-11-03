'use client';

import React, { useState, useEffect } from 'react';
import { BrandLogo } from '../Layout/BrandLogo';
import { useCRM } from '@/context/CRMContext';
import { Lock, Mail, ArrowRight, ShieldCheck, ArrowLeft, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess?: () => void;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onLoginSuccess,
  onClose,
}) => {
  const { login } = useCRM();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Reset form error and password whenever the modal is opened fresh
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setPassword('');
    }
  }, [isOpen]);

  const handleClose = () => {
    setErrorMsg('');
    setPassword('');
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = (email || '').trim();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('Email atau kata sandi tidak valid. Akses ditolak!');
      return;
    }

    if (cleanEmail.toLowerCase() === 'admin@shaqueenfood.com' && cleanPassword === 'shaqueen123') {
      setErrorMsg('');
      const success = login(cleanEmail, cleanPassword);
      if (success) {
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setErrorMsg('Email atau kata sandi tidak valid. Akses ditolak!');
      }
    } else {
      setErrorMsg('Email atau kata sandi tidak valid. Akses ditolak!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1E16]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#FAF8EE] rounded-3xl max-w-md w-full shadow-2xl border border-[#2B1E16]/10 overflow-hidden flex flex-col p-8 text-center relative">
        
        {/* Close / Back button */}
        {onClose && (
          <button 
            type="button" 
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-[#2B1E16]/50 hover:text-[#2B1E16] hover:bg-black/5 transition-colors"
            title="Tutup / Kembali ke Beranda"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Dominant Brand Logo Area */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="p-3 bg-white rounded-3xl border border-[#E85D04]/20 shadow-md shadow-[#E85D04]/10 mb-3">
            <BrandLogo size="lg" showTagline={false} />
          </div>
          <h2 className="text-2xl font-black text-[#2B1E16] tracking-tight">
            Shaqueen Internal
          </h2>
          <p className="text-xs text-[#2B1E16]/70 mt-1 max-w-xs">
            Pusat Kendali Operasional & Retensi Pelanggan Shaqueen Food
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left text-xs">
          <div>
            <label className="block font-bold text-[#2B1E16] mb-1">
              Email Admin Internal
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#2B1E16]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="admin@shaqueenfood.com"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#2B1E16]/15 rounded-xl text-[#2B1E16] font-medium focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-[#E85D04]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#2B1E16] mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#2B1E16]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#2B1E16]/15 rounded-xl text-[#2B1E16] font-medium focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:border-[#E85D04]"
              />
            </div>
          </div>

          {/* Peringatan Error tepat di bawah kolom isian */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#E85D04] hover:bg-[#D04B00] text-white rounded-xl font-bold text-xs shadow-md shadow-[#E85D04]/30 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
            >
              <span>Masuk ke Dashboard Operasional</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onClose && (
              <button
                type="button"
                onClick={handleClose}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-[#2B1E16]/60 hover:text-[#2B1E16] rounded-xl font-semibold text-[11px] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Beranda Depan</span>
              </button>
            )}
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-[#2B1E16]/10 flex items-center justify-center gap-1.5 text-[11px] text-[#2B1E16]/50">
          <ShieldCheck className="w-3.5 h-3.5 text-[#40796C]" />
          <span>Akses Terenkripsi & Single-Tenant Internal</span>
        </div>
      </div>
    </div>
  );
};
