// src/components/dashboard/StatCard.tsx
// v2.0 — Merged SummaryPill pattern · 3 tones · Tailwind thuần · Không --mk-*
// Dùng cho: Dashboard stats, GymDetailPage quick facts, AthleteDetailPage metrics

import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  /** icon: cho dashboard tone='default' và tone='subtle' */
  icon?: ReactNode;
  /**
   * default  → border-l-4 border-black (dashboard accent style)
   * subtle   → border border-gray-200 (standard card style)
   * pill     → compact label+value pill (merged từ SummaryPill trong GymDetailPage)
   */
  tone?: 'default' | 'subtle' | 'pill';
  className?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  tone = 'default',
  className,
}: StatCardProps) {

  // ── Pill tone: compact info pill (thay SummaryPill) ──────────────────
  if (tone === 'pill') {
    return (
      <div
        className={cn(
          'bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm',
          'hover:border-black transition-colors duration-150',
          className
        )}
      >
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500 mb-1">
          {label}
        </p>
        <p className="text-sm font-bold text-black leading-snug">{value}</p>
      </div>
    );
  }

  // ── Subtle tone: standard card (dashboard default card) ───────────────
  if (tone === 'subtle') {
    return (
      <div
        className={cn(
          'bg-white border border-gray-200 rounded-lg p-4 md:p-5 flex flex-col justify-between shadow-sm',
          'hover:border-black transition-colors duration-150',
          className
        )}
      >
        {icon && (
          <div className="flex justify-between items-start mb-2">
            <div className="bg-gray-50 p-2 rounded-md">{icon}</div>
          </div>
        )}
        <div>
          <p className="text-xl sm:text-2xl font-black text-black">{value}</p>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.12em] mt-1 truncate">
            {label}
          </p>
        </div>
      </div>
    );
  }

  // ── Default tone: border-l-4 accent (dashboard flagship style) ────────
  return (
    <div
      className={cn(
        'bg-white border-l-4 border-black rounded-r-lg shadow-sm p-4 md:p-5 flex flex-col justify-between',
        'hover:shadow-md transition-shadow duration-150',
        className
      )}
    >
      {icon && (
        <div className="flex justify-between items-start mb-2">
          <div className="text-gray-400">{icon}</div>
        </div>
      )}
      <div>
        <p className="text-xl sm:text-2xl font-black text-black">{value}</p>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.12em] mt-1 truncate">
          {label}
        </p>
      </div>
    </div>
  );
}

// ─── Usage examples ──────────────────────────────────────────────────────
//
// Dashboard stat card:
// <StatCard label="Tổng học viên" value="48" icon={<Users />} />
//
// Dashboard subtle:
// <StatCard tone="subtle" label="Đánh giá" value="4.8" icon={<Star />} />
//
// GymDetailPage quick facts (thay SummaryPill):
// <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//   <StatCard tone="pill" label="Venue type" value="Yoga Studio" />
//   <StatCard tone="pill" label="Entry price" value="250,000₫ / buổi" />
//   <StatCard tone="pill" label="Trust score" value="★ 4.7 · 12 reviews" />
//   <StatCard tone="pill" label="Best for" value="Phụ nữ văn phòng" />
// </div>
//
// AthleteDetailPage metrics:
// <div className="grid grid-cols-3 gap-3">
//   <StatCard tone="subtle" label="Năm kinh nghiệm" value="8+" />
//   <StatCard tone="subtle" label="Thành tích" value="12" />
//   <StatCard tone="subtle" label="Ảnh" value="45" />
// </div>
