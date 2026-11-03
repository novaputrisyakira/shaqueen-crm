'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/context/CRMContext';
import { formatRupiah } from '@/lib/utils';
import { TrendingUp, Sparkles, Calendar, ArrowUpRight } from 'lucide-react';

interface SalesTrendChartProps {
  selectedMonth?: string;
  onSelectMonth?: (monthKey: string) => void;
}

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const MONTH_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

const formatMonthName = (monthKey: string): string => {
  if (!monthKey || monthKey === 'all') return 'Semua Waktu';
  const parts = monthKey.split('-');
  if (parts.length < 2) return monthKey;
  const y = parts[0];
  const m = parseInt(parts[1], 10);
  const name = MONTH_NAMES_ID[m - 1] || parts[1];
  return `${name} ${y}`;
};

const formatMonthShort = (monthKey: string): string => {
  if (!monthKey || monthKey === 'all') return 'Semua';
  const parts = monthKey.split('-');
  if (parts.length < 2) return monthKey;
  const y = parts[0];
  const m = parseInt(parts[1], 10);
  const name = MONTH_SHORT_ID[m - 1] || parts[1];
  return `${name} '${y.slice(2)}`;
};

const formatRupiahCompact = (val: number): string => {
  if (!val || val === 0) return 'Rp 0';
  if (val >= 1000000) {
    const jt = val / 1000000;
    return `Rp ${jt % 1 === 0 ? jt.toFixed(0) : jt.toFixed(1)}Jt`;
  }
  if (val >= 1000) {
    return `Rp ${(val / 1000).toFixed(0)}rb`;
  }
  return `Rp ${val}`;
};

const getTransactionMonth = (item: any): string => {
  if (!item) return '';
  const d = item.orderDate || item.order_date || item.settlementDate || item.settlement_date || item.date || item.createdAt || item.created_at;
  if (!d) return '';
  const str = String(d).trim();
  const m = str.match(/^(\d{4})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}`;
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const mo = String(parsed.getMonth() + 1).padStart(2, '0');
    return `${y}-${mo}`;
  }
  return '';
};

// Smooth Bezier Spline generator for SVG paths
const createSmoothPath = (points: { x: number; y: number }[]): string => {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return path;
};

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({
  selectedMonth,
  onSelectMonth,
}) => {
  const { orders, settlements, calculateOrderProfit, calculateSettlementProfit } = useCRM();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 1. Group real transactions by month in chronological sequence
  const monthlyData = useMemo(() => {
    const monthsSet = new Set<string>();

    // Seed sequence for late 2026 (last 6 months: Jun - Nov 2026)
    const baseYear = 2026;
    const baseMonth = 11;
    for (let i = 5; i >= 0; i--) {
      const d = new Date(baseYear, baseMonth - 1 - i, 1);
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      monthsSet.add(`${y}-${mo}`);
    }

    // Include all active transaction months
    orders.forEach(o => {
      const m = getTransactionMonth(o);
      if (m) monthsSet.add(m);
    });
    settlements.forEach(s => {
      const m = getTransactionMonth(s);
      if (m) monthsSet.add(m);
    });

    const sortedMonths = Array.from(monthsSet).sort();

    return sortedMonths.map(mKey => {
      const mOrders = orders.filter(o => getTransactionMonth(o) === mKey);
      const mSettlements = settlements.filter(s => getTransactionMonth(s) === mKey);

      const b2cRev = mOrders.reduce((sum, o) => sum + (o.totalAmount || (o as any).total || 0), 0);
      const b2bRev = mSettlements.reduce((sum, s) => sum + (s.totalCollectedAmount || (s as any).totalCollected || 0), 0);
      const totalOmzet = b2cRev + b2bRev;

      const b2cProfit = mOrders.reduce((sum, o) => sum + calculateOrderProfit(o), 0);
      const b2bProfit = mSettlements.reduce((sum, s) => sum + calculateSettlementProfit(s), 0);
      const totalProfit = b2cProfit + b2bProfit;
      const margin = totalOmzet > 0 ? (totalProfit / totalOmzet) * 100 : 0;

      return {
        key: mKey,
        label: formatMonthName(mKey),
        shortLabel: formatMonthShort(mKey),
        totalOmzet,
        totalProfit,
        b2cRev,
        b2bRev,
        b2cProfit,
        b2bProfit,
        b2cCount: mOrders.length,
        b2bCount: mSettlements.length,
        totalTx: mOrders.length + mSettlements.length,
        margin: Math.round(margin * 10) / 10,
      };
    });
  }, [orders, settlements, calculateOrderProfit, calculateSettlementProfit]);

  // Dimensions & Scale Calculations
  const chartWidth = 760;
  const chartHeight = 240;
  const paddingLeft = 70;
  const paddingRight = 35;
  const paddingTop = 25;
  const paddingBottom = 45;

  const innerW = chartWidth - paddingLeft - paddingRight;
  const innerH = chartHeight - paddingTop - paddingBottom;
  const nPoints = monthlyData.length;

  const maxVal = useMemo(() => {
    const rawMax = Math.max(...monthlyData.map(d => Math.max(d.totalOmzet, d.totalProfit)), 1000000);
    // Round to clean ceiling divisible by 3 for perfectly formatted integer rupiah steps (e.g. Rp 2Jt, Rp 4Jt, Rp 6Jt)
    if (rawMax <= 1200000) return 1200000;
    if (rawMax <= 2400000) return 2400000;
    if (rawMax <= 3000000) return 3000000;
    if (rawMax <= 6000000) return 6000000;
    return Math.ceil(rawMax / 1200000) * 1200000;
  }, [monthlyData]);

  // Points coordinates
  const pointsOmzet = useMemo(() => {
    return monthlyData.map((d, i) => {
      const x = nPoints > 1 ? paddingLeft + (i / (nPoints - 1)) * innerW : paddingLeft + innerW / 2;
      const y = paddingTop + innerH - (d.totalOmzet / maxVal) * innerH;
      return { x, y, data: d };
    });
  }, [monthlyData, nPoints, innerW, innerH, paddingLeft, paddingTop, maxVal]);

  const pointsProfit = useMemo(() => {
    return monthlyData.map((d, i) => {
      const x = nPoints > 1 ? paddingLeft + (i / (nPoints - 1)) * innerW : paddingLeft + innerW / 2;
      const y = paddingTop + innerH - (d.totalProfit / maxVal) * innerH;
      return { x, y, data: d };
    });
  }, [monthlyData, nPoints, innerW, innerH, paddingLeft, paddingTop, maxVal]);

  // Area and Line SVG paths
  const omzetLinePath = useMemo(() => createSmoothPath(pointsOmzet), [pointsOmzet]);
  const omzetAreaPath = useMemo(() => {
    if (pointsOmzet.length === 0) return '';
    const last = pointsOmzet[pointsOmzet.length - 1];
    const first = pointsOmzet[0];
    const baseline = paddingTop + innerH;
    return `${omzetLinePath} L ${last.x.toFixed(1)} ${baseline} L ${first.x.toFixed(1)} ${baseline} Z`;
  }, [omzetLinePath, pointsOmzet, paddingTop, innerH]);

  const profitLinePath = useMemo(() => createSmoothPath(pointsProfit), [pointsProfit]);
  const profitAreaPath = useMemo(() => {
    if (pointsProfit.length === 0) return '';
    const last = pointsProfit[pointsProfit.length - 1];
    const first = pointsProfit[0];
    const baseline = paddingTop + innerH;
    return `${profitLinePath} L ${last.x.toFixed(1)} ${baseline} L ${first.x.toFixed(1)} ${baseline} Z`;
  }, [profitLinePath, pointsProfit, paddingTop, innerH]);

  // Y-axis grid levels (4 clean steps: 0, 1/3, 2/3, 3/3 of maxVal)
  const gridLevels = [0, Math.round(maxVal / 3), Math.round((maxVal * 2) / 3), maxVal];

  // Key stats highlights
  const peakMonth = useMemo(() => {
    if (monthlyData.length === 0) return null;
    return [...monthlyData].sort((a, b) => b.totalOmzet - a.totalOmzet)[0];
  }, [monthlyData]);

  const totalAggregatedOmzet = useMemo(() => {
    return monthlyData.reduce((sum, d) => sum + d.totalOmzet, 0);
  }, [monthlyData]);

  const totalAggregatedProfit = useMemo(() => {
    return monthlyData.reduce((sum, d) => sum + d.totalProfit, 0);
  }, [monthlyData]);

  const avgMargin = totalAggregatedOmzet > 0
    ? Math.round((totalAggregatedProfit / totalAggregatedOmzet) * 100)
    : 0;

  const hoveredData = hoveredIndex !== null ? monthlyData[hoveredIndex] : null;
  const hoveredPoint = hoveredIndex !== null ? pointsOmzet[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-card relative overflow-hidden">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#E85D04]/10 text-[#E85D04] flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Grafik Tren Penjualan & Laba Kotor
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Real-time DB Sync
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pergerakan naik-turun Total Omzet vs Laba Kotor per bulan dari transaksi riil B2C & Grosir B2B
              </p>
            </div>
          </div>
        </div>

        {/* Legend & Filter Quick Info */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-4 bg-slate-50 px-3.5 py-1.5 rounded-2xl border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#E85D04] shadow-xs" />
              <span className="font-bold text-slate-800">Total Omzet</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#40796C] shadow-xs" />
              <span className="font-bold text-slate-800">Laba Kotor</span>
            </div>
          </div>

          {selectedMonth && selectedMonth !== 'all' && (
            <button
              onClick={() => onSelectMonth && onSelectMonth('all')}
              className="text-[11px] font-bold text-[#E85D04] hover:text-[#D04B00] bg-[#FFF8F3] px-3 py-1.5 rounded-xl border border-[#FEEDDF] transition-colors flex items-center gap-1"
            >
              <span>Periode Aktif: <strong>{formatMonthShort(selectedMonth)}</strong></span>
              <span className="text-xs">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Mini Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-3 bg-gradient-to-r from-slate-50 via-slate-50/70 to-emerald-50/40 rounded-2xl border border-slate-200/60 text-xs">
        <div>
          <span className="text-[11px] text-slate-500 block">Akumulasi Omzet (Tren)</span>
          <span className="font-extrabold text-[#E85D04] text-sm">{formatRupiah(totalAggregatedOmzet)}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">Akumulasi Laba Kotor</span>
          <span className="font-extrabold text-[#40796C] text-sm">{formatRupiah(totalAggregatedProfit)}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">Rata-rata Margin Kotor</span>
          <span className="font-extrabold text-emerald-700 text-sm">{avgMargin}% dari Omzet</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">Bulan Puncak (Peak)</span>
          <span className="font-extrabold text-slate-900 text-sm">
            {peakMonth ? `${peakMonth.shortLabel} (${formatRupiah(peakMonth.totalOmzet)})` : '-'}
          </span>
        </div>
      </div>

      {/* Interactive SVG Chart Container */}
      <div className="relative w-full">
        {/* Floating Tooltip Card */}
        {hoveredData && hoveredPoint && (
          <div
            className="absolute pointer-events-none z-30 bg-[#2B1E16] text-white rounded-2xl p-4 shadow-2xl border border-white/15 text-xs transition-all duration-150 animate-in fade-in"
            style={{
              left: `${Math.min(Math.max(18, (hoveredPoint.x / chartWidth) * 100), 82)}%`,
              top: '10px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/15">
              <span className="font-extrabold text-[#F4F1DE] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#E85D04]" />
                {hoveredData.label}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/15 text-white">
                {hoveredData.totalTx} Transaksi
              </span>
            </div>

            <div className="pt-2.5 space-y-2 text-[11px]">
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-2 text-white/80">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E85D04]" />
                  Total Omzet:
                </span>
                <span className="font-extrabold text-[#E85D04] text-xs">
                  {formatRupiah(hoveredData.totalOmzet)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-2 text-white/80">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#40796C]" />
                  Laba Kotor:
                </span>
                <span className="font-extrabold text-[#98C0B6] text-xs">
                  {formatRupiah(hoveredData.totalProfit)} ({hoveredData.margin}%)
                </span>
              </div>

              <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px] text-white/70">
                <div>
                  <span className="text-white/40 block">Retail B2C:</span>
                  <span className="font-semibold text-white">{formatRupiah(hoveredData.b2cRev)}</span>
                </div>
                <div>
                  <span className="text-white/40 block">Grosir B2B:</span>
                  <span className="font-semibold text-white">{formatRupiah(hoveredData.b2bRev)}</span>
                </div>
              </div>
            </div>

            <div className="mt-2 text-[10px] text-white/50 text-center italic">
              Klik titik bulan untuk memfilter Dashboard
            </div>
          </div>
        )}

        {/* SVG Canvas */}
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-64 sm:h-72 select-none overflow-visible"
        >
          <defs>
            {/* Omzet Area Gradient */}
            <linearGradient id="omzetGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E85D04" stopOpacity="0.32" />
              <stop offset="70%" stopColor="#E85D04" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#E85D04" stopOpacity="0.0" />
            </linearGradient>

            {/* Gross Profit Area Gradient */}
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#40796C" stopOpacity="0.36" />
              <stop offset="70%" stopColor="#40796C" stopOpacity="0.09" />
              <stop offset="100%" stopColor="#40796C" stopOpacity="0.0" />
            </linearGradient>

            {/* Filter for glowing active point */}
            <filter id="glowOrange" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#E85D04" floodOpacity="0.6" />
            </filter>
            <filter id="glowGreen" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#40796C" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {gridLevels.map((val, idx) => {
            const y = paddingTop + innerH - (val / maxVal) * innerH;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={paddingLeft + innerW}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 12}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94A3B8"
                  fontWeight="600"
                >
                  {formatRupiahCompact(val)}
                </text>
              </g>
            );
          })}

          {/* Area Fills */}
          <path d={omzetAreaPath} fill="url(#omzetGradient)" />
          <path d={profitAreaPath} fill="url(#profitGradient)" />

          {/* Lines */}
          <path
            d={omzetLinePath}
            fill="none"
            stroke="#E85D04"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={profitLinePath}
            fill="none"
            stroke="#40796C"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover Vertical Guide */}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1={paddingTop}
              x2={hoveredPoint.x}
              y2={paddingTop + innerH}
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}

          {/* Data Points on Line Curves */}
          {monthlyData.map((d, i) => {
            const pOmzet = pointsOmzet[i];
            const pProfit = pointsProfit[i];
            const isHovered = hoveredIndex === i;
            const isSelected = selectedMonth === d.key;

            return (
              <g key={i}>
                {/* Selected month highlight halo */}
                {isSelected && (
                  <circle
                    cx={pOmzet.x}
                    cy={pOmzet.y}
                    r="12"
                    fill="none"
                    stroke="#E85D04"
                    strokeWidth="2"
                    strokeDasharray="2 2"
                    className="transition-all duration-200"
                  />
                )}

                {/* Omzet Dot */}
                <circle
                  cx={pOmzet.x}
                  cy={pOmzet.y}
                  r={isHovered ? 7 : (isSelected ? 6 : 4.5)}
                  fill="#E85D04"
                  stroke="#FFFFFF"
                  strokeWidth={isHovered ? 3 : 2}
                  filter={isHovered ? 'url(#glowOrange)' : undefined}
                  className="transition-all duration-150"
                />

                {/* Gross Profit Dot */}
                <circle
                  cx={pProfit.x}
                  cy={pProfit.y}
                  r={isHovered ? 7 : (isSelected ? 6 : 4.5)}
                  fill="#40796C"
                  stroke="#FFFFFF"
                  strokeWidth={isHovered ? 3 : 2}
                  filter={isHovered ? 'url(#glowGreen)' : undefined}
                  className="transition-all duration-150"
                />

                {/* Sumbu X Month Label */}
                <text
                  x={pOmzet.x}
                  y={paddingTop + innerH + 24}
                  textAnchor="middle"
                  fontSize="11"
                  fill={isSelected ? '#E85D04' : (isHovered ? '#0F172A' : '#64748B')}
                  fontWeight={isSelected || isHovered ? '800' : '600'}
                  className="transition-colors duration-150"
                >
                  {d.shortLabel}
                </text>
              </g>
            );
          })}

          {/* Invisible Overlay Slices for Precise Hover & Click */}
          {monthlyData.map((d, i) => {
            const p = pointsOmzet[i];
            const sliceWidth = nPoints > 1 ? innerW / (nPoints - 1) : innerW;
            const sliceX = p.x - sliceWidth / 2;

            return (
              <rect
                key={i}
                x={Math.max(paddingLeft, sliceX)}
                y={paddingTop}
                width={sliceWidth}
                height={innerH}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSelectMonth && onSelectMonth(d.key)}
              />
            );
          })}
        </svg>
      </div>

      {/* Chart Footer Insight */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#E85D04]" />
          <span>
            Grafik menghitung langsung dari transaksi riil eceran B2C (`orders`) dan grosir B2B (`settlements`).
          </span>
        </div>
        <div className="font-semibold text-emerald-700">
          Tingkat Konversi & Margin: Stabil ({avgMargin}%)
        </div>
      </div>
    </div>
  );
};
