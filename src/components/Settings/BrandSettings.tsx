'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { 
  Settings, 
  Image as ImageIcon, 
  Upload, 
  RefreshCw, 
  Save, 
  Check, 
  MessageSquare, 
  Database, 
  Download, 
  RotateCcw,
  Sparkles,
  Code2,
  Copy,
  Link,
  Zap,
  Trash2
} from 'lucide-react';
import { BrandLogo } from '../Layout/BrandLogo';

export const BrandSettings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    templates, 
    updateTemplate, 
    exportDataJSON, 
    importDataJSON, 
    resetToDefaultData,
    supabaseStatus,
    testSupabaseConnection,
    waLogs,
    clearWALogs
  } = useCRM();

  // Logo & Identity state
  const [brandName, setBrandName] = useState(settings.brandName);
  const [brandTagline, setBrandTagline] = useState(settings.brandTagline);
  const [logoPreview, setLogoPreview] = useState(settings.brandLogoUrl || '');
  const [logoUrlInput, setLogoUrlInput] = useState(settings.brandLogoUrl || '');
  const [isLogoSaved, setIsLogoSaved] = useState(false);

  // Template states
  const h2Template = templates.find((t) => t.id === 'tpl_h2') || templates[0];
  const h30Template = templates.find((t) => t.id === 'tpl_h30') || templates[1];
  const b2bTemplate = templates.find((t) => t.id === 'tpl_b2b_restock');

  const [h2Text, setH2Text] = useState(h2Template ? h2Template.templateText : '');
  const [h30Text, setH30Text] = useState(h30Template ? h30Template.templateText : '');
  const [b2bText, setB2bText] = useState(b2bTemplate ? b2bTemplate.templateText : '');
  const [isTemplateSaved, setIsTemplateSaved] = useState(false);

  // Supabase states
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey || '');
  const [isDbSaved, setIsDbSaved] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [showSqlSchema, setShowSqlSchema] = useState(false);
  const [isSqlCopied, setIsSqlCopied] = useState(false);

  // Handle Logo Upload via file input
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setLogoUrlInput(result);
        updateSettings({ brandLogoUrl: result });
        setIsLogoSaved(true);
        setTimeout(() => setIsLogoSaved(false), 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyLogoUrl = () => {
    setLogoPreview(logoUrlInput);
    updateSettings({ brandLogoUrl: logoUrlInput });
    setIsLogoSaved(true);
    setTimeout(() => setIsLogoSaved(false), 2000);
  };

  const handleResetLogo = () => {
    setLogoPreview('');
    setLogoUrlInput('');
    updateSettings({ brandLogoUrl: '' });
  };

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      brandName,
      brandTagline,
      brandLogoUrl: logoPreview,
    });
    setIsLogoSaved(true);
    setTimeout(() => setIsLogoSaved(false), 2000);
  };

  const handleSaveTemplates = () => {
    if (h2Template) updateTemplate(h2Template.id, h2Text);
    if (h30Template) updateTemplate(h30Template.id, h30Text);
    if (b2bTemplate) updateTemplate(b2bTemplate.id, b2bText);
    setIsTemplateSaved(true);
    setTimeout(() => setIsTemplateSaved(false), 2000);
  };

  const handleSaveDb = () => {
    updateSettings({
      supabaseUrl,
      supabaseAnonKey,
    });
    setIsDbSaved(true);
    setTimeout(() => setIsDbSaved(false), 2000);
  };

  const handleTestSupabase = async () => {
    setIsTestingDb(true);
    setDbTestResult(null);
    updateSettings({ supabaseUrl, supabaseAnonKey });
    const res = await testSupabaseConnection();
    setDbTestResult(res);
    setIsTestingDb(false);
  };

  const handleExport = () => {
    const data = exportDataJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shaqueen_crm_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const ok = importDataJSON(text);
        if (ok) {
          alert('Data berhasil di-restore dari backup JSON!');
          window.location.reload();
        } else {
          alert('Format file JSON tidak valid.');
        }
      };
      reader.readAsText(file);
    }
  };

  const sqlSample = `-- Copy Script ini ke SQL Editor di Dashboard Supabase Anda:
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    b2c_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    b2b_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'aktif'
);

CREATE TABLE IF NOT EXISTS retail_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    platform VARCHAR(50) NOT NULL DEFAULT 'WhatsApp',
    city VARCHAR(100),
    address TEXT,
    notes TEXT,
    total_orders INT DEFAULT 0,
    total_spent NUMERIC(14, 2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS b2c_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES retail_customers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    platform VARCHAR(50) NOT NULL DEFAULT 'WhatsApp',
    pipeline_stage VARCHAR(30) NOT NULL DEFAULT 'diproses',
    tracking_number VARCHAR(100),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS b2b_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    address TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'aktif',
    total_purchased_cartons INT DEFAULT 0,
    total_settled_amount NUMERIC(14, 2) DEFAULT 0
);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSample);
    setIsSqlCopied(true);
    setTimeout(() => setIsSqlCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl">
      {/* 1. BRAND IDENTITY & LOGO SETTINGS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Identitas Brand & Logo
            </h3>
            <p className="text-xs text-slate-500">
              Ganti logo brand Shaqueen Food yang tampil dominan di Sidebar & halaman Login
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Logo Preview & Uploader */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center">
            <span className="text-xs font-bold text-slate-700 mb-3 block">
              Pratinjau Logo Aktif
            </span>

            <div className="p-4 bg-white rounded-2xl shadow-soft border border-slate-200 mb-4">
              <BrandLogo size="lg" showTagline={false} />
            </div>

            <div className="space-y-2 w-full">
              <label className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm">
                <Upload className="w-4 h-4" />
                <span>Upload File Logo Baru</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>

              <div className="pt-2 border-t border-slate-200 flex flex-col gap-1.5 w-full text-left">
                <label className="text-[11px] font-semibold text-slate-600">Atau Gunakan URL Gambar:</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="https://... atau /logo-shaqueen.svg"
                    value={logoUrlInput}
                    onChange={(e) => setLogoUrlInput(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleApplyLogoUrl}
                    className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
                  >
                    Pasang
                  </button>
                </div>
              </div>

              {logoPreview && (
                <button
                  type="button"
                  onClick={handleResetLogo}
                  className="w-full py-1 text-xs text-slate-500 hover:text-rose-600 font-semibold transition-colors mt-2"
                >
                  Kembalikan ke Default Logo Badge
                </button>
              )}
            </div>

            <span className="text-[10px] text-slate-400 mt-2 block">
              Mendukung PNG, JPG, SVG, WebP (Maks 2MB)
            </span>
          </div>

          {/* Business Details Form */}
          <form onSubmit={handleSaveIdentity} className="md:col-span-2 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Usaha / Brand
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tagline Sistem
              </label>
              <input
                type="text"
                value={brandTagline}
                onChange={(e) => setBrandTagline(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="p-3 bg-brand-50/50 border border-brand-100 rounded-xl text-brand-900">
              <span className="font-bold block mb-0.5">Identitas Visual Appetizing Shaqueen Food:</span>
              <p className="text-[11px] text-brand-800 leading-relaxed">
                Paduan Oranye Hangat (#E85D04) & Deep Sage Green (#40796C) di atas latar Putih Tulang / Ivory (#F4F1DE) dengan aksen Deep Espresso (#2B1E16). Menghadirkan kesan premium, modern, dan menggugah selera untuk Cuanki Instan & cemilan olahan Moringa.
              </p>
            </div>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-md transition-all active:scale-95"
            >
              {isLogoSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isLogoSaved ? 'Tersimpan!' : 'Simpan Identitas'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* 2. WHATSAPP TEMPLATES SETTINGS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Template Pesan WhatsApp Otomatis (100% Bahasa Indonesia)
            </h3>
            <p className="text-xs text-slate-500">
              Sesuaikan kata-kata sapaan, permintaan ulasan rasa, dan promo restock yang dikirim ke pelanggan
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-6 text-xs">
          {/* Template H+2 (Review) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                Template Follow-up H+2 (Minta Ulasan Rasa & Kepuasan)
              </span>
              <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md font-bold">
                Aktif
              </span>
            </div>
            <textarea
              rows={5}
              value={h2Text}
              onChange={(e) => setH2Text(e.target.value)}
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-800 leading-relaxed font-sans"
            />
          </div>

          {/* Template H+30 (Restock) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Template Follow-up H+30 (Target Promo & Repeat Order Restock)
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-bold">
                Aktif
              </span>
            </div>
            <textarea
              rows={5}
              value={h30Text}
              onChange={(e) => setH30Text(e.target.value)}
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-800 leading-relaxed font-sans"
            />
          </div>

          {/* Template Grosir B2B (Restock Warung) */}
          <div className="p-4 bg-sage-50/70 rounded-2xl border border-sage-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sage-600" />
                Template Follow-up Grosir B2B (Cek Stok Etalase & Penawaran Restock)
              </span>
              <span className="text-[10px] text-sage-800 bg-sage-100 px-2 py-0.5 rounded-md font-bold border border-sage-300">
                Aktif (Grosir)
              </span>
            </div>
            <textarea
              rows={6}
              value={b2bText}
              onChange={(e) => setB2bText(e.target.value)}
              placeholder="Template pesan khusus urusan grosir mitra reseller..."
              className="w-full p-3 bg-white border border-sage-200 rounded-xl text-slate-800 leading-relaxed font-sans"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-400">
              Variabel dinamis yang didukung: <code className="text-slate-700 font-mono">{"{nama}"}</code>, <code className="text-slate-700 font-mono">{"{toko}"}</code>, <code className="text-slate-700 font-mono">{"{produk}"}</code>, <code className="text-slate-700 font-mono">{"{resi}"}</code>, <code className="text-slate-700 font-mono">{"{total}"}</code>.
            </span>

            <button
              onClick={handleSaveTemplates}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 self-end sm:self-auto"
            >
              {isTemplateSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isTemplateSaved ? 'Template Disimpan!' : 'Simpan Perubahan Template'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. SUPABASE DATABASE CONFIGURATION */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Koneksi Database Supabase (PostgreSQL)
              </h3>
              <p className="text-xs text-slate-500">
                Laporan & pencatatan 100% diproses di Supabase Postgres (atau browser local storage aman)
              </p>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            supabaseStatus === 'connected'
              ? 'bg-emerald-100 text-emerald-800'
              : supabaseStatus === 'checking'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-slate-100 text-slate-600'
          }`}>
            {supabaseStatus === 'connected' ? '● Supabase Terhubung' : supabaseStatus === 'checking' ? '● Menguji Koneksi...' : '○ Database Lokal'}
          </span>
        </div>

        <div className="mt-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Supabase Anon Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          {/* Test connection result banner */}
          {dbTestResult && (
            <div className={`p-3 rounded-xl text-xs font-medium ${
              dbTestResult.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {dbTestResult.message}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => setShowSqlSchema(!showSqlSchema)}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Code2 className="w-4 h-4" />
              <span>{showSqlSchema ? 'Sembunyikan DDL SQL' : 'Lihat Skrip SQL Migration Supabase'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isTestingDb}
                onClick={handleTestSupabase}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-all border border-slate-200"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>{isTestingDb ? 'Menguji...' : 'Uji Koneksi Supabase'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveDb}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all"
              >
                {isDbSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{isDbSaved ? 'Tersimpan!' : 'Simpan Kredensial'}</span>
              </button>
            </div>
          </div>

          {showSqlSchema && (
            <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-[11px] relative overflow-hidden">
              <button
                onClick={handleCopySql}
                className="absolute top-3 right-3 px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] flex items-center gap-1"
              >
                {isSqlCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isSqlCopied ? 'Tersalin' : 'Salin SQL'}</span>
              </button>
              <pre className="overflow-x-auto max-h-48 leading-relaxed">
                {sqlSample}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* 4. BACKUP & SYSTEM RESET */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Cadangan Data & Reset Awal
            </h3>
            <p className="text-xs text-slate-500">
              Unduh cadangan data operasional atau muat ulang data demo Shaqueen Food
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup JSON</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition-colors border border-slate-200">
            <Upload className="w-4 h-4" />
            <span>Restore dari File JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin me-reset seluruh data kembali ke data bawaan awal Shaqueen Food?')) {
                resetToDefaultData();
                window.location.reload();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 text-rose-600 hover:bg-rose-50 font-bold rounded-xl border border-rose-200 transition-colors ml-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Data Bawaan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
