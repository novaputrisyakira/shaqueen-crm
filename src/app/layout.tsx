import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shaqueen — Sistem Operasional & Retensi Shaqueen Food',
  description: 'Aplikasi internal khusus operasional Shaqueen Food. Mengelola retensi pelanggan langsung (B2C), manajemen mitra reseller grosir B2B (beli putus cash & carry), dan katalog master produk inti (Cuanki Instan, Cuanki Ori, Keripik Moringa, dan Pilus).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased bg-[#F4F1DE] text-[#2B1E16] min-h-screen">
        {children}
      </body>
    </html>
  );
}
