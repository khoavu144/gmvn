import React, { useMemo, useState, lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Filter, LayoutGrid, List } from 'lucide-react';
import GymCard from '../components/GymCard';
import { gymService } from '../services/gymService';
import type { GymCenter } from '../types';

const GymMapView = lazy(() => import('../components/GymMapView'));

type ViewMode = 'grid' | 'list' | 'map';
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

/** The three editorial categories we always show */
const EDITORIAL_CATEGORIES = [
    {
        slug: 'fitness_club',
        label: 'Fitness Club',
        desc: 'Không gian tập đầy đủ thiết bị cho người muốn ghé đều, tắm rửa và biến việc tập thành thói quen lành mạnh.',
        accent: 'from-[#1a1a1a] to-[#3a2e22]',
    },
    {
        slug: 'pilates_studio',
        label: 'Pilates Studio',
        desc: 'Reformer rộng rãi, giáo viên sửa form sát, không khí nhỏ gọn và chuyên biệt — không bị xô bồ.',
        accent: 'from-[#1e2a1e] to-[#2d4a2d]',
    },
    {
        slug: 'yoga_studio',
        label: 'Yoga Studio',
        desc: 'Phòng yoga thiết kế cho cảm giác tĩnh lặng — ánh sáng tự nhiên, sàn gỗ, lớp nhỏ.',
        accent: 'from-[#1e1a2a] to-[#2e2845]',
    },
] as const;

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

// ─── Category Strip (2:1:1 layout) ───────────────────────────────────────────

interface CategoryStripProps {
    label: string;
    desc: string;
    accent: string;
    items: GymCenter[];
    onFilter: (slug: string) => void;
    slug: string;
}

const CategoryStrip: React.FC<CategoryStripProps> = ({ label, desc, accent, items, onFilter, slug }) => {
    if (items.length === 0) return null;

    const [primary, ...rest] = items;
    const secondaries = rest.slice(0, 2);

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <div className="marketplace-section-kicker">Phân loại</div>
                    <h2 className="marketplace-section-title mt-0.5">{label}</h2>
                </div>
                <p className="hidden md:block max-w-[40%] text-sm text-[color:var(--mk-muted)] leading-relaxed text-right">{desc}</p>
                <button
                    type="button"
                    onClick={() => onFilter(slug)}
                    className="shrink-0 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--mk-text)] border-b border-[color:var(--mk-text)] pb-0.5 hover:opacity-70 transition-opacity whitespace-nowrap"
                >
                    Xem tất cả →
                </button>
            </div>

            {/* 2 : 1 : 1 grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:grid-rows-1">
                {/* Primary — spans 2 columns */}
                <div className="sm:col-span-2 lg:col-span-2">
                    <GymCard gym={primary} variant="featured" index={0} />
                </div>

                {/* Two compact cards stacked in 1 column each */}
                {secondaries.map((gym, idx) => (
                    <div key={gym.id}>
                        <GymCard gym={gym} variant="compact" index={idx + 1} />
                    </div>
                ))}

                {/* Filler placeholder when only 1 secondary */}
                {secondaries.length === 1 && (
                    <div className={`hidden lg:flex flex-col items-center justify-center rounded-xl bg-gradient-to-br ${accent} p-6 text-white/70 text-sm text-center gap-3`}>
                        <div className="text-2xl font-bold text-white/20">{label.slice(0, 2)}</div>
                        <p className="text-xs leading-relaxed">{desc}</p>
                        <button
                            type="button"
                            onClick={() => onFilter(slug)}
                            className="mt-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-white/80 hover:bg-white/20 transition"
                        >
                            Khám phá thêm
                        </button>
                    </div>
                )}

                {/* Both placeholders when no secondaries */}
                {secondaries.length === 0 && (
                    <>
                        {[0, 1].map((i) => (
                            <div key={i} className={`hidden lg:flex flex-col items-center justify-center rounded-xl bg-gradient-to-br ${accent} p-6 text-white/70 text-sm text-center`}>
                                <div className="text-[0.65rem] uppercase tracking-widest">Sắp có</div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

// ─── Main page ─────────────────────────────────────────────────────────────────

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

    /** Top 3 featured cards for the hero */
    const featuredGyms = useMemo(() => gyms.slice(0, 3), [gyms]);
    /** Remaining gyms for the all-results section */
    const standardGyms = useMemo(() => gyms.slice(3), [gyms]);

    /** Per-category buckets for the editorial strips */
    const categoryBuckets = useMemo(() => {
        const buckets = new Map<string, GymCenter[]>();
        EDITORIAL_CATEGORIES.forEach((cat) => buckets.set(cat.slug, []));

        gyms.forEach((gym) => {
            const slug = gym.primary_venue_type_slug || '';
            if (buckets.has(slug)) {
                const arr = buckets.get(slug)!;
                if (arr.length < 3) arr.push(gym);
            }
        });

        return buckets;
    }, [gyms]);

    const hasFilters = Boolean(searchTerm || cityFilter || districtFilter || venueType || audienceTag);
    const showEditorialSections = !hasFilters && viewMode === 'grid';
    const resultsGyms = showEditorialSections ? standardGyms : gyms;
    const showResultsSection = !showEditorialSections || standardGyms.length > 0;

    const handleFilterByCategory = (slug: string) => {
        setVenueType(slug);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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

                {/* ── Hero ──────────────────────────────────────────────────────────── */}
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
                                    <strong>{EDITORIAL_CATEGORIES.length}</strong>
                                    <span>Loại hình chọn lọc</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Filter bar ───────────────────────────────────────────────────── */}
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
                                        className={`w-full h-11 px-4 flex items-center justify-center gap-2 rounded-lg border font-bold text-sm transition-colors ${showAdvancedFilters ? 'bg-black text-white border-black' : 'bg-white text-[color:var(--mk-text)] border-[color:var(--mk-line)] hover:border-[color:var(--mk-text)]'}`}
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

                            {/* View toggle + Reset */}
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                {/* View mode toggle: Grid | List | Map */}
                                <div className="inline-flex overflow-hidden rounded-lg border border-[color:var(--mk-line)] bg-white/70 p-1">
                                    <button
                                        type="button"
                                        title="Dạng lưới"
                                        onClick={() => setViewMode('grid')}
                                        className={`rounded-md px-3 py-2 transition flex items-center gap-1.5 text-xs font-bold ${viewMode === 'grid' ? 'bg-[color:var(--mk-text)] text-white' : 'text-[color:var(--mk-text-soft)]'}`}
                                    >
                                        <LayoutGrid className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline uppercase tracking-[0.14em]">Lưới</span>
                                    </button>
                                    <button
                                        type="button"
                                        title="Dạng danh sách"
                                        onClick={() => setViewMode('list')}
                                        className={`rounded-md px-3 py-2 transition flex items-center gap-1.5 text-xs font-bold ${viewMode === 'list' ? 'bg-[color:var(--mk-text)] text-white' : 'text-[color:var(--mk-text-soft)]'}`}
                                    >
                                        <List className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline uppercase tracking-[0.14em]">Danh sách</span>
                                    </button>
                                    <button
                                        type="button"
                                        title="Bản đồ"
                                        onClick={() => setViewMode('map')}
                                        className={`rounded-md px-3 py-2 transition text-xs font-bold uppercase tracking-[0.14em] ${viewMode === 'map' ? 'bg-[color:var(--mk-text)] text-white' : 'text-[color:var(--mk-text-soft)]'}`}
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
                                        ✕ Xóa bộ lọc
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Main content ─────────────────────────────────────────────────── */}
                <section className="marketplace-container mt-6 space-y-10">
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
                            {/* ── Featured hero (2:1:1) — only in grid mode & no active filters ── */}
                            {showEditorialSections && featuredGyms.length > 0 && (
                                <div className="space-y-4">
                                    <div className="marketplace-results-head">
                                        <div>
                                            <div className="marketplace-section-kicker">Lựa chọn Nổi bật</div>
                                            <h2 className="marketplace-section-title">Những không gian đang được chọn nhiều tuần này</h2>
                                        </div>
                                        <div className="marketplace-results-meta">
                                            Hình ảnh thực tế, giá khởi điểm rõ ràng, mô tả chân thực.
                                        </div>
                                    </div>

                                    {/* 2 : 1 : 1 hero grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Primary featured — takes 2 columns */}
                                        <div className="sm:col-span-2 lg:col-span-2">
                                            <GymCard gym={featuredGyms[0]} variant="featured" index={0} />
                                        </div>
                                        {/* Two compact secondaries — 1 column each */}
                                        {featuredGyms.slice(1, 3).map((gym, idx) => (
                                            <GymCard key={gym.id} gym={gym} variant="compact" index={idx + 1} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Editorial category strips (only when no venue-type filter active) ── */}
                            {showEditorialSections && (
                                <div className="space-y-10">
                                    {EDITORIAL_CATEGORIES.map((cat) => {
                                        const items = categoryBuckets.get(cat.slug) || [];
                                        return (
                                            <CategoryStrip
                                                key={cat.slug}
                                                slug={cat.slug}
                                                label={cat.label}
                                                desc={cat.desc}
                                                accent={cat.accent}
                                                items={items}
                                                onFilter={handleFilterByCategory}
                                            />
                                        );
                                    })}
                                </div>
                            )}

                            {showEditorialSections && showResultsSection && <div className="marketplace-divider" />}

                            {/* ── All results (grid or list) ───────────────────────────────── */}
                            {showResultsSection && (
                                <div className="space-y-4">
                                    <div className="marketplace-results-head">
                                        <div>
                                            <div className="marketplace-section-kicker">Tất cả Kết quả</div>
                                            <h2 className="marketplace-section-title">Tất cả lựa chọn phù hợp</h2>
                                        </div>
                                        <div className="marketplace-results-meta">
                                            {resultsGyms.length} cơ sở hiển thị · {venueType ? `lọc theo ${venueType}` : 'mọi loại hình'} · {cityFilter || 'toàn quốc'}
                                        </div>
                                    </div>

                                    {viewMode === 'list' ? (
                                        <div className="flex flex-col gap-2">
                                            {resultsGyms.map((gym, idx) => (
                                                <GymCard key={gym.id} gym={gym} variant="list" index={idx} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="marketplace-card-grid">
                                            {resultsGyms.map((gym, idx) => (
                                                <GymCard key={gym.id} gym={gym} variant="standard" index={idx} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* ── Editorial tip block ──────────────────────────────────────────── */}
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
                                            <div className="text-sm font-bold tracking-[-0.03em] text-[color:var(--mk-text)]">{item.title}</div>
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
