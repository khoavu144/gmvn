import React, { useMemo, useState, lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Filter } from 'lucide-react';
import GymCard from '../components/GymCard';
import { gymService } from '../services/gymService';
import type { GymCenter } from '../types';

const GymMapView = lazy(() => import('../components/GymMapView'));

type ViewMode = 'grid' | 'map';

type SortValue = 'featured' | 'views' | 'newest' | 'price_asc';

const SORT_OPTIONS: Array<{ value: SortValue; label: string }> = [
    { value: 'featured', label: 'Biên tập chọn' },
    { value: 'views', label: 'Được xem nhiều' },
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price_asc', label: 'Giá khởi điểm thấp' },
];

const NEED_CHIPS = [
    { key: 'beginner', label: 'Người mới bắt đầu' },
    { key: 'women_focused', label: 'Women-friendly' },
    { key: 'athlete', label: 'Tập cho athlete' },
    { key: 'premium', label: 'Premium spaces' },
];

const QUICK_VENUES = [
    { key: '', label: 'Tất cả không gian' },
    { key: 'gym', label: 'Gym' },
    { key: 'fitness_club', label: 'Fitness Club' },
    { key: 'yoga_studio', label: 'Yoga Studio' },
    { key: 'pilates_studio', label: 'Pilates Studio' },
    { key: 'boutique_studio', label: 'Boutique Studio' },
    { key: 'recovery_venue', label: 'Recovery' },
];

function getCityData(gyms: GymCenter[]) {
    const cities = new Map<string, Set<string>>();

    gyms.forEach((gym) => {
        (gym.branches || []).forEach((branch) => {
            if (!branch.city) return;
            if (!cities.has(branch.city)) cities.set(branch.city, new Set());
            if (branch.district) cities.get(branch.city)!.add(branch.district);
        });
    });

    return cities;
}

function getPrimaryVenueLabel(gym: GymCenter) {
    const primaryTerm = (gym.taxonomy_terms || []).find((item) => item.is_primary && item.term)?.term;
    return primaryTerm?.label || gym.primary_venue_type_slug || 'Venue';
}



function getSignatureText(gym: GymCenter) {
    return gym.discovery_blurb || gym.tagline || gym.description || 'Không gian luyện tập được biên tập để giúp bạn chọn nhanh hơn.';
}



const Gyms: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [districtFilter, setDistrictFilter] = useState('');
    const [venueType, setVenueType] = useState('');
    const [audienceTag, setAudienceTag] = useState('');
    const [sortBy, setSortBy] = useState<SortValue>('featured');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const {
        data,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['gyms', 'marketplace', { searchTerm, cityFilter, districtFilter, venueType, audienceTag, sortBy }],
        queryFn: async () => {
            const response = await gymService.listMarketplaceGyms({
                limit: 60,
                search: searchTerm || undefined,
                city: cityFilter || undefined,
                district: districtFilter || undefined,
                venue_type: venueType || undefined,
                audience_tag: audienceTag || undefined,
                sort: sortBy,
            });

            if (!response.success) {
                throw new Error(response.error || 'Lỗi tải marketplace gyms');
            }

            return response;
        },
        staleTime: 5 * 60 * 1000,
    });

    const gyms = (data?.gyms || []) as GymCenter[];
    const total = data?.pagination?.total || gyms.length;
    const errorMessage = error instanceof Error ? error.message : null;

    const cityData = useMemo(() => getCityData(gyms), [gyms]);
    const allCities = useMemo(() => Array.from(cityData.keys()).sort(), [cityData]);
    const availableDistricts = useMemo(() => {
        if (!cityFilter) return [];
        return Array.from(cityData.get(cityFilter) || []).sort();
    }, [cityData, cityFilter]);

    const featuredGyms = useMemo(() => gyms.slice(0, 3), [gyms]);
    const standardGyms = useMemo(() => gyms.slice(3), [gyms]);

    const venueHighlights = useMemo(() => {
        const groups = new Map<string, GymCenter[]>();
        gyms.forEach((gym) => {
            const key = gym.primary_venue_type_slug || 'other';
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(gym);
        });

        return Array.from(groups.entries())
            .map(([key, items]) => ({ key, items: items.slice(0, 6) }))
            .filter((group) => group.items.length > 0)
            .slice(0, 3);
    }, [gyms]);

    const hasFilters = Boolean(searchTerm || cityFilter || districtFilter || venueType || audienceTag);

    return (
        <>
            <Helmet>
                <title>Marketplace Phòng tập — GYMERVIET</title>
                <meta
                    name="description"
                    content="Khám phá gym, fitness club, yoga studio, pilates studio và recovery spaces theo khu vực, mức giá và trải nghiệm phù hợp với mục tiêu tập luyện của bạn."
                />
                <link rel="canonical" href="https://gymerviet.com/gyms" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Marketplace Phòng tập — GYMERVIET" />
                <meta
                    property="og:description"
                    content="Khám phá không gian tập luyện được biên tập: thumbnail, giá khởi điểm rõ ràng, trải nghiệm phù hợp từng mục tiêu."
                />
                <meta property="og:url" content={import.meta.env.VITE_CANONICAL_BASE_URL ? `${import.meta.env.VITE_CANONICAL_BASE_URL}/gyms` : "https://gymerviet.com/gyms"} />
                <meta property="og:image" content="https://gymerviet.com/og-default.jpg" />
                <meta property="og:image:alt" content="GYMERVIET Gyms Marketplace" />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            <div className="marketplace-shell min-h-screen pb-20">
                <section className="marketplace-hero">
                    <div className="marketplace-container">
                        <div className="marketplace-hero-grid">
                            <div className="space-y-6">
                                <span className="marketplace-eyebrow">Editorial marketplace</span>
                                <div className="space-y-5">
                                    <h1 className="marketplace-title">
                                        Chọn nơi tập bằng
                                        <br />
                                        không gian, cảm giác
                                        <br />
                                        và quyết định đúng.
                                    </h1>
                                    <p className="marketplace-lead">
                                        Một marketplace dành cho người thật sự muốn tìm đúng không gian tập: gym chất lượng cao,
                                        fitness club cao cấp, yoga studio, pilates reformer và không gian recovery.
                                    </p>
                                </div>
                            </div>

                            <div className="marketplace-stat-strip">
                                <div className="marketplace-stat-card">
                                    <strong>{total}</strong>
                                    <span>Không gian đang mở</span>
                                </div>
                                <div className="marketplace-stat-card">
                                    <strong>{featuredGyms.length > 0 ? featuredGyms.length : 0}</strong>
                                    <span>Nổi bật tuần này</span>
                                </div>
                                <div className="marketplace-stat-card">
                                    <strong>{venueHighlights.length}</strong>
                                    <span>Loại hình chọn lọc</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="marketplace-container">
                    <div className="marketplace-panel marketplace-filter-bar">
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="marketplace-field">
                                    <label htmlFor="marketplace-venue">Loại hình</label>
                                    <select
                                        id="marketplace-venue"
                                        className="marketplace-select"
                                        value={venueType}
                                        onChange={(e) => setVenueType(e.target.value)}
                                    >
                                        {QUICK_VENUES.map((item) => (
                                            <option key={item.key} value={item.key}>{item.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="marketplace-field">
                                    <label htmlFor="marketplace-city">Tỉnh / thành</label>
                                    <select
                                        id="marketplace-city"
                                        className="marketplace-select"
                                        value={cityFilter}
                                        onChange={(e) => {
                                            setCityFilter(e.target.value);
                                            setDistrictFilter('');
                                        }}
                                    >
                                        <option value="">Tất cả thành phố</option>
                                        {allCities.map((city) => (
                                            <option key={city} value={city}>
                                                {city}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="marketplace-field">
                                    <label htmlFor="marketplace-sort">Xếp theo</label>
                                    <select
                                        id="marketplace-sort"
                                        className="marketplace-select"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as SortValue)}
                                    >
                                        {SORT_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="marketplace-field flex items-end">
                                    <button
                                        type="button"
                                        className={`w-full h-11 px-4 flex items-center justify-center gap-2 rounded-lg border font-bold text-sm transition-colors ${showAdvancedFilters ? 'bg-black text-white border-black' : 'bg-white text-[color:var(--mk-text)] border-[color:var(--mk-line)] hover:border-[color:var(--mk-line)]'}`}
                                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    >
                                        <Filter className="w-4 h-4" />
                                        Lọc thêm
                                    </button>
                                </div>
                            </div>

                            {/* Advanced Filters */}
                            {showAdvancedFilters && (
                                <div className="pt-4 border-t border-[color:var(--mk-line)] animate-fade-in space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="marketplace-field">
                                            <label htmlFor="marketplace-search">Tìm theo tên, đặc điểm</label>
                                            <input
                                                id="marketplace-search"
                                                className="marketplace-input"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Ví dụ: reformer quận 2, gym có sauna..."
                                            />
                                        </div>

                                        <div className="marketplace-field">
                                            <label htmlFor="marketplace-district">Quận / huyện</label>
                                            <select
                                                id="marketplace-district"
                                                className="marketplace-select"
                                                value={districtFilter}
                                                disabled={!cityFilter}
                                                onChange={(e) => setDistrictFilter(e.target.value)}
                                            >
                                                <option value="">Tất cả khu vực</option>
                                                {availableDistricts.map((district) => (
                                                    <option key={district} value={district}>
                                                        {district}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="marketplace-field">
                                        <label>Phù hợp cho</label>
                                        <div className="marketplace-chip-row mt-2">
                                            {NEED_CHIPS.map((chip) => (
                                                <button
                                                    key={chip.key}
                                                    type="button"
                                                    className={`marketplace-chip ${audienceTag === chip.key ? 'is-active' : ''}`}
                                                    onClick={() => setAudienceTag((current) => current === chip.key ? '' : chip.key)}
                                                >
                                                    {chip.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Options & Reset */}
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <div className="inline-flex overflow-hidden rounded-lg border border-[color:var(--mk-line)] bg-white/70 p-1">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('grid')}
                                        className={`rounded-lg px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition ${viewMode === 'grid' ? 'bg-[color:var(--mk-text)] text-white' : 'text-[color:var(--mk-text-soft)]'}`}
                                    >
                                        Grid
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('map')}
                                        className={`rounded-lg px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition ${viewMode === 'map' ? 'bg-[color:var(--mk-text)] text-white' : 'text-[color:var(--mk-text-soft)]'}`}
                                    >
                                        Map
                                    </button>
                                </div>

                                {hasFilters && (
                                    <button
                                        type="button"
                                        className="marketplace-chip"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setCityFilter('');
                                            setDistrictFilter('');
                                            setVenueType('');
                                            setAudienceTag('');
                                            setShowAdvancedFilters(false);
                                        }}
                                    >
                                        Reset filters
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="marketplace-container mt-6 space-y-8">
                    {isLoading ? (
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, idx) => (
                                <div key={idx}>
                                    <div className="marketplace-panel overflow-hidden animate-pulse">
                                        <div className="aspect-[4/3] bg-[color:var(--mk-paper-strong)]" />
                                        <div className="space-y-3 p-5">
                                            <div className="h-3 w-24 rounded-lg bg-[color:var(--mk-line)]" />
                                            <div className="h-7 w-3/4 rounded-lg bg-[color:var(--mk-line)]" />
                                            <div className="h-4 w-full rounded-lg bg-[color:var(--mk-line)]" />
                                            <div className="h-4 w-2/3 rounded-lg bg-[color:var(--mk-line)]" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : errorMessage ? (
                        <div className="marketplace-panel marketplace-empty">
                            <strong>Không tải được marketplace.</strong>
                            <p>{errorMessage}</p>
                            <button type="button" className="marketplace-chip mt-6" onClick={() => refetch()}>
                                Thử tải lại
                            </button>
                        </div>
                    ) : viewMode === 'map' ? (
                        <div className="marketplace-panel overflow-hidden p-3">
                            <Suspense fallback={<div className="h-[560px] animate-pulse rounded-lg bg-[color:var(--mk-paper-strong)]" />}>
                                <GymMapView gyms={gyms} />
                            </Suspense>
                        </div>
                    ) : gyms.length === 0 ? (
                        <div className="marketplace-panel marketplace-empty">
                            <strong>Không có venue khớp với nhịp tìm kiếm này.</strong>
                            <p>
                                Thử nới rộng khu vực, bỏ bớt một filter hoặc chuyển sang một loại hình khác như yoga,
                                pilates hoặc recovery để tìm thêm lựa chọn phù hợp.
                            </p>
                        </div>
                    ) : (
                        <>
                            {featuredGyms.length > 0 && (
                                <div className="space-y-4">
                                    <div className="marketplace-results-head">
                                        <div>
                                            <div className="marketplace-section-kicker">Lựa chọn Nổi bật</div>
                                            <h2>Những không gian đang được chọn nhiều tuần này</h2>
                                        </div>
                                        <div className="marketplace-results-meta">
                                            Hình ảnh thực tế, giá khởi điểm rõ ràng, mô tả chân thực.
                                        </div>
                                    </div>

                                    <div className="marketplace-feature-grid">
                                        <GymCard gym={featuredGyms[0]} variant="featured" />

                                        <div className="marketplace-rail">
                                            {featuredGyms.slice(1, 3).map((gym) => (
                                                <GymCard key={gym.id} gym={gym} variant="compact" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {venueHighlights.length > 0 && (
                                <div className="space-y-6">
                                    {venueHighlights.map((group) => (
                                        <div key={group.key} className="space-y-4">
                                            <div className="marketplace-results-head">
                                                <div>
                                                    <div className="marketplace-section-kicker">Phân loại</div>
                                                    <h2>{getPrimaryVenueLabel(group.items[0])}</h2>
                                                </div>
                                                <div className="marketplace-results-meta">
                                                    {group.items[0] ? getSignatureText(group.items[0]) : ''}
                                                </div>
                                            </div>

                                            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                                                {group.items.map((gym) => (
                                                    <GymCard key={gym.id} gym={gym} variant="compact" />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="marketplace-divider" />

                            <div className="space-y-4">
                                <div className="marketplace-results-head">
                                    <div>
                                        <div className="marketplace-section-kicker">Tất cả Kết quả</div>
                                        <h2>Tất cả lựa chọn phù hợp</h2>
                                    </div>
                                    <div className="marketplace-results-meta">
                                        {gyms.length} cơ sở · {venueType ? `lọc theo loại ${venueType}` : 'mọi loại hình'} · {cityFilter || 'toàn quốc'}
                                    </div>
                                </div>

                                <div className="marketplace-card-grid">
                                    {standardGyms.map((gym, idx) => (
                                        <GymCard key={gym.id} gym={gym} variant="standard" index={idx} />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </section>

                {!isLoading && gyms.length > 0 && (
                    <section className="marketplace-container mt-10">
                        <div className="marketplace-panel p-6 sm:p-8">
                            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                                <div className="space-y-3">
                                    <div className="marketplace-section-kicker">Mẹo so sánh nhanh</div>
                                    <h2 className="marketplace-section-title">Ba tiêu chí nên xem trước khi chọn một cơ sở</h2>
                                    <p className="marketplace-lead max-w-none">
                                        Hãy so sánh ba yếu tố này trước: hình ảnh không gian có đúng gu của bạn không, mức giá khởi điểm có phù hợp không,
                                        và các thẻ phân loại có đúng với nhu cầu tập luyện của bạn không.
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    {[
                                        { title: 'Không gian', body: 'Xem hình ảnh thực tế để cảm nhận không gian thay vì chỉ đọc giới thiệu.' },
                                        { title: 'Mức chi phí', body: 'Đừng chỉ nhìn mức giá tối đa. Hãy xem điểm giá khởi điểm để bắt đầu nhanh.' },
                                        { title: 'Phù hợp mục tiêu', body: 'Các thẻ như người mới, ưu tiên nữ giới hay dân thể thao giúp loại bớt lựa chọn sai.' },
                                    ].map((item) => (
                                        <div key={item.title} className="rounded-lg border border-[color:var(--mk-line)] bg-white/70 p-4">
                                            <div className="text-sm font-black tracking-[-0.03em] text-[color:var(--mk-text)]">{item.title}</div>
                                            <p className="mt-2 text-sm leading-6 text-[color:var(--mk-muted)]">{item.body}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </>
    );
};

export default Gyms;
