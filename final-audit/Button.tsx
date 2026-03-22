// src/components/ui/Button.tsx
// v3.0 — Inter · Tailwind thuần · No dark mode · Merged từ .btn-* CSS classes
// 4 variants: primary | secondary | ghost | danger
// 4 sizes:    sm | md | lg | full

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'full';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base
          'inline-flex items-center justify-center gap-2',
          'font-semibold rounded-lg transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer',
          'touch-manipulation',

          // ── Variants ──
          variant === 'primary' && [
            'bg-black text-white border border-black',
            'hover:bg-gray-900 hover:border-gray-900',
            'active:bg-gray-800',
          ],
          variant === 'secondary' && [
            'bg-white text-black border border-gray-200',
            'hover:bg-gray-50 hover:border-gray-300',
            'active:bg-gray-100',
          ],
          variant === 'ghost' && [
            'bg-transparent text-gray-600 border border-transparent',
            'hover:bg-gray-100 hover:text-black',
            'active:bg-gray-200',
          ],
          variant === 'danger' && [
            'bg-transparent text-red-600 border border-red-200',
            'hover:bg-red-50 hover:border-red-300',
            'active:bg-red-100',
          ],

          // ── Sizes ──
          size === 'sm'   && 'h-8 px-3 text-[12px] tracking-[0.01em]',
          size === 'md'   && 'h-10 px-4 text-[14px] tracking-[0.01em]',
          size === 'lg'   && 'h-11 px-6 text-[14px] tracking-[0.02em] uppercase',
          size === 'full' && 'h-11 w-full px-6 text-[14px] tracking-[0.02em] uppercase',

          className
        )}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}

        {/* Left icon */}
        {!loading && leftIcon && (
          <span className="shrink-0 w-4 h-4">{leftIcon}</span>
        )}

        {children}

        {/* Right icon */}
        {rightIcon && (
          <span className="shrink-0 w-4 h-4">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };

// ─── Usage examples ──────────────────────────────────────────────────────
// <Button>Đăng ký</Button>                        → primary md
// <Button variant="secondary">Hủy</Button>         → secondary md
// <Button variant="ghost" size="sm">Xem thêm</Button>
// <Button size="full" loading>Đang xử lý...</Button>
// <Button leftIcon={<ArrowLeft />}>Quay lại</Button>
// <Button rightIcon={<ArrowRight />} size="lg">Tiếp theo</Button>
//
// ─── Migration từ CSS classes ────────────────────────────────────────────
// className="btn-primary"   → <Button variant="primary">
// className="btn-secondary" → <Button variant="secondary">
// className="btn-tertiary"  → <Button variant="ghost">
// className="btn-base ..."  → <Button className="...">
