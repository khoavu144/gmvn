// src/components/ui/Badge.tsx
// Pill badges · Semantic colors · Dark mode

import { cn } from '../../lib/utils';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md';
    className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
    return (
        <span
            className={cn(
                'badge',
                // Variants
                variant === 'default' && 'bg-gray-100 text-gray-700',
                variant === 'success' && 'bg-green-100 text-green-700',
                variant === 'warning' && 'bg-amber-100 text-amber-700',
                variant === 'error' && 'bg-red-100 text-red-700',
                variant === 'info' && 'bg-blue-100 text-blue-700',
                // Sizes
                size === 'sm' && 'px-1.5 py-0.5 text-[10px]',
                size === 'md' && 'px-2 py-0.5 text-[11px]',
                className
            )}
        >
            {children}
        </span>
    );
}

// Verified badge cho coaches/gyms
export function VerifiedBadge({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded',
                'bg-black text-white',
                className
            )}
        >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            XÁC MINH
        </span>
    );
}

// Status dot badge
export function StatusBadge({
    status,
    label,
    className,
}: {
    status: 'online' | 'offline' | 'busy';
    label?: string;
    className?: string;
}) {
    return (
        <span className={cn('inline-flex items-center gap-1.5 text-xs', className)}>
            <span
                className={cn(
                    'w-2 h-2 rounded-full',
                    status === 'online' && 'bg-green-500',
                    status === 'offline' && 'bg-gray-400',
                    status === 'busy' && 'bg-amber-500'
                )}
            />
            {label && <span className="text-gray-600">{label}</span>}
        </span>
    );
}