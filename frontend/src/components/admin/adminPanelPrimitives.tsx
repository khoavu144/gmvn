/** Shared admin panel chrome for consistent empty/loading states */

export const adminEmptyStateClassName =
    'rounded-xl border border-dashed border-gray-200 bg-gray-50/80 py-12 px-4 text-center text-sm text-gray-600';

export const adminLoadingBlockClassName = 'animate-pulse rounded-lg bg-gray-100 h-24 w-full';

export function AdminLoadingBlock() {
    return (
        <div className="space-y-4" aria-busy="true" aria-live="polite">
            <div className={adminLoadingBlockClassName} />
            <p className="text-xs text-gray-500">Đang tải…</p>
        </div>
    );
}
