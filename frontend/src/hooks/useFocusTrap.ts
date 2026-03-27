import { useEffect } from 'react';

export function useFocusTrap(ref: React.RefObject<HTMLElement | null>, isActive: boolean) {
    useEffect(() => {
        if (!isActive || !ref.current) return;

        const focusableElements = ref.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement?.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement?.focus();
                    e.preventDefault();
                }
            }
        };

        firstElement?.focus();
        ref.current.addEventListener('keydown', handleTabKey);

        return () => {
            ref.current?.removeEventListener('keydown', handleTabKey);
        };
    }, [isActive, ref]);
}
