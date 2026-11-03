'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'brand' | 'sage' | 'warm' | 'emerald' | 'blue' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'brand',
}) => {
  const colorMap = {
    brand: {
      bg: 'bg-brand-50/70',
      text: 'text-brand-600',
      border: 'border-brand-100',
      trendBg: 'bg-brand-50 text-brand-700',
    },
    sage: {
      bg: 'bg-sage-50/70',
      text: 'text-sage-600',
      border: 'border-sage-100',
      trendBg: 'bg-sage-50 text-sage-700',
    },
    warm: {
      bg: 'bg-warm-50/70',
      text: 'text-warm-600',
      border: 'border-warm-100',
      trendBg: 'bg-warm-50 text-warm-700',
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      trendBg: 'bg-emerald-50 text-emerald-700',
    },
    blue: {
      bg: 'bg-blue-50/70',
      text: 'text-blue-600',
      border: 'border-blue-100',
      trendBg: 'bg-blue-50 text-blue-700',
    },
    purple: {
      bg: 'bg-purple-50/70',
      text: 'text-purple-600',
      border: 'border-purple-100',
      trendBg: 'bg-purple-50 text-purple-700',
    },
  }[accentColor];

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E9E4CE] shadow-subtle hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
      {/* Decorative top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent ${
        accentColor === 'brand' ? 'via-brand-500' : accentColor === 'sage' ? 'via-sage-500' : accentColor === 'emerald' ? 'via-emerald-500' : accentColor === 'purple' ? 'via-purple-500' : 'via-sage-500'
      } to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </span>
          <div className={`p-2.5 rounded-xl ${colorMap.bg} ${colorMap.text} ${colorMap.border} border`}>
            {icon}
          </div>
        </div>

        <div className="text-2xl font-black text-slate-900 tracking-tight mb-1">
          {value}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 mt-2">
        <span className="text-slate-500 font-medium">{subtitle}</span>
        {trend && (
          <span
            className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
              trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
