import { useEffect, useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { fetchCommunityGallery, fetchCommunityGalleryStats, setCategory } from '../store/slices/communityGallerySlice';
import { Camera, Image as ImageIcon, Users, Activity, Star } from 'lucide-react';
import GalleryCard from '../components/gallery/GalleryCard';
import GalleryLightbox from '../components/gallery/GalleryLightbox';
import type { CommunityGalleryItem } from '../services/communityGalleryService';
import { trackEvent } from '../lib/analytics';

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
        trackEvent('browse_filter_use', {
            route: 'gallery',
            action: 'category',
            value: categoryId,
        });
        dispatch(setCategory(categoryId));
        // Ensure scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="marketplace-shell text-gray-900 selection:bg-black selection:text-white">
            <Helmet>
                <title>Cộng đồng — GYMERVIET</title>
                <meta name="description" content="Chiêm ngưỡng hành trình, kết quả và những khoảnh khắc đẹp nhất của cộng đồng thể hình GYMERVIET." />
            </Helmet>

            {/* Hero Section */}
            <div className="relative overflow-hidden border-b border-gray-200 bg-[radial-gradient(circle_at_top_right,_rgba(24,24,27,0.06),_transparent_42%),linear-gradient(180deg,#fafaf9_0%,#f1efe9_100%)] pt-16 pb-12 lg:pt-24 lg:pb-16">
                <div className="page-container relative z-10 text-left">
                    <div className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-gray-500 shadow-sm">
                        Cộng đồng Gymerviet
                    </div>
                    <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-0.05em] text-gray-900 sm:text-5xl lg:text-6xl">
                        Những khoảnh khắc cộng đồng đang tập luyện, chuyển hóa và sống kỷ luật mỗi ngày.
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">
                        Một lớp bằng chứng cộng đồng giúp người mới tin hơn vào hệ sinh thái GYMERVIET.
                    </p>

                    {/* Stats */}
                    {stats && (
                        <div className="mt-10 flex flex-wrap gap-6 text-sm md:gap-10 md:text-base">
                            <div className="flex flex-col">
                                <span className="text-2xl md:text-3xl font-bold font-mono">{stats.total_images}+</span>
                                <span className="mt-1 text-xs font-bold uppercase tracking-wider text-gray-500">Khoảnh khắc</span>
                            </div>
                            <div className="hidden h-12 w-px bg-gray-200 md:block"></div>
                            <div className="flex flex-col">
                                <span className="text-2xl md:text-3xl font-bold font-mono">{stats.total_contributors}</span>
                                <span className="mt-1 text-xs font-bold uppercase tracking-wider text-gray-500">Người đóng góp</span>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="mt-8 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        <div className="flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                            {CATEGORIES.map(cat => {
                                const Icon = cat.icon;
                                const isActive = currentCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategorySelect(cat.id)}
                                        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap ${isActive
                                                ? 'bg-gray-900 text-white shadow-sm'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
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
            <div className="mx-auto max-w-[1600px] px-4 py-10 md:py-14">
                {items.length === 0 && !loading ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-24 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            <Camera className="h-8 w-8 text-gray-500" />
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-gray-900">Chưa có bức ảnh nào</h3>
                        <p className="text-gray-500">Thư viện sẽ sáng lên khi cộng đồng đóng góp thêm hình ảnh thật.</p>
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
                        <div className="h-8 w-8 animate-spin rounded-full border-l-2 border-t-2 border-gray-900"></div>
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
