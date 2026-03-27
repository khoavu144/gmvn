import { useState, useEffect, useRef } from 'react';

export function useScrollDirection() {
    const [isHidden, setIsHidden] = useState(false);
    const lastScrollY = useRef(0);
    const scrollRaf = useRef<number | null>(null);

    useEffect(() => {
        lastScrollY.current = window.scrollY;
        const handleScroll = () => {
            if (scrollRaf.current !== null) return;
            scrollRaf.current = requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                    setIsHidden(true);
                } else if (currentScrollY < lastScrollY.current) {
                    setIsHidden(false);
                }
                lastScrollY.current = currentScrollY;
                scrollRaf.current = null;
            });
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollRaf.current !== null) cancelAnimationFrame(scrollRaf.current);
        };
    }, []);

    return isHidden;
}
