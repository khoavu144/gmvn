import { useEffect } from 'react';

const activeLocks = new Set<string>();
let originalOverflow: string | null = null;
let originalPaddingRight: string | null = null;

function syncBodyLockState() {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
        return;
    }

    const body = document.body;
    const docEl = document.documentElement;

    if (activeLocks.size > 0) {
        if (originalOverflow === null) {
            originalOverflow = body.style.overflow;
            originalPaddingRight = body.style.paddingRight;
        }

        const scrollbarWidth = Math.max(0, window.innerWidth - docEl.clientWidth);
        body.style.overflow = 'hidden';
        body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : originalPaddingRight || '';
        return;
    }

    if (originalOverflow !== null) {
        body.style.overflow = originalOverflow;
        body.style.paddingRight = originalPaddingRight || '';
        originalOverflow = null;
        originalPaddingRight = null;
    }
}

export function useBodyScrollLock(key: string, locked: boolean) {
    useEffect(() => {
        if (locked) {
            activeLocks.add(key);
            syncBodyLockState();
        }

        return () => {
            activeLocks.delete(key);
            syncBodyLockState();
        };
    }, [key, locked]);
}

