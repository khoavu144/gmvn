import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trainerService, type TrainerFilters } from '../services/trainerService';
import { Link } from 'react-router-dom';

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

export default function Coaches() {
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
    }), [search, specialty, priceRange.min, priceRange.max, sort]);

    const { data, isLoading, isError } = useQuery({
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
        <main className="max-w-7xl w-full mx-auto px-4 py-8 flex-1">
            {/* ── Header ── */}
            <div className="mb-8">
                <h1 className="text-h1 mb-6">Khám phá Coach</h1>

                {/* Search + Filter toggle row */}
                <div className="flex gap-3 flex-wrap items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-xl">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 text-sm">🔍</span>
                        </div>
                        <input
                            type="text"
                            className="form-input pl-10 w-full"
                            placeholder="Tìm theo tên, chuyên môn hoặc từ khóa..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>

                    <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm transition-colors ${showFilters || hasActiveFilters ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-700 hover:border-black'}`}
                        onClick={() => setShowFilters(v => !v)}
                    >
                        ⚡ Lọc {hasActiveFilters && <span className="bg-white text-black rounded-full w-4 h-4 text-xs flex items-center justify-center font-black">!</span>}
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
                    <div className="mt-4 p-5 border border-gray-200 rounded-xl bg-gray-50 space-y-5">
                        {/* Specialty */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Chuyên môn</label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${!specialty ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-600 hover:border-black'}`}
                                    onClick={() => { setSpecialty(''); setPage(1); }}
                                >
                                    Tất cả
                                </button>
                                {SPECIALTIES.map(s => (
                                    <button
                                        key={s}
                                        className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${specialty === s ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-600 hover:border-black'}`}
                                        onClick={() => { setSpecialty(specialty === s ? '' : s); setPage(1); }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Mức giá / tháng</label>
                            <div className="flex flex-wrap gap-2">
                                {PRICE_RANGES.map((r, idx) => (
                                    <button
                                        key={r.label}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${priceIdx === idx ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-600 hover:border-black'}`}
                                        onClick={() => { setPriceIdx(idx); setPage(1); }}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {hasActiveFilters && (
                            <button className="text-sm text-red-600 font-medium hover:underline" onClick={resetFilters}>
                                ✕ Xoá tất cả bộ lọc
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── Content ── */}
            {isLoading ? (
                <div className="text-center text-gray-500 py-20 text-sm">Đang tải danh sách...</div>
            ) : isError ? (
                <div className="text-center text-red-600 py-20 font-medium">Đã xảy ra lỗi khi tải dữ liệu.</div>
            ) : data?.trainers.length === 0 ? (
                <div className="text-center text-gray-500 py-20 text-sm">
                    Không tìm thấy Coach nào phù hợp.
                    {hasActiveFilters && (
                        <button className="ml-2 text-black font-bold underline" onClick={resetFilters}>Xoá bộ lọc</button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {data?.trainers.map((trainer) => (
                            <Link key={trainer.id} to={`/coaches/${trainer.id}`} className="card group hover:border-black transition-colors flex flex-col cursor-pointer">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="shrink-0">
                                        {trainer.avatar_url ? (
                                            <img className="w-16 h-16 rounded-xs object-cover border border-gray-200 grayscale group-hover:grayscale-0 transition-all" src={trainer.avatar_url} alt={trainer.full_name} />
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
                                            ★ {(trainer as any).avg_rating?.toFixed(1) || '5.0'}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 line-clamp-3 flex-1 mb-4">
                                    {trainer.bio || 'Chưa có thông tin giới thiệu.'}
                                </p>

                                {trainer.specialties && trainer.specialties.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {trainer.specialties.slice(0, 3).map(spec => (
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
                            <span className="text-sm font-mono text-gray-600 min-w-[80px] text-center">
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
        </main>
    );
}
