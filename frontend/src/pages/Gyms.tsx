import React, { useMemo, useState, lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Filter, LayoutGrid, List } from 'lucide-react';
import GymCard from '../components/GymCard';
import { gymService } from '../services/gymService';
import type { GymCenter } from '../types';
import { SITE_OG_IMAGE, absoluteUrl } from '../lib/site';

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
    items: GymCenter[];
    onFilter: (slug: string) => void;
    slug: string;
    /** Desktop only: alternate big card left / right between strips */
    reverseLayout?: boolean;
    /** Narrow column: one representative card + CTA (for 3-col editorial row) */
    layout?: 'strip' | 'column';
}

const CategoryStrip: React.FC<CategoryStripProps> = ({
    label,
    desc,
    items,
    onFilter,
    slug,
    reverseLayout = false,
    layout = 'strip',
}) => {
    if (items.length === 0) return null;

    const [primary, ...rest] = items;

    if (layout === 'column') {
        return (
            <div className="flex h-full min-h-0 flex-col space-y-3">
                <header className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-x-2">
                    <div className="min-w-0">
                        <div className="marketplace-section-kicker">Phân loại</div>
                        <h2 className="marketplace-section-title mt-0.5 text-base sm:text-lg">{label}</h2>
                        <p className="mt-1.5 text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-3">
                            {desc}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onFilter(slug)}
                        className="shrink-0 justify-self-start text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-gray-900 border-b border-gray-900 pb-0.5 hover:opacity-70 transition-opacity whitespace-nowrap md:pt-0.5"
                    >
                        Xem tất cả →
                    </button>
                </header>
                <div className="min-h-0 flex-1 flex flex-col">
                    <GymCard gym={primary} variant="standard" index={0} className="h-full min-h-0" />
                </div>
            </div>
        );
    }
    const secondaries = rest.slice(0, 2);
    const secCount = secondaries.length;

    const gridLg =
        secCount === 0 ? 'lg:grid-cols-1' : secCount === 1 ? 'lg:grid-cols-3' : 'lg:grid-cols-4';

    const primaryCell =
        secCount === 0
            ? 'h-full min-h-0 sm:col-span-2 lg:col-span-1 order-1'
            : secCount === 1
              ? reverseLayout
                  ? 'h-full min-h-0 sm:col-span-2 lg:col-span-2 lg:col-start-2 order-1 lg:order-2'
                  : 'h-full min-h-0 sm:col-span-2 lg:col-span-2 lg:col-start-1 order-1'
              : reverseLayout
                ? 'h-full min-h-0 sm:col-span-2 lg:col-span-2 lg:col-start-3 order-1 lg:order-3'
                : 'h-full min-h-0 sm:col-span-2 lg:col-span-2 lg:col-start-1 order-1';

    const secondaryCell = (idx: number) => {
        if (reverseLayout) {
            if (secCount >= 2) {
                return idx === 0
                    ? 'h-full min-h-0 order-2 lg:order-1 lg:col-start-1'
                    : 'h-full min-h-0 order-3 lg:order-2 lg:col-start-2';
            }
            return 'h-full min-h-0 order-2 lg:order-1 lg:col-start-1';
        }
        if (secCount === 1) {
            return 'h-full min-h-0 order-2 lg:col-start-3';
        }
        return idx === 0 ? 'h-full min-h-0 order-2' : 'h-full min-h-0 order-3';
    };

    return (
        <div className="space-y-3">
            <header className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-x-4">
                <div className="min-w-0">
                    <div className="marketplace-section-kicker">Phân loại</div>
                    <h2 className="marketplace-section-title mt-0.5">{label}</h2>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-prose">{desc}</p>
                </div>
                <button
                    type="button"
                    onClick={() => onFilter(slug)}
                    className="shrink-0 justify-self-start text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gray-900 border-b border-gray-900 pb-0.5 hover:opacity-70 transition-opacity whitespace-nowrap md:pt-1"
                >
                    Xem tất cả →
                </button>
            </header>

            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-rows-1 ${gridLg}`}>
                <div className={primaryCell}>
                    <GymCard gym={primary} variant="featured" index={0} />
                </div>

                {secondaries.map((gym, idx) => (
                    <div key={gym.id} className={secondaryCell(idx)}>
                        <GymCard gym={gym} variant="compact" index={idx + 1} />
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Main page ─────────────────────────────────────────────────────────────────

const Gyms: React.FC = () => {
    const canonicalUrl = absoluteUrl('/gyms');
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
                lite: true,
            });

            if (!response.success) {
                throw new Error(response.error || 'Lỗi tải marketplace gyms');
            }

            return response;
        },
        staleTime: 5 * 60 * 1000,
    });

    const gyms = useMemo(() => (data?.gyms || []) as GymCenter[], [data?.gyms]);
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
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Marketplace Phòng tập — GYMERVIET" />
                <meta
                    property="og:description"
                    content="Khám phá không gian tập luyện được biên tập: thumbnail, giá khởi điểm rõ ràng, trải nghiệm phù hợp từng mục tiêu."
                />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:image" content={SITE_OG_IMAGE} />
                <meta property="og:image:alt" content="GYMERVIET Gyms Marketplace" />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            <div className="marketplace-shell min-h-screen">
                <div className="gyms-marketplace">
                {/* ── Hero ──────────────────────────────────────────────────────────── */}
                <section className="marketplace-hero">
                    <div className="marketplace-container">
                        <div className="marketplace-hero-grid">
                            <div className="space-y-3 md:space-y-4 max-w-3xl">
                                <span className="marketplace-eyebrow">Editorial marketplace</span>
                                <div className="space-y-3 md:space-y-4">
                                    <h1 className="marketplace-title max-w-[20ch] sm:max-w-none">
                                        Chọn nơi tập bằng không gian, cảm giác và quyết định đúng.
                                    </h1>
                                    <p className="marketplace-lead">
                                        Gym, yoga, pilates và recovery — tìm không gian phù hợp với cách bạn muốn tập.
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
                        <div className="flex flex-col gap-3 md:gap-4">
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
                                        className={`w-full h-11 px-4 flex items-center justify-center gap-2 rounded-lg border font-bold text-sm transition-colors ${showAdvancedFilters ? 'bg-black text-white border-black' : 'bg-white text-gray-900 border-gray-200 hover:border-gray-900'}`}
                                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    >
                                        <Filter className="w-4 h-4" />
                                        Lọc thêm
                                    </button>
                                </div>
                            </div>

                            {/* Advanced Filters */}
                            {showAdvancedFilters && (
                                <div className="pt-4 border-t border-gray-200 animate-fade-in space-y-4">
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
                                <div className="inline-flex overflow-hidden rounded-lg border border-gray-200 bg-white/70 p-1">
                                    <button
                                        type="button"
                                        title="Dạng lưới"
                                        onClick={() => setViewMode('grid')}
                                        className={`rounded-md px-3 py-2 transition flex items-center gap-1.5 text-xs font-bold ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-600'}`}
                                    >
                                        <LayoutGrid className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline uppercase tracking-[0.14em]">Lưới</span>
                                    </button>
                                    <button
                                        type="button"
                                        title="Dạng danh sách"
                                        onClick={() => setViewMode('list')}
                                        className={`rounded-md px-3 py-2 transition flex items-center gap-1.5 text-xs font-bold ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-600'}`}
                                    >
                                        <List className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline uppercase tracking-[0.14em]">Danh sách</span>
                                    </button>
                                    <button
                                        type="button"
                                        title="Bản đồ"
                                        onClick={() => setViewMode('map')}
                                        className={`rounded-md px-3 py-2 transition text-xs font-bold uppercase tracking-[0.14em] ${viewMode === 'map' ? 'bg-gray-900 text-white' : 'text-gray-600'}`}
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
                <section className="marketplace-container mt-4 md:mt-6 space-y-6 md:space-y-8">
                    {isLoading ? (
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, idx) => (
                                <div key={idx}>
                                    <div className="marketplace-panel overflow-hidden animate-pulse">
                                        <div className="aspect-[4/3] bg-gray-100" />
                                        <div className="space-y-3 p-5">
                                            <div className="h-3 w-24 rounded-lg bg-gray-200" />
                                            <div className="h-7 w-3/4 rounded-lg bg-gray-200" />
                                            <div className="h-4 w-full rounded-lg bg-gray-200" />
                                            <div className="h-4 w-2/3 rounded-lg bg-gray-200" />
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
                            <Suspense fallback={<div className="h-[560px] animate-pulse rounded-lg bg-gray-100" />}>
                                <GymMapView gyms={gyms} />
                            </Suspense>
                        </div>
                    ) : gyms.length === 0 ? (
                        <div className="marketplace-panel marketplace-empty">
                            <strong>Không có venue khớp với bộ lọc này.</strong>
                            <p>
                                Thử nới rộng khu vực, bỏ bớt một filter hoặc chuyển sang loại hình khác như yoga,
                                pilates hoặc recovery để tìm thêm lựa chọn.
                            </p>
                            {(searchTerm || cityFilter || districtFilter || venueType || audienceTag) && (
                                <button
                                    type="button"
                                    onClick={() => { setSearchTerm(''); setCityFilter(''); setDistrictFilter(''); setVenueType(''); setAudienceTag(''); }}
                                    className="mt-4 btn-primary px-5 py-2 text-sm"
                                >
                                    Xoá bộ lọc
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* ── Featured hero (2:1:1) — only in grid mode & no active filters ── */}
                            {showEditorialSections && featuredGyms.length > 0 && (
                                <div className="rounded-xl border border-gray-200/90 bg-white p-4 md:p-5 shadow-sm">
                                    <div className="space-y-4">
                                        <div className="marketplace-results-head !mb-0">
                                            <div>
                                                <div className="marketplace-section-kicker">Lựa chọn Nổi bật</div>
                                                <h2 className="marketplace-section-title">Những không gian đang được chọn nhiều tuần này</h2>
                                            </div>
                                            <div className="marketplace-results-meta">
                                                Hình ảnh thực tế, giá khởi điểm rõ ràng, mô tả chân thực.
                                            </div>
                                        </div>

                                        {featuredGyms.length === 1 ? (
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="h-full min-h-0">
                                                    <GymCard gym={featuredGyms[0]} variant="featured" index={0} />
                                                </div>
                                            </div>
                                        ) : featuredGyms.length === 2 ? (
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                                                <div className="h-full min-h-0">
                                                    <GymCard gym={featuredGyms[0]} variant="featured" index={0} />
                                                </div>
                                                <div className="h-full min-h-0">
                                                    <GymCard gym={featuredGyms[1]} variant="compact" index={1} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-4">
                                                <div className="min-h-0">
                                                    <GymCard gym={featuredGyms[0]} variant="featured" index={0} />
                                                </div>
                                                <div className="flex min-h-0 flex-col gap-4 lg:h-full lg:min-h-0">
                                                    {featuredGyms.slice(1, 3).map((gym, idx) => (
                                                        <div
                                                            key={gym.id}
                                                            className="flex min-h-0 flex-1 flex-col basis-0"
                                                        >
                                                            <GymCard
                                                                gym={gym}
                                                                variant="compact"
                                                                index={idx + 1}
                                                                className="h-full min-h-0"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── Editorial category strips (only when no venue-type filter active) ── */}
                            {showEditorialSections && (
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-6">
                                    {EDITORIAL_CATEGORIES.map((cat, stripIdx) => {
                                        const items = categoryBuckets.get(cat.slug) || [];
                                        return (
                                            <div
                                                key={cat.slug}
                                                className={
                                                    stripIdx % 2 === 1
                                                        ? 'flex min-h-0 flex-col rounded-xl border border-gray-200/80 border-l-[3px] border-l-gray-900/18 bg-gray-50/50 p-4 md:p-5'
                                                        : 'flex min-h-0 flex-col rounded-xl border border-gray-200/70 bg-white/80 p-4 md:p-5'
                                                }
                                            >
                                                <CategoryStrip
                                                    slug={cat.slug}
                                                    label={cat.label}
                                                    desc={cat.desc}
                                                    items={items}
                                                    onFilter={handleFilterByCategory}
                                                    layout="column"
                                                />
                                            </div>
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
                    <section className="marketplace-container mt-6 md:mt-8">
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
                                        <div key={item.title} className="rounded-lg border border-gray-200 bg-white/70 p-4">
                                            <div className="text-sm font-bold tracking-[-0.03em] text-gray-900">{item.title}</div>
                                            <p className="mt-2 text-sm leading-6 text-gray-500">{item.body}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}
                </div>
            </div>
        </>
    );
};

export default Gyms;
