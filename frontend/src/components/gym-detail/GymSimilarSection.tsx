import React from 'react';
import GymCard from '../GymCard';
import type { GymCenter } from '../../types';

interface Props {
    similarGyms: GymCenter[];
}

/** Scrollable vertical list for the sticky sidebar rail */
const GymSimilarSection = React.memo(function GymSimilarSection({ similarGyms }: Props) {
    if (similarGyms.length === 0) return null;

    return (
        <div className="mt-4 flex max-h-[min(50vh,28rem)] flex-col gap-3 overflow-y-auto overscroll-contain pr-1 [scrollbar-gutter:stable]">
            {similarGyms.map((item) => (
                <div key={item.id} className="min-h-0 shrink-0">
                    <GymCard gym={item} variant="compact" />
                </div>
            ))}
        </div>
    );
});

export default GymSimilarSection;
