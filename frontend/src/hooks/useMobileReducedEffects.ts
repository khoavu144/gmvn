import { useEffect, useState } from 'react';

const MOBILE_MEDIA_QUERY = '(max-width: 1023px)';
const REDUCED_MOTION_MEDIA_QUERY = '(prefers-reduced-motion: reduce)';

function readReducedEffectsPref() {
    if (typeof window === 'undefined') {
        return false;
    }

    const isMobile = window.matchMedia(MOBILE_MEDIA_QUERY).matches;
    const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches;
    return isMobile || prefersReducedMotion;
}

function bindMediaQueryChange(media: MediaQueryList, onChange: () => void) {
    if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }

    media.addListener(onChange);
    return () => media.removeListener(onChange);
}

export function useMobileReducedEffects() {
    const [reducedEffects, setReducedEffects] = useState<boolean>(() => readReducedEffectsPref());

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const mobileMql = window.matchMedia(MOBILE_MEDIA_QUERY);
        const motionMql = window.matchMedia(REDUCED_MOTION_MEDIA_QUERY);
        const update = () => setReducedEffects(readReducedEffectsPref());

        const offMobile = bindMediaQueryChange(mobileMql, update);
        const offMotion = bindMediaQueryChange(motionMql, update);

        update();

        return () => {
            offMobile();
            offMotion();
        };
    }, []);

    return reducedEffects;
}

