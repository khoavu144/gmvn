import { useState, useMemo, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trainerService, type TrainerFilters } from '../services/trainerService';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePrefetchProfile } from '../hooks/usePrefetchProfile';

// ─── Specialty Options ────────────────────────────────────────────────────────
const SPECIALTIES = [
    'Gym tổng hợp', 'Cardio', 'Yoga', 'Pilates', 'CrossFit', 'Boxing', 'Kickboxing',
    'Bodybuilding', 'Powerlifting', 'Calisthenics', 'Zumba', 'Stretching', 'Dinh dưỡng',
    'Phục hồi chức năng', 'HIIT', 'Muay Thai', 'Dance Fitness', 'Bơi lội',
];

const SORT_OPTIONS: { value: TrainerFilters['sort']; label: string }[] = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price_asc', label: 'Giá tăng dần' },
    { value: 'price_desc', label: 'Giá giảm dần' },
];

// ─── Price preset helpers ─────────────────────────────────────────────────────
const PRICE_RANGES = [
    { label: 'Tất cả', min: undefined, max: undefined },
    { label: 'Dưới 1 triệu', min: undefined, max: 1_000_000 },
    { label: '1–2 triệu', min: 1_000_000, max: 2_000_000 },
    { label: '2–5 triệu', min: 2_000_000, max: 5_000_000 },
    { label: 'Trên 5 triệu', min: 5_000_000, max: undefined },
];

const CoachCard = memo(({ trainer }: { trainer: any }) => {
    const { prefetchCoach, prefetchAthlete } = usePrefetchProfile();

    const detailLink = trainer.user_type === 'athlete'
        ? (trainer.profile_slug ? `/athlete/${trainer.profile_slug}` : `/athletes/${trainer.id}`)
        : (trainer.profile_slug ? `/coach/${trainer.profile_slug}` : `/coaches/${trainer.id}`);

    const handlePrefetch = () => {
        const identifier = trainer.profile_slug || trainer.id;
        if (trainer.user_type === 'athlete') prefetchAthlete(identifier);
        else prefetchCoach(identifier);
    };

    return (
        <Link 
            to={detailLink} 
            className="card group hover:border-black transition-colors flex flex-col cursor-pointer"
            onPointerEnter={handlePrefetch}
        >
            <div className="flex items-center gap-4 mb-4">
                <div className="shrink-0">
                    {trainer.avatar_url ? (
                        <img className="w-16 h-16 rounded-xs object-cover border border-gray-200 transition-all" src={trainer.avatar_url} alt={trainer.full_name} fetchPriority="low" loading="lazy" decoding="async" />
                    ) : (
                        <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-xs flex items-center justify-center text-gray-400 text-xl font-bold uppercase">
                            {trainer.full_name.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="min-w-0">
                    <h3 className="text-base font-bold text-black truncate">{trainer.full_name}</h3>
                    <p className="text-sm font-medium text-gray-700 mt-0.5">
                        {trainer.base_price_monthly ? `${trainer.base_price_monthly.toLocaleString('vi-VN')} ₫/tháng` : 'Liên hệ báo giá'}
                    </p>
                    <div className="flex items-center text-[10px] font-black text-black bg-gray-100 px-1.5 py-0.5 rounded-sm mt-1 w-fit">
                        ★ {trainer.avg_rating?.toFixed(1) || '5.0'}
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-3 flex-1 mb-4">
                {trainer.bio || 'Chưa có thông tin giới thiệu.'}
            </p>

            {trainer.specialties && trainer.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {trainer.specialties.slice(0, 3).map((spec: string) => (
                        <span key={spec} className="inline-flex py-0.5 px-2 bg-gray-100 border border-gray-200 text-gray-700 text-xs font-medium rounded-xs">
                            {spec}
                        </span>
                    ))}
                    {trainer.specialties.length > 3 && (
                        <span className="inline-flex py-0.5 px-2 bg-gray-50 border border-gray-200 text-gray-500 text-xs font-medium rounded-xs">
                            +{trainer.specialties.length - 3}
                        </span>
                    )}
                </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm font-medium text-black">
                Xem hồ sơ chi tiết
                <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
        </Link>
    );
});
CoachCard.displayName = 'CoachCard';

export default function Coaches() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentType = searchParams.get('type') === 'athlete' ? 'athlete' : 'trainer';

    const [search, setSearch] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [priceIdx, setPriceIdx] = useState(0);
    const [sort, setSort] = useState<TrainerFilters['sort']>('newest');
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const PAGE_SIZE = 12;

    const priceRange = PRICE_RANGES[priceIdx];

    const filters: TrainerFilters = useMemo(() => ({
        search: search || undefined,
        specialty: specialty || undefined,
        priceMin: priceRange.min,
        priceMax: priceRange.max,
        sort,
        user_type: currentType
    }), [search, specialty, priceRange.min, priceRange.max, sort, currentType]);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['trainers', page, filters],
        queryFn: () => trainerService.getTrainers(page, PAGE_SIZE, filters),
        staleTime: 60000,
    });

    const totalPages = data?.totalPages ?? 1;
    const hasActiveFilters = specialty || priceIdx !== 0 || sort !== 'newest';

    const resetFilters = () => {
        setSpecialty('');
        setPriceIdx(0);
        setSort('newest');
        setPage(1);
    };

    return (
        <main className="page-shell">
            <Helmet>
                <title>{currentType === 'athlete' ? 'Khám phá Vận động viên' : 'Khám phá Coach'} — GYMERVIET</title>
                <meta name="description" content={currentType === 'athlete' ? 'Khám phá hồ sơ và hành trình của các vận động viên chuyên nghiệp trên GYMERVIET.' : 'Tìm huấn luyện viên cá nhân theo chuyên môn, mức giá và phong cách đồng hành phù hợp với mục tiêu tập luyện của bạn.'} />
            </Helmet>
            <div className="page-container">
                <section className="page-header relative">
                    {/* Tab Switcher */}
                    <div className="flex bg-gray-100 p-1 rounded-full w-max mx-auto lg:mx-0 mb-6 border border-gray-200">
                        <button
                            onClick={() => { setSearchParams({}); setPage(1); }}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${currentType === 'trainer' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
                        >
                            Coach
                        </button>
                        <button
                            onClick={() => { setSearchParams({ type: 'athlete' }); setPage(1); }}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${currentType === 'athlete' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
                        >
                            Vận động viên
                        </button>
                    </div>

                    <p className="page-kicker">{currentType === 'athlete' ? 'Danh mục Vận động viên' : 'Danh mục Coach'}</p>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between -mt-2">
                        <div>
                            <h1 className="page-title">{currentType === 'athlete' ? 'Khám phá Vận động viên' : 'Khám phá Coach'}</h1>
                            <p className="page-description max-w-2xl text-left">
                                {currentType === 'athlete' 
                                    ? 'Kết nối với những cá nhân đam mê rèn luyện và chia sẻ hành trình thay đổi vóc dáng.'
                                    : 'Tìm huấn luyện viên theo chuyên môn, mức giá và phong cách đồng hành phù hợp với mục tiêu của bạn.'}
                            </p>
                        </div>
                        {!isLoading && !isError && (
                            <div className="text-sm text-gray-500 font-medium">
                                {data?.trainers.length ?? 0} kết quả ở trang này
                            </div>
                        )}
                    </div>
                </section>

                {/* Search + Filter toggle row */}
                <div className="flex gap-3 flex-wrap items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-xl">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            className="form-input pl-10 w-full"
                            placeholder="Tìm theo tên, chuyên môn hoặc từ khóa..."
                            aria-label="Tìm kiếm theo tên, chuyên môn hoặc từ khóa"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>

                    <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm transition-colors ${showFilters || hasActiveFilters ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-700 hover:border-black'}`}
                        onClick={() => setShowFilters(v => !v)}
                    >
                        Lọc {hasActiveFilters && <span className="bg-white text-black rounded-full w-4 h-4 text-xs flex items-center justify-center font-black">!</span>}
                    </button>

                    {/* Sort */}
                    <select
                        className="form-input py-2 text-sm font-medium"
                        value={sort}
                        onChange={e => { setSort(e.target.value as TrainerFilters['sort']); setPage(1); }}
                    >
                        {SORT_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                {/* ── Filter Panel ── */}
                {showFilters && (
                    <div className="mt-4 p-5 border border-gray-200 rounded-sm bg-gray-50 space-y-5">
                        {/* Specialty */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Chuyên môn</label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    className={`filter-chip ${!specialty ? 'filter-chip-active' : 'filter-chip-idle'}`}
                                    onClick={() => { setSpecialty(''); setPage(1); }}
                                    aria-pressed={!specialty}
                                >
                                    Tất cả
                                </button>
                                {SPECIALTIES.map(s => (
                                    <button
                                        key={s}
                                        className={`filter-chip ${specialty === s ? 'filter-chip-active' : 'filter-chip-idle'}`}
                                        onClick={() => { setSpecialty(specialty === s ? '' : s); setPage(1); }}
                                        aria-pressed={specialty === s}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price - Only for Coach */}
                        {currentType === 'trainer' && (
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Mức giá / tháng</label>
                                <div className="flex flex-wrap gap-2">
                                    {PRICE_RANGES.map((r, idx) => (
                                        <button
                                            key={r.label}
                                            className={`filter-chip ${priceIdx === idx ? 'filter-chip-active' : 'filter-chip-idle'}`}
                                            onClick={() => { setPriceIdx(idx); setPage(1); }}
                                            aria-pressed={priceIdx === idx}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {hasActiveFilters && (
                            <button className="text-sm text-red-600 font-medium hover:underline" onClick={resetFilters}>
                                ✕ Xoá tất cả bộ lọc
                            </button>
                        )}
                    </div>
                )}
                {/* ── Content ── */}
                {isLoading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="card border border-gray-100 flex flex-col">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-xs bg-gray-200 shrink-0"></div>
                                    <div className="w-full space-y-2">
                                        <div className="h-5 bg-gray-200 rounded-sm w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded-sm w-1/2"></div>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-4 flex-1">
                                    <div className="h-3 bg-gray-200 rounded-sm w-full"></div>
                                    <div className="h-3 bg-gray-200 rounded-sm w-5/6"></div>
                                    <div className="h-3 bg-gray-200 rounded-sm w-4/6"></div>
                                </div>
                                <div className="flex gap-2 mb-4">
                                    <div className="h-5 w-16 bg-gray-200 rounded-sm"></div>
                                    <div className="h-5 w-20 bg-gray-200 rounded-sm"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : isError ? (
                    <div className="empty-state p-8 text-center border-dashed border-red-200">
                        <p className="text-sm font-medium text-red-600 mb-4">Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.</p>
                        <button onClick={() => refetch()} className="text-xs font-bold text-black border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition">Thử lại</button>
                    </div>
                ) : data?.trainers.length === 0 ? (
                    <div className="empty-state text-sm text-gray-500">
                        <div className="empty-state-number">0</div>
                        <p className="text-sm font-medium text-gray-700">Chưa có dữ liệu phù hợp.</p>
                        {hasActiveFilters && (
                            <button className="mt-3 text-black font-bold underline" onClick={resetFilters}>Xoá bộ lọc</button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {data?.trainers.map((trainer: any) => (
                                <CoachCard key={trainer.id} trainer={trainer} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-10 flex items-center justify-center gap-3">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="btn-secondary px-4 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    ← Trang trước
                                </button>
                                <span className="text-sm tabular-nums text-gray-600 min-w-[80px] text-center">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="btn-secondary px-4 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Trang sau →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
