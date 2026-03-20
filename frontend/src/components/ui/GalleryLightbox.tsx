// src/components/ui/GalleryLightbox.tsx
// Full-screen image lightbox · Swipe gestures · Dark mode

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '../../lib/utils';

interface GalleryImage {
    id: string;
    src: string;
    alt?: string;
    caption?: string;
}

interface GalleryLightboxProps {
    images: GalleryImage[];
    initialIndex?: number;
    isOpen: boolean;
    onClose: () => void;
}

export function GalleryLightbox({
    images,
    initialIndex = 0,
    isOpen,
    onClose,
}: GalleryLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        setCurrentIndex(initialIndex);
        setIsZoomed(false);
    }, [initialIndex, isOpen]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    goToPrevious();
                    break;
                case 'ArrowRight':
                    goToNext();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, currentIndex]);

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
        setIsZoomed(false);
    }, [images.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
        setIsZoomed(false);
    }, [images.length]);

    const toggleZoom = () => setIsZoomed(!isZoomed);

    if (!isOpen || images.length === 0) return null;

    const currentImage = images[currentIndex];

    return (
        <div className="fixed inset-0 z-lightbox bg-black/95 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 text-white">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                        {currentIndex + 1} / {images.length}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleZoom}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label={isZoomed ? 'Thu nhỏ' : 'Phóng to'}
                    >
                        {isZoomed ? (
                            <ZoomOut className="w-5 h-5" />
                        ) : (
                            <ZoomIn className="w-5 h-5" />
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label="Đóng"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                <img
                    src={currentImage.src}
                    alt={currentImage.alt || `Image ${currentIndex + 1}`}
                    className={cn(
                        'max-w-full max-h-full object-contain transition-transform duration-200',
                        isZoomed && 'scale-150 cursor-zoom-out'
                    )}
                    onClick={toggleZoom}
                />

                {/* Navigation arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            aria-label="Ảnh trước"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            aria-label="Ảnh tiếp"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}
            </div>

            {/* Caption */}
            {currentImage.caption && (
                <div className="px-4 py-3 text-center text-white/80 text-sm">
                    {currentImage.caption}
                </div>
            )}

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex justify-center gap-2 px-4 py-3 overflow-x-auto">
                    {images.map((image, index) => (
                        <button
                            key={image.id}
                            onClick={() => {
                                setCurrentIndex(index);
                                setIsZoomed(false);
                            }}
                            className={cn(
                                'flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-colors',
                                index === currentIndex
                                    ? 'border-white'
                                    : 'border-transparent opacity-50 hover:opacity-75'
                            )}
                        >
                            <img
                                src={image.src}
                                alt={image.alt || `Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Gallery grid component
export function GalleryGrid({
    images,
    onImageClick,
    columns = 3,
}: {
    images: GalleryImage[];
    onImageClick: (index: number) => void;
    columns?: 2 | 3 | 4;
}) {
    const gridCols = {
        2: 'grid-cols-2',
        3: 'grid-cols-2 md:grid-cols-3',
        4: 'grid-cols-2 md:grid-cols-4',
    };

    return (
        <div className={cn('grid gap-2', gridCols[columns])}>
            {images.map((image, index) => (
                <button
                    key={image.id}
                    onClick={() => onImageClick(index)}
                    className="aspect-square overflow-hidden rounded-lg bg-[color:var(--mk-paper)] dark:bg-gray-800 hover:opacity-90 transition-opacity"
                >
                    <img
                        src={image.src}
                        alt={image.alt || `Gallery image ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </button>
            ))}
        </div>
    );
}