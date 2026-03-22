// src/components/ui/StatCard.tsx
// Stats-first layout (Q7) · Tabular nums · Dark mode

import { type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
    label: string;
    value: string | number;
    subtext?: string;
    icon?: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    className?: string;
}

export function StatCard({
    label,
    value,
    subtext,
    icon: Icon,
    trend,
    trendValue,
    className,
}: StatCardProps) {
    return (
        <div className={cn('card p-4', className)}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                    {label}
                </span>
                {Icon && (
                    <div className="p-1.5 rounded bg-gray-50 dark:bg-gray-800">
                        <Icon className="w-4 h-4 text-gray-600 dark:text-gray-500" />
                    </div>
                )}
            </div>

            <div className="stat-value" data-stat>
                {value}
            </div>

            {(subtext || trendValue) && (
                <div className="flex items-center gap-1.5 mt-1">
                    {trend && trendValue && (
                        <span
                            className={cn(
                                'text-xs font-medium',
                                trend === 'up' && 'text-green-600 dark:text-green-400',
                                trend === 'down' && 'text-red-600 dark:text-red-400',
                                trend === 'neutral' && 'text-gray-500'
                            )}
                        >
                            {trend === 'up' && '↑'}
                            {trend === 'down' && '↓'}
                            {trendValue}
                        </span>
                    )}
                    {subtext && (
                        <span className="stat-label">{subtext}</span>
                    )}
                </div>
            )}
        </div>
    );
}

// Compact variant cho mobile
export function StatCardCompact({
    label,
    value,
    icon: Icon,
    className,
}: Omit<StatCardProps, 'subtext' | 'trend' | 'trendValue'>) {
    return (
        <div className={cn('flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50', className)}>
            {Icon && (
                <div className="p-2 rounded bg-white dark:bg-gray-800 shadow-sm">
                    <Icon className="w-4 h-4 text-gray-600 dark:text-gray-500" />
                </div>
            )}
            <div>
                <div className="stat-value text-lg" data-stat>{value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">{label}</div>
            </div>
        </div>
    );
}