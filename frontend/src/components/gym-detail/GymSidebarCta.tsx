// src/components/gym-detail/GymSidebarCta.tsx
// Sticky right-side CTA card — Light pattern · Tailwind thuần · No --mk-*

import type { GymCenter, GymBranch } from '../../types';

interface LeadAction {
  href: string;
  label: string;
  isExternal: boolean;
  helper?: string;
}

interface GymSidebarCtaProps {
  gym: GymCenter;
  branch: GymBranch | null;
  leadAction: LeadAction;
  lowestPrice: number | null;
  entryBillingCycle?: string | null;
  onBranchChange?: (branchId: string) => void;
}

const BILLING_LABELS: Record<string, string> = {
  per_day: '/ ngày',
  per_month: '/ tháng',
  per_quarter: '/ quý',
  per_year: '/ năm',
  per_session: '/ buổi',
};

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const TODAY_KEY = DAY_KEYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
const DAY_LABELS: Record<string, string> = {
  mon: 'Thứ Hai', tue: 'Thứ Ba', wed: 'Thứ Tư',
  thu: 'Thứ Năm', fri: 'Thứ Sáu', sat: 'Thứ Bảy', sun: 'Chủ Nhật',
};

export function GymSidebarCta({
  gym,
  branch,
  leadAction,
  lowestPrice,
  entryBillingCycle,
  onBranchChange,
}: GymSidebarCtaProps) {
  const priceDisplay = lowestPrice
    ? `${lowestPrice.toLocaleString('vi-VN')}₫${
        entryBillingCycle ? ` ${BILLING_LABELS[entryBillingCycle] || ''}` : ''
      }`
    : 'Liên hệ để nhận giá';

  const todayHours = branch?.opening_hours?.[TODAY_KEY] as
    | { open?: string; close?: string; is_closed?: boolean }
    | undefined;

  const isOpen = todayHours && !todayHours.is_closed && todayHours.open;

  return (
    <aside className="hidden lg:block w-72 xl:w-80 shrink-0">
      <div className="sticky top-24 space-y-3">

        {/* ── CTA card ── */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          {/* Price */}
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500 mb-1">
              Giá từ
            </p>
            <p className="text-2xl font-black text-black tracking-tight">{priceDisplay}</p>
          </div>

          {/* CTA button */}
          {leadAction.isExternal ? (
            <a
              href={leadAction.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-11 bg-black text-white text-[14px] font-bold uppercase tracking-[0.05em] rounded-lg hover:bg-gray-900 active:bg-gray-800 transition-colors"
            >
              {leadAction.label}
            </a>
          ) : (
            <a
              href={leadAction.href}
              className="flex items-center justify-center gap-2 w-full h-11 bg-black text-white text-[14px] font-bold uppercase tracking-[0.05em] rounded-lg hover:bg-gray-900 active:bg-gray-800 transition-colors"
            >
              {leadAction.label}
            </a>
          )}

          {leadAction.helper && (
            <p className="mt-2 text-center text-[11px] text-gray-500">{leadAction.helper}</p>
          )}
        </div>

        {/* ── Hours card ── */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500 mb-3">
            Hôm nay · {DAY_LABELS[TODAY_KEY]}
          </p>

          {todayHours ? (
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold text-black">
                {todayHours.is_closed
                  ? 'Nghỉ'
                  : `${todayHours.open} – ${todayHours.close}`}
              </span>
              <span
                className={[
                  'text-[11px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded',
                  isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600',
                ].join(' ')}
              >
                {isOpen ? 'Đang mở' : 'Đóng cửa'}
              </span>
            </div>
          ) : (
            <p className="text-[13px] text-gray-400">Chưa cập nhật giờ</p>
          )}
        </div>

        {/* ── Branch selector (nếu có nhiều cơ sở) ── */}
        {gym.branches && gym.branches.length > 1 && onBranchChange && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500 mb-2">
              Chọn cơ sở ({gym.branches.length})
            </p>
            <div className="space-y-1.5">
              {gym.branches.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onBranchChange(b.id)}
                  className={[
                    'w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors duration-150',
                    branch?.id === b.id
                      ? 'bg-black text-white font-semibold'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 font-medium',
                  ].join(' ')}
                >
                  <span className="block font-semibold leading-tight">
                    {b.branch_name || b.address || 'Cơ sở'}
                  </span>
                  {b.district && (
                    <span className={branch?.id === b.id ? 'text-white/70' : 'text-gray-500'}>
                      {b.district}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </aside>
  );
}
