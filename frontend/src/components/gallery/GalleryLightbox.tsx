import { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CommunityGalleryItem } from '../../services/communityGalleryService';

interface GalleryLightboxProps {
    items: CommunityGalleryItem[];
    currentIndex: number;
    onClose: () => void;
    onNavigate: (newIndex: number) => void;
}

export default function GalleryLightbox({ items, currentIndex, onClose, onNavigate }: GalleryLightboxProps) {
    const item = items[currentIndex];
    const imageKey = `${currentIndex}-${item.image_url}`;
    const [loadedKey, setLoadedKey] = useState<string | null>(null);
    const isImageLoaded = loadedKey === imageKey;

    useEffect(() => {
        if (currentIndex < items.length - 1) {
            const img = new Image();
            img.src = items[currentIndex + 1].image_url;
        }
    }, [currentIndex, items]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight' && currentIndex < items.length - 1) onNavigate(currentIndex + 1);
        if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
    }, [currentIndex, items.length, onClose, onNavigate]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
            onClick={onClose}
        >
            {/* Top Bar Navigation */}
            <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
                <div className="text-white/50 font-mono text-sm tracking-widest px-4">
                    {currentIndex + 1} / {items.length}
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all font-medium flex items-center gap-2"
                >
                    Đóng <X size={20} />
                </button>
            </div>

            {/* Navigation Buttons */}
            {currentIndex > 0 && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1); }}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/50 text-white/50 hover:text-white hover:bg-white/10 transition-all z-10 hidden sm:flex"
                >
                    <ChevronLeft size={32} />
                </button>
            )}

            {currentIndex < items.length - 1 && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1); }}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/50 text-white/50 hover:text-white hover:bg-white/10 transition-all z-10 hidden sm:flex"
                >
                    <ChevronRight size={32} />
                </button>
            )}

            {/* Main Content Area */}
            <div 
                className="w-full h-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 p-4 pt-20 pb-24 md:py-20 animate-in fade-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Image Container */}
                <div className="relative flex-1 w-full h-full max-h-[60vh] md:max-h-[85vh] flex items-center justify-center">
                    {!isImageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full border-t-2 border-l-2 border-white animate-spin"></div>
                        </div>
                    )}
                    <img 
                        key={imageKey}
                        src={item.image_url} 
                        alt={item.caption || 'Community image'}
                        className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setLoadedKey(imageKey)}
                        onContextMenu={(e) => e.preventDefault()}
                    />
                </div>

                {/* Info Sidebar */}
                <div className="w-full md:w-80 flex-shrink-0 flex flex-col gap-6 text-white text-left max-h-[30vh] md:max-h-[85vh] overflow-y-auto no-scrollbar pb-8 md:pb-0">
                    
                    {/* Caption */}
                    {item.caption && (
                        <p className="text-lg md:text-xl font-medium leading-relaxed font-serif italic text-white/90">
                            "{item.caption}"
                        </p>
                    )}

                    <div className="h-px w-full bg-white/10 my-2"></div>

                    {/* Owner Info block */}
                    {item.linked_user ? (
                        <div className="flex flex-col gap-4">
                            <p className="text-xs uppercase tracking-widest text-white/40 font-bold">Vận động viên</p>
                            <Link to={`/coach/${item.linked_user.slug}`} className="flex items-center gap-4 group">
                                <div className="w-14 h-14 rounded-full overflow-hidden border border-white/20 bg-white/10 flex-shrink-0 transition-transform group-hover:scale-105">
                                    {item.linked_user.avatar_url ? (
                                        <img src={item.linked_user.avatar_url} alt={item.linked_user.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-600 font-bold uppercase">
                                            {item.linked_user.full_name.substring(0, 2)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <h3 className="text-lg font-bold truncate group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                                            {item.linked_user.full_name}
                                        </h3>
                                        {item.linked_user.user_type === 'trainer' && <CheckCircle2 size={16} className="text-blue-400" />}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Xem hồ sơ cá nhân
                                    </p>
                                </div>
                            </Link>

                            <Link 
                                to={`/coach/${item.linked_user.slug}`}
                                className="mt-4 w-full py-3 bg-white text-black hover:bg-gray-100 font-bold rounded-lg text-center transition-colors flex items-center justify-center gap-2"
                            >
                                Truy cập Profile
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <p className="text-xs uppercase tracking-widest text-white/40 font-bold">Nguồn ảnh</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 bg-white/10 flex items-center justify-center text-xl font-black">
                                    G
                                </div>
                                <div>
                                    <h3 className="text-base font-bold">GYMERVIET Team</h3>
                                    <p className="text-sm text-gray-500">Official Staff</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Mobile Navigation (Swipe alternative if no swipe lib) */}
                    <div className="flex w-full gap-2 mt-auto pt-8 md:hidden">
                        <button 
                            disabled={currentIndex === 0}
                            onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1); }}
                            className="flex-1 py-3 bg-white/10 rounded-lg disabled:opacity-30 flex justify-center items-center"
                        >
                            <ChevronLeft />
                        </button>
                        <button 
                            disabled={currentIndex === items.length - 1}
                            onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1); }}
                            className="flex-1 py-3 bg-white/10 rounded-lg disabled:opacity-30 justify-center flex items-center"
                        >
                            <ChevronRight />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
