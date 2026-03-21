import { useEffect, useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { fetchCommunityGallery, fetchCommunityGalleryStats, setCategory } from '../store/slices/communityGallerySlice';
import { Camera, Image as ImageIcon, Users, Activity, Star } from 'lucide-react';
import GalleryCard from '../components/gallery/GalleryCard';
import GalleryLightbox from '../components/gallery/GalleryLightbox';
import type { CommunityGalleryItem } from '../services/communityGalleryService';

const CATEGORIES = [
    { id: 'all', label: 'Tất cả', icon: ImageIcon },
    { id: 'workout', label: 'Tập Luyện', icon: Activity },
    { id: 'transformation', label: 'Chuyển hóa', icon: Star },
    { id: 'gym_space', label: 'Không gian', icon: Camera },
    { id: 'event', label: 'Sự kiện', icon: Users },
];

export default function CommunityGallery() {
    const dispatch = useDispatch<AppDispatch>();
    const { items, stats, currentCategory, loading, hasMore, page } = useSelector((state: RootState) => state.communityGallery);
    const [selectedImage, setSelectedImage] = useState<{ item: CommunityGalleryItem, index: number } | null>(null);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                dispatch(fetchCommunityGallery({ page: page + 1, category: currentCategory, reset: false }));
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore, page, currentCategory, dispatch]);

    useEffect(() => {
        dispatch(fetchCommunityGalleryStats());
        dispatch(fetchCommunityGallery({ page: 1, category: currentCategory, reset: true }));
    }, [dispatch, currentCategory]);

    const handleCategorySelect = (categoryId: string) => {
        if (categoryId === currentCategory) return;
        dispatch(setCategory(categoryId));
        // Ensure scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <Helmet>
                <title>The Wall — GYMERVIET Community</title>
                <meta name="description" content="Chiêm ngưỡng hành trình, kết quả và những khoảnh khắc đẹp nhất của cộng đồng thể hình GYMERVIET." />
            </Helmet>

            {/* Hero Section */}
            <div className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden border-b border-white/10">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <div className="inline-block px-3 py-1 mb-6 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-xs font-bold tracking-widest text-white/70 uppercase">
                        Gymerviet Community
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-none group">
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
                            THE WALL
                        </span>
                    </h1>
                    <p className="max-w-xl mx-auto text-lg md:text-xl text-[color:var(--mk-muted)] font-medium mb-12">
                        Kỷ luật. Mồ hôi. Và những phiên bản tốt nhất. Không gian tôn vinh nỗ lực của cộng đồng The Gymerviet.
                    </p>

                    {/* Stats */}
                    {stats && (
                        <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-12 text-sm md:text-base">
                            <div className="flex flex-col items-center">
                                <span className="text-2xl md:text-3xl font-bold font-mono">{stats.total_images}+</span>
                                <span className="text-[color:var(--mk-muted)] uppercase tracking-wider text-xs font-bold mt-1">Khoảnh khắc</span>
                            </div>
                            <div className="w-px h-12 bg-white/10 hidden md:block"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-2xl md:text-3xl font-bold font-mono">{stats.total_contributors}</span>
                                <span className="text-[color:var(--mk-muted)] uppercase tracking-wider text-xs font-bold mt-1">Vận động viên</span>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="flex justify-center gap-2 overflow-x-auto pb-4 no-scrollbar">
                        <div className="flex p-1 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                            {CATEGORIES.map(cat => {
                                const Icon = cat.icon;
                                const isActive = currentCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategorySelect(cat.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${isActive
                                                ? 'bg-white text-black shadow-md shadow-white/10'
                                                : 'text-[color:var(--mk-muted)] hover:text-white hover:bg-white/10'
                                            }`}
                                    >
                                        <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Masonry Grid */}
            <div className="max-w-[1600px] mx-auto px-4 py-12 md:py-16">
                {items.length === 0 && !loading ? (
                    <div className="text-center py-24 border border-dashed border-white/20 rounded-lg bg-white/5">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Camera className="w-8 h-8 text-[color:var(--mk-muted)]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Chưa có bức ảnh nào</h3>
                        <p className="text-[color:var(--mk-muted)]">Hãy là người đầu tiên đóng góp vào thư mục này.</p>
                    </div>
                ) : (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
                        {items.map((item, index) => (
                            <div
                                key={`${item.id}-${index}`}
                                className="break-inside-avoid"
                                ref={index === items.length - 1 ? lastElementRef : null}
                            >
                                <GalleryCard
                                    item={item}
                                    onClick={() => setSelectedImage({ item, index })}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 rounded-full border-t-2 border-l-2 border-white animate-spin"></div>
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <GalleryLightbox
                    items={items}
                    currentIndex={selectedImage.index}
                    onClose={() => setSelectedImage(null)}
                    onNavigate={(index: number) => setSelectedImage({ item: items[index], index })}
                />
            )}
        </div>
    );
}
