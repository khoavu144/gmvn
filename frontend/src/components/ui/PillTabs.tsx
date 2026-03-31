// src/components/ui/PillTabs.tsx
// Pill-style tabs (Q5) · Horizontal scroll · Dark mode

import { cn } from '../../lib/utils';

interface PillTabsProps<T extends string> {
    tabs: { id: T; label: string; count?: number }[];
    activeTab: T;
    onTabChange: (tab: T) => void;
    className?: string;
}

export function PillTabs<T extends string>({
    tabs,
    activeTab,
    onTabChange,
    className,
}: PillTabsProps<T>) {
    return (
        <div className={cn('scroll-x-hidden -mx-4 px-4', className)}>
            <div className="flex gap-2">
                {tabs.map((tab) => {
                    const isActive = tab.id === activeTab;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                'chip',
                                isActive && 'chip-active'
                            )}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span
                                    className={cn(
                                        'ml-1 text-xs',
                                        isActive
                                            ? 'text-white/70'
                                            : 'text-gray-500'
                                    )}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// Segmented control variant (cho ít tabs)
interface SegmentedControlProps<T extends string> {
    segments: { id: T; label: string }[];
    activeSegment: T;
    onSegmentChange: (segment: T) => void;
    className?: string;
}

export function SegmentedControl<T extends string>({
    segments,
    activeSegment,
    onSegmentChange,
    className,
}: SegmentedControlProps<T>) {
    return (
        <div
            className={cn(
                'inline-flex p-1 rounded-lg bg-gray-50',
                className
            )}
        >
            {segments.map((segment) => {
                const isActive = segment.id === activeSegment;
                return (
                    <button
                        key={segment.id}
                        onClick={() => onSegmentChange(segment.id)}
                        className={cn(
                            'px-3 py-1.5 text-sm font-medium rounded transition-colors',
                            isActive
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        )}
                    >
                        {segment.label}
                    </button>
                );
            })}
        </div>
    );
}