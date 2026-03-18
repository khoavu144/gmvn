// src/components/ui/Button.tsx
// Primary: Black fill (Q14) · 4 variants · Dark mode

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={cn(
                    'inline-flex items-center justify-center gap-2 font-medium rounded transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    'disabled:pointer-events-none disabled:opacity-40 select-none',
                    // Variants
                    variant === 'primary' && 'bg-black text-white hover:bg-gray-800 focus-visible:ring-black dark:bg-white dark:text-black dark:hover:bg-gray-100 dark:focus-visible:ring-white',
                    variant === 'secondary' && 'border border-gray-300 bg-transparent text-gray-800 hover:bg-gray-100 hover:border-gray-400 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800',
                    variant === 'ghost' && 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                    variant === 'danger' && 'bg-transparent border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950',
                    // Sizes
                    size === 'sm' && 'h-8 px-3 text-xs',
                    size === 'md' && 'h-10 px-4 text-sm',
                    size === 'lg' && 'h-11 px-6 text-sm',
                    className
                )}
                {...props}
            >
                {loading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };