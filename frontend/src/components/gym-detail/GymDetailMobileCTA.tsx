import React from 'react';
import { renderActionButton } from '../../utils/gymDetailUtils';

export interface GymDetailMobileCTAProps {
    lowestPrice: number | null;
    leadAction: { href: string; label: string; isExternal: boolean };
    reducedEffects: boolean;
}

const GymDetailMobileCTA: React.FC<GymDetailMobileCTAProps> = ({
    lowestPrice,
    leadAction,
    reducedEffects,
}) => {
    return (
        <div className="fixed inset-x-4 bottom-4 z-40 lg:hidden" style={{ contain: 'layout paint' }}>
            <div
                className={`rounded-lg border border-white/14 px-4 py-3 text-white shadow-[color:var(--mk-shadow-soft)] ${reducedEffects ? 'bg-[rgba(29,22,18,0.98)]' : 'bg-[rgba(29,22,18,0.94)] backdrop-blur-xl'}`}
            >
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-[0.64rem] font-bold uppercase tracking-[0.18em] text-white/48">Chi phí ước tính từ</div>
                        <div className="mt-1 text-lg font-bold tracking-[-0.04em]">
                            {lowestPrice ? `${lowestPrice.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                        </div>
                    </div>
                    {renderActionButton(
                        leadAction,
                        'rounded-lg bg-[color:var(--mk-accent)] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--mk-accent-ink)]'
                    )}
                </div>
            </div>
        </div>
    );
};

export default GymDetailMobileCTA;
