import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trainerService, type TrainerFilters } from '../services/trainerService';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronDown } from 'lucide-react';
import { SPECIALTY_CATEGORIES } from '../data/coachSpecialtyTaxonomy';
import { CoachDirectoryCard, type CoachDirectoryTrainer } from '../components/coaches/CoachDirectoryCard';
import '../styles/marketplace.css';
import { useMobileReducedEffects } from '../hooks/useMobileReducedEffects';

const SORT_OPTIONS: { value: TrainerFilters['sort']; label: string }[] = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'rating_desc', label: 'Đánh giá cao' },
    { value: 'views_desc', label: 'Được xem nhiều' },
    { value: 'price_asc', label: 'Giá tăng dần' },
    { value: 'price_desc', label: 'Giá giảm dần' },
];

const PRICE_RANGES = [
    { label: 'Tất cả', min: undefined, max: undefined },
    { label: 'Dưới 1 triệu', min: undefined, max: 1_000_000 },
    { label: '1–2 triệu', min: 1_000_000, max: 2_000_000 },
    { label: '2–5 triệu', min: 2_000_000, max: 5_000_000 },
    { label: 'Trên 5 triệu', min: 5_000_000, max: undefined },
] as const;

const COACH_CITIES: { value: string; label: string }[] = [
    { value: '', label: 'Toàn quốc' },
    { value: 'Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
    { value: 'Hà Nội', label: 'Hà Nội' },
    { value: 'Đà Nẵng', label: 'Đà Nẵng' },
    { value: 'Khánh Hòa', label: 'Khánh Hòa' },
    { value: 'Cần Thơ', label: 'Cần Thơ' },
];

function useDebouncedValue<T>(value: T, ms: number): T {
    const [d, setD] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setD(value), ms);
        return () => clearTimeout(t);
    }, [value, ms]);
    return d;
}

function parsePage(p: string | null): number {
    const n = parseInt(p || '1', 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
}

function parsePriceIdx(p: string | null): number {
    const n = parseInt(p || '0', 10);
    return n >= 0 && n < PRICE_RANGES.length ? n : 0;
}

function parseSort(s: string | null): TrainerFilters['sort'] {
    const allowed = SORT_OPTIONS.map((o) => o.value);
    return (allowed.includes(s as TrainerFilters['sort']) ? s : 'newest') as TrainerFilters['sort'];
}

function FiltersBlock({
    currentType,
    specialty,
    setSpecialty,
    priceIdx,
    setPriceIdx,
    city,
    setCity,
    resetFilters,
    hasActiveFilters,
    sort,
    setSort,
    showSortInBlock,
}: {
    currentType: 'trainer' | 'athlete';
    specialty: string;
    setSpecialty: (s: string) => void;
    priceIdx: number;
    setPriceIdx: (i: number) => void;
    city: string;
    setCity: (c: string) => void;
    resetFilters: () => void;
    hasActiveFilters: boolean;
    sort?: TrainerFilters['sort'];
    setSort?: (s: TrainerFilters['sort']) => void;
    showSortInBlock?: boolean;
}) {
    const preferredExpandedId = useMemo(() => {
        if (!specialty) return 'strength';
        const cat = SPECIALTY_CATEGORIES.find((c) => c.items.includes(specialty));
        return cat?.id ?? 'strength';
    }, [specialty]);

    const [expandedCatId, setExpandedCatId] = useState(preferredExpandedId);
    useEffect(() => {
        setExpandedCatId(preferredExpandedId);
    }, [preferredExpandedId]);

    const toggleCategory = (catId: string) => {
        setExpandedCatId((prev) => (prev === catId ? '' : catId));
    };

    return (
        <div className="space-y-6">
            {showSortInBlock && sort !== undefined && setSort && (
                <div>
                    <label htmlFor="coaches-sort-mobile" className="marketplace-section-kicker mb-2 block">
                        Sắp xếp
                    </label>
                    <select
                        id="coaches-sort-mobile"
                        className="form-input coaches-dir-control w-full py-2.5 text-sm font-semibold"
                        value={sort}
                        onChange={(e) => setSort(e.target.value as TrainerFilters['sort'])}
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div>
                <p className="marketplace-section-kicker mb-2">Chuyên môn</p>
                <div className="space-y-2">
                    <button
                        type="button"
                        className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-colors ${
                            !specialty
                                ? 'border-gray-900 bg-gray-900 text-white'
                                : 'border-gray-200 bg-white text-gray-900 hover:border-gray-900/30'
                        }`}
                        onClick={() => setSpecialty('')}
                    >
                        Tất cả chuyên môn
                    </button>
                    {SPECIALTY_CATEGORIES.map((cat) => {
                        const isOpen = expandedCatId === cat.id;
                        return (
                            <div
                                key={cat.id}
                                className="rounded-lg border border-gray-200 bg-gray-50"
                            >
                                <button
                                    type="button"
                                    id={`coaches-filter-${cat.id}`}
                                    aria-expanded={isOpen}
                                    aria-controls={`coaches-filter-panel-${cat.id}`}
                                    className="flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-100/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/15 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50"
                                    onClick={() => toggleCategory(cat.id)}
                                >
                                    <span className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-bold text-gray-900">{cat.label}</span>
                                        <ChevronDown
                                            className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 ${
                                                isOpen ? 'rotate-180' : ''
                                            }`}
                                            aria-hidden
                                        />
                                    </span>
                                    <span className="mt-0.5 block text-xs font-normal font-body text-gray-500">
                                        {cat.description}
                                    </span>
                                </button>
                                <div
                                    id={`coaches-filter-panel-${cat.id}`}
                                    role="region"
                                    aria-labelledby={`coaches-filter-${cat.id}`}
                                    hidden={!isOpen}
                                    className={isOpen ? 'border-t border-gray-200' : undefined}
                                >
                                    {isOpen ? (
                                        <div className="flex flex-wrap gap-1.5 px-3 py-3">
                                            {cat.items.map((item) => (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                                                        specialty === item
                                                            ? 'border-gray-900 bg-gray-900 text-white'
                                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-900/25'
                                                    }`}
                                                    onClick={() => setSpecialty(specialty === item ? '' : item)}
                                                >
                                                    {item}
                                                </button>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div>
                <label htmlFor="coaches-filter-city" className="marketplace-section-kicker mb-2 block">
                    Khu vực
                </label>
                <select
                    id="coaches-filter-city"
                    className="form-input coaches-dir-control w-full py-2.5 text-sm"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                >
                    {COACH_CITIES.map((c) => (
                        <option key={c.label} value={c.value}>
                            {c.label}
                        </option>
                    ))}
                </select>
            </div>

            {currentType === 'trainer' && (
                <div>
                    <p className="marketplace-section-kicker mb-2">Mức giá / tháng</p>
                    <div className="flex flex-col gap-1.5">
                        {PRICE_RANGES.map((r, idx) => (
                            <button
                                key={r.label}
                                type="button"
                                className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors ${
                                    priceIdx === idx
                                        ? 'border-gray-900 bg-gray-900 text-white'
                                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-900/30'
                                }`}
                                onClick={() => setPriceIdx(idx)}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {hasActiveFilters && (
                <button
                    type="button"
                    className="text-sm font-semibold text-red-600 underline underline-offset-2 hover:no-underline"
                    onClick={resetFilters}
                >
                    Xoá tất cả bộ lọc
                </button>
            )}
        </div>
    );
}

export default function Coaches() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentType = searchParams.get('type') === 'athlete' ? 'athlete' : 'trainer';

    const specialty = searchParams.get('specialty') || '';
    const city = searchParams.get('city') || '';
    const sort = parseSort(searchParams.get('sort'));
    const page = parsePage(searchParams.get('page'));
    const priceIdx = parsePriceIdx(searchParams.get('price'));

    const [qInput, setQInput] = useState(() => searchParams.get('q') || '');
    const debouncedQ = useDebouncedValue(qInput, 380);

    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const filtersSidebarRef = useRef<HTMLElement>(null);
    const reducedEffects = useMobileReducedEffects();
    const PAGE_SIZE = reducedEffects ? 8 : 12;
    const quickCategories = reducedEffects ? SPECIALTY_CATEGORIES.slice(0, 4) : SPECIALTY_CATEGORIES;

    const priceRange = PRICE_RANGES[priceIdx];

    const patchParams = useCallback(
        (updates: {
            q?: string;
            specialty?: string;
            city?: string;
            priceIdx?: number;
            sort?: TrainerFilters['sort'];
            page?: number;
            type?: 'trainer' | 'athlete' | 'clear_type';
        }) => {
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    if (updates.type === 'athlete') next.set('type', 'athlete');
                    if (updates.type === 'trainer' || updates.type === 'clear_type') next.delete('type');

                    if (updates.q !== undefined) {
                        if (updates.q) next.set('q', updates.q);
                        else next.delete('q');
                    }
                    if (updates.specialty !== undefined) {
                        if (updates.specialty) next.set('specialty', updates.specialty);
                        else next.delete('specialty');
                    }
                    if (updates.city !== undefined) {
                        if (updates.city) next.set('city', updates.city);
                        else next.delete('city');
                    }
                    if (updates.priceIdx !== undefined) {
                        if (updates.priceIdx === 0) next.delete('price');
                        else next.set('price', String(updates.priceIdx));
                    }
                    if (updates.sort !== undefined) {
                        if (updates.sort === 'newest') next.delete('sort');
                        else next.set('sort', updates.sort);
                    }
                    if (updates.page !== undefined) {
                        if (updates.page <= 1) next.delete('page');
                        else next.set('page', String(updates.page));
                    }
                    return next;
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    useEffect(() => {
        const urlQ = searchParams.get('q') || '';
        if (urlQ !== debouncedQ) {
            patchParams({ q: debouncedQ, page: 1 });
        }
    }, [debouncedQ, patchParams, searchParams]);

    const searchForQuery = searchParams.get('q') || '';

    const filters: TrainerFilters = useMemo(
        () => ({
            search: searchForQuery || undefined,
            specialty: specialty || undefined,
            priceMin: priceRange.min,
            priceMax: priceRange.max,
            sort,
            user_type: currentType,
            city: city || undefined,
        }),
        [searchForQuery, specialty, priceRange.min, priceRange.max, sort, currentType, city]
    );

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['trainers', page, PAGE_SIZE, filters],
        queryFn: () => trainerService.getTrainers(page, PAGE_SIZE, filters),
        staleTime: 60000,
    });

    const totalPages = data?.totalPages ?? 1;
    const totalCount = data?.total ?? 0;
    const hasActiveFilters =
        !!specialty || priceIdx !== 0 || sort !== 'newest' || !!city || !!searchForQuery;

    const resetFilters = () => {
        setQInput('');
        patchParams({
            q: '',
            specialty: '',
            city: '',
            priceIdx: 0,
            sort: 'newest',
            page: 1,
        });
    };

    const setSpecialty = (s: string) => {
        patchParams({ specialty: s, page: 1 });
    };
    const setPriceIdx = (i: number) => {
        patchParams({ priceIdx: i, page: 1 });
    };
    const setCity = (c: string) => {
        patchParams({ city: c, page: 1 });
    };
    const setSort = (s: TrainerFilters['sort']) => {
        patchParams({ sort: s, page: 1 });
    };
    const setPage = (p: number) => {
        patchParams({ page: p });
    };

    const canonical =
        currentType === 'athlete'
            ? 'https://gymerviet.com/coaches?type=athlete'
            : 'https://gymerviet.com/coaches';

    return (
        <main className="marketplace-shell min-h-screen pb-24">
            <Helmet>
                <title>{currentType === 'athlete' ? 'Khám phá Vận động viên' : 'Khám phá Coach'} — GYMERVIET</title>
                <meta
                    name="description"
                    content={
                        currentType === 'athlete'
                            ? 'Khám phá hồ sơ và hành trình của các vận động viên chuyên nghiệp trên GYMERVIET.'
                            : 'Tìm huấn luyện viên cá nhân theo chuyên môn, mức giá, khu vực và phong cách đồng hành phù hợp với mục tiêu tập luyện của bạn.'
                    }
                />
                <link rel="canonical" href={canonical} />
                <meta property="og:type" content="website" />
                <meta
                    property="og:title"
                    content={`${currentType === 'athlete' ? 'Khám phá Vận động viên' : 'Khám phá Coach'} — GYMERVIET`}
                />
                <meta property="og:url" content={canonical} />
                <meta property="og:image" content="https://gymerviet.com/og-default.jpg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@gymerviet" />
            </Helmet>

            <div className="marketplace-container pt-6 md:pt-8">
                <section className="mb-8 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] lg:items-start lg:gap-10">
                    <div>
                        <div className="mb-5 flex w-max max-w-full flex-wrap gap-1 rounded-full border border-gray-200 bg-gray-50 p-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setQInput('');
                                    setSearchParams(new URLSearchParams(), { replace: true });
                                }}
                                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                                    currentType === 'trainer'
                                        ? 'bg-gray-900 text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                Coach
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setQInput('');
                                    setSearchParams(new URLSearchParams({ type: 'athlete' }), { replace: true });
                                }}
                                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                                    currentType === 'athlete'
                                        ? 'bg-gray-900 text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                Vận động viên
                            </button>
                        </div>

                        <p className="marketplace-section-kicker">
                            {currentType === 'athlete' ? 'Danh mục Vận động viên' : 'Danh mục Coach'}
                        </p>
                        <h1 className="marketplace-title mt-1 max-w-3xl text-balance">
                            {currentType === 'athlete' ? 'Khám phá Vận động viên' : 'Khám phá Coach'}
                        </h1>
                        <p className="marketplace-lead mt-3 max-w-2xl">
                            {currentType === 'athlete'
                                ? 'Kết nối với những cá nhân đam mê rèn luyện và chia sẻ hành trình thay đổi vóc dáng.'
                                : 'Lọc theo nhóm chuyên môn, khu vực và ngân sách — rồi mở hồ sơ để xem phong cách đồng hành có hợp bạn không.'}
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                                Gợi ý nhanh:
                            </span>
                            {quickCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-900 transition hover:border-gray-900/35"
                                    onClick={() => setSpecialty(cat.shortcutSpecialty)}
                                >
                                    {cat.label}
                                </button>
                            ))}
                            <button
                                type="button"
                                className="rounded-full border border-dashed border-gray-500/50 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-gray-900/30 hover:text-gray-900"
                                onClick={() => {
                                    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
                                        filtersSidebarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    } else {
                                        setShowMobileFilters(true);
                                        requestAnimationFrame(() => {
                                            document
                                                .getElementById('coaches-mobile-filters-panel')
                                                ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                        });
                                    }
                                }}
                            >
                                Tất cả nhóm
                            </button>
                        </div>
                    </div>

                    <aside className="marketplace-panel rounded-xl p-5 shadow-sm ring-1 ring-gray-900/[0.06] sm:p-6">
                        <p className="marketplace-section-kicker">Tổng quan</p>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900 tabular-nums">
                            {!isLoading && !isError ? totalCount.toLocaleString('vi-VN') : '—'}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            {currentType === 'athlete' ? 'VĐV khớp bộ lọc' : 'Coach khớp bộ lọc'}
                        </p>
                        <div className="mt-4 flex flex-col gap-2 border-t border-gray-200 pt-4">
                            <Link
                                to="/register"
                                className="btn-primary inline-flex justify-center px-4 py-2.5 text-center text-sm font-bold uppercase tracking-[0.12em]"
                            >
                                Tạo hồ sơ
                            </Link>
                            <Link
                                to="/faq"
                                className="text-center text-sm font-semibold text-gray-900 underline underline-offset-4 hover:no-underline"
                            >
                                Câu hỏi thường gặp
                            </Link>
                        </div>
                    </aside>
                </section>

                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
                    <div className="relative min-w-0 flex-1 sm:max-w-xl">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="search"
                            className="form-input coaches-dir-control w-full pl-10"
                            placeholder="Tìm theo tên, chuyên môn hoặc từ khóa..."
                            aria-label="Tìm kiếm Coach và VĐV"
                            value={qInput}
                            onChange={(e) => setQInput(e.target.value)}
                        />
                    </div>

                    <button
                        type="button"
                        className={`flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition-colors sm:w-auto lg:hidden ${
                            showMobileFilters || hasActiveFilters
                                ? 'border-gray-900 bg-gray-900 text-white'
                                : 'border-gray-200 bg-gray-50 text-gray-900 shadow-sm'
                        }`}
                        onClick={() => setShowMobileFilters((v) => !v)}
                    >
                        Bộ lọc
                        {hasActiveFilters && <span className="rounded-full bg-white/20 px-1.5 text-xs">•</span>}
                    </button>

                    <label htmlFor="coaches-sort-desktop" className="sr-only">
                        Sắp xếp kết quả
                    </label>
                    <select
                        id="coaches-sort-desktop"
                        className="form-input coaches-dir-control hidden min-w-[10rem] py-2.5 text-sm font-semibold lg:block lg:w-auto"
                        value={sort}
                        onChange={(e) => setSort(e.target.value as TrainerFilters['sort'])}
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </div>

                {showMobileFilters && (
                    <div
                        id="coaches-mobile-filters-panel"
                        className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 lg:hidden"
                    >
                        <FiltersBlock
                            currentType={currentType}
                            specialty={specialty}
                            setSpecialty={setSpecialty}
                            priceIdx={priceIdx}
                            setPriceIdx={setPriceIdx}
                            city={city}
                            setCity={setCity}
                            resetFilters={resetFilters}
                            hasActiveFilters={hasActiveFilters}
                            sort={sort}
                            setSort={setSort}
                            showSortInBlock
                        />
                    </div>
                )}

                <div className="grid gap-8 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] lg:items-start">
                    {!reducedEffects && (
                        <aside ref={filtersSidebarRef} id="coaches-filters-sidebar" className="hidden lg:block">
                            <div className="sticky top-[calc(var(--header-height,56px)+1rem)] rounded-xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
                                <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-gray-500">
                                    Lọc chi tiết
                                </h2>
                                <FiltersBlock
                                    currentType={currentType}
                                    specialty={specialty}
                                    setSpecialty={setSpecialty}
                                    priceIdx={priceIdx}
                                    setPriceIdx={setPriceIdx}
                                    city={city}
                                    setCity={setCity}
                                    resetFilters={resetFilters}
                                    hasActiveFilters={hasActiveFilters}
                                />
                            </div>
                        </aside>
                    )}

                    <div>
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
                            <span>
                                {isLoading
                                    ? 'Đang tải…'
                                    : `${(data?.trainers.length ?? 0).toLocaleString('vi-VN')} hồ sơ trên trang ${page}`}
                            </span>
                            {totalCount > 0 && (
                                <span className="tabular-nums">
                                    Tổng {totalCount.toLocaleString('vi-VN')} khớp lọc
                                </span>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                                    >
                                        <div className="aspect-[4/3] animate-pulse bg-gray-100" />
                                        <div className="space-y-3 p-4">
                                            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200/40" />
                                            <div className="h-3 w-full animate-pulse rounded bg-gray-200/30" />
                                            <div className="h-3 w-5/6 animate-pulse rounded bg-gray-200/30" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : isError ? (
                            <div className="marketplace-panel marketplace-empty text-center">
                                <p className="mb-4 text-sm font-medium text-red-600">Đã xảy ra lỗi khi tải dữ liệu.</p>
                                <button type="button" onClick={() => refetch()} className="btn-primary px-5 py-2 text-sm">
                                    Thử lại
                                </button>
                            </div>
                        ) : data?.trainers.length === 0 ? (
                            <div className="marketplace-panel marketplace-empty mx-auto max-w-lg text-center">
                                <p className="text-base font-semibold text-gray-900">Chưa có hồ sơ phù hợp.</p>
                                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                                    {hasActiveFilters
                                        ? 'Thử nới lỏng bộ lọc hoặc quay lại danh sách mặc định — đôi khi chỉ cần bỏ một điều kiện là đủ lựa chọn mới xuất hiện.'
                                        : 'Danh sách đang trống hoặc chưa có hồ sơ công khai trong mục này. Bạn có thể tạo hồ sơ của riêng mình hoặc quay lại sau.'}
                                </p>
                                <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                                    {hasActiveFilters ? (
                                        <>
                                            <button
                                                type="button"
                                                className="btn-primary px-5 py-2.5 text-sm font-bold"
                                                onClick={resetFilters}
                                            >
                                                Xoá bộ lọc
                                            </button>
                                            <Link
                                                to={currentType === 'athlete' ? '/coaches?type=athlete' : '/coaches'}
                                                className="btn-secondary px-5 py-2.5 text-center text-sm font-bold"
                                            >
                                                {currentType === 'athlete'
                                                    ? 'Về danh sách VĐV (mặc định)'
                                                    : 'Về danh sách Coach (mặc định)'}
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                to={currentType === 'athlete' ? '/coaches?type=athlete' : '/coaches'}
                                                className="btn-secondary px-5 py-2.5 text-center text-sm font-bold"
                                            >
                                                {currentType === 'athlete'
                                                    ? 'Về danh sách VĐV (mặc định)'
                                                    : 'Về danh sách Coach (mặc định)'}
                                            </Link>
                                            <Link to="/register" className="btn-primary px-5 py-2.5 text-center text-sm font-bold">
                                                Tạo hồ sơ
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="coaches-grid grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                    {(data?.trainers as CoachDirectoryTrainer[]).map((trainer, index) => (
                                        <CoachDirectoryCard
                                            key={trainer.id}
                                            trainer={trainer}
                                            index={index}
                                            reducedEffects={reducedEffects}
                                        />
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="mt-10 flex items-center justify-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setPage(Math.max(1, page - 1))}
                                            disabled={page === 1}
                                            className="btn-secondary px-4 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            ← Trang trước
                                        </button>
                                        <span className="min-w-[5rem] text-center text-sm tabular-nums text-gray-500">
                                            {page} / {totalPages}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                                            disabled={page === totalPages}
                                            className="btn-secondary px-4 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Trang sau →
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
