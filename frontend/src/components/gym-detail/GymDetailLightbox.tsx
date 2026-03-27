import React, { useEffect } from 'react';
import type { GymGallery } from '../../types';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export interface GymDetailLightboxProps {
    gymName: string;
    gallery: GymGallery[];
    lightboxIdx: number | null;
    setLightboxIdx: (fn: (idx: number | null) => number | null) => void;
}

const GymDetailLightbox: React.FC<GymDetailLightboxProps> = ({
    gymName,
    gallery,
    lightboxIdx,
    setLightboxIdx,
}) => {
    const activeImage = lightboxIdx !== null ? gallery[lightboxIdx] : null;

    useBodyScrollLock('gym-detail-lightbox', lightboxIdx !== null);

    useEffect(() => {
        if (lightboxIdx === null) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setLightboxIdx(() => null);
            } else if (e.key === 'ArrowLeft' && gallery.length > 1) {
                setLightboxIdx((current) => current === null ? 0 : (current - 1 + gallery.length) % gallery.length);
            } else if (e.key === 'ArrowRight' && gallery.length > 1) {
                setLightboxIdx((current) => current === null ? 0 : (current + 1) % gallery.length);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [lightboxIdx, gallery.length, setLightboxIdx]);

    if (!activeImage) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(16,12,10,0.96)] p-4" 
            onClick={() => setLightboxIdx(() => null)}
            role="dialog"
            aria-modal="true"
            aria-label="Thư viện ảnh"
        >
            <button
                type="button"
                onClick={() => setLightboxIdx(() => null)}
                className="absolute right-5 top-5 text-3xl font-bold text-white/75 transition motion-reduce:transition-none hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full w-12 h-12 flex items-center justify-center"
                aria-label="Đóng thư viện ảnh"
            >
                ×
            </button>
            {gallery.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            setLightboxIdx((current) => current === null ? 0 : (current - 1 + gallery.length) % gallery.length);
                        }}
                        className="absolute left-4 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-xl font-bold text-white transition motion-reduce:transition-none hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-white/50"
                        aria-label="Ảnh trước"
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            setLightboxIdx((current) => current === null ? 0 : (current + 1) % gallery.length);
                        }}
                        className="absolute right-4 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-xl font-bold text-white transition motion-reduce:transition-none hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-white/50"
                        aria-label="Ảnh sau"
                    >
                        ›
                    </button>
                </>
            )}
            <img
                src={activeImage.image_url}
                alt={activeImage.alt_text || activeImage.caption || gymName}
                className="max-h-[88vh] max-w-full object-contain transition-transform motion-reduce:transition-none"
                onClick={(event) => event.stopPropagation()}
            />
        </div>
    );
};

export default GymDetailLightbox;
