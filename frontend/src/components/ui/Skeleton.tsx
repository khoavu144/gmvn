// src/components/ui/Skeleton.tsx
// Facebook-style skeleton loader (Q15)

import { cn } from '../../lib/utils';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'skeleton rounded', // từ globals.css: shimmer animation
                className
            )}
        />
    );
}

// Pre-built skeleton cho CoachListItem (Q8 — horizontal layout)
export function CoachListItemSkeleton() {
    return (
        <div className="flex items-start gap-4 p-4 border-b border-[color:var(--mk-line)] dark:border-gray-800">
            {/* Avatar */}
            <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />

            {/* Info */}
            <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-36 mb-2" />
                <Skeleton className="h-3 w-20 mb-3" />
                <div className="flex gap-1.5 mb-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full max-w-[280px]" />
            </div>

            {/* CTA */}
            <div className="flex-shrink-0 hidden sm:block">
                <Skeleton className="h-9 w-24 rounded" />
            </div>
        </div>
    );
}

// Skeleton cho StatCard (Q7 — Stats first)
export function StatCardSkeleton() {
    return (
        <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded" />
            </div>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-3 w-16" />
        </div>
    );
}

// Skeleton cho GymCard
export function GymCardSkeleton() {
    return (
        <div className="card overflow-hidden">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-3" />
                <Skeleton className="h-3 w-2/3" />
            </div>
        </div>
    );
}