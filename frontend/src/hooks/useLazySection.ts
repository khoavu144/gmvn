import { useState, useEffect, useRef } from 'react';

export function useLazySection(rootMargin = '200px') {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isVisible) return;

        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [isVisible, rootMargin]);

    return { ref, isVisible };
}
