/**
 * Gyms.tsx — Gym listing page
 * Redesigned: better filter bar (city/district/amenity/price),
 * wpresidence-inspired card grid, map toggle preserved.
 */
import React, { useState, lazy, Suspense, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { gymService } from '../services/gymService';
import type { GymCenter } from '../types';
import GymCard from '../components/GymCard';
import { Helmet } from 'react-helmet-async';

const GymMapView = lazy(() => import('../components/GymMapView'));
type ViewMode = 'grid' | 'map';

const SORT_OPTIONS = [
    { value: 'views', label: 'Phổ biến nhất' },
    { value: 'newest', label: 'Mới nhất' },
    { value: 'rating', label: 'Đánh giá cao' },
];

const Gyms: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [districtFilter, setDistrictFilter] = useState('');
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [sortBy, setSortBy] = useState('views');

    const {
        data: gyms = [] as GymCenter[],
        isLoading: loading,
        error: queryError,
        refetch: fetchGyms
    } = useQuery<GymCenter[]>({
        queryKey: ['gyms', 'list'],
        queryFn: async () => {
            const response = await gymService.listGyms({ limit: 60, sort: 'views' });
            if (!response.success) throw new Error(response.error || 'Lỗi tải danh sách gyms');
            return response.gyms || [];
        },
        staleTime: 5 * 60 * 1000,
    });

    const error = queryError ? (queryError as Error).message : null;

    // Location data
    const locationData = useMemo(() => {
        const data: Record<string, Set<string>> = {};
        gyms.forEach(g => (g.branches || []).forEach(b => {
            if (b.city) {
                if (!data[b.city]) data[b.city] = new Set();
                if (b.district) data[b.city].add(b.district);
            }
        }));
        return data;
    }, [gyms]);

    const allCities = Object.keys(locationData).sort();
    const availableDistricts = cityFilter && locationData[cityFilter]
        ? Array.from(locationData[cityFilter]).sort() : [];

    // Filtered + sorted gyms
    const filteredGyms = useMemo(() => {
        let result = gyms;
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            result = result.filter(g =>
                g.name?.toLowerCase().includes(q) ||
                g.tagline?.toLowerCase().includes(q) ||
                g.branches?.some(b => b.address?.toLowerCase().includes(q))
            );
        }
        if (cityFilter) result = result.filter(g => g.branches?.some(b => b.city === cityFilter));
        if (districtFilter) result = result.filter(g => g.branches?.some(b => b.city === cityFilter && b.district === districtFilter));
        if (verifiedOnly) result = result.filter(g => g.is_verified);
        // sort
        if (sortBy === 'newest') result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        else if (sortBy === 'rating') result = [...result].sort((a, b) => (Number(b.avg_rating) || 0) - (Number(a.avg_rating) || 0));
        else result = [...result].sort((a, b) => b.view_count - a.view_count); // views
        return result;
    }, [gyms, searchTerm, cityFilter, districtFilter, verifiedOnly, sortBy]);

    const hasFilters = searchTerm || cityFilter || districtFilter || verifiedOnly;

    return (
        <>
            <Helmet>
                <title>Khám phá Phòng tập Gym — GYMERVIET</title>
                <meta name="description" content="Tìm kiếm phòng tập thể dục, gym cao cấp tại Việt Nam. Đối tác uy tín được xác minh trên GYMERVIET." />
                <link rel="canonical" href="https://gymerviet.vn/gyms" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Khám phá Phòng tập Gym — GYMERVIET" />
                <meta property="og:url" content="https://gymerviet.vn/gyms" />
                <meta property="og:image" content="https://gymerviet.vn/og-default.jpg" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:site" content="@gymerviet" />
            </Helmet>

            <div className="bg-gray-50 min-h-screen pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* ── PAGE HEADER ──────────────────────────────────── */}
                    <div className="pt-8 pb-6 border-b border-gray-200 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Gymerviet Network</p>
                                <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                                    Phòng tập
                                    {!loading && <span className="text-gray-300 ml-3 text-2xl font-mono">({filteredGyms.length})</span>}
                                </h1>
                            </div>
                            {/* View toggle */}
                            <div className="flex border border-gray-200 overflow-hidden bg-white shrink-0">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
                                >Grid</button>
                                <button
                                    onClick={() => setViewMode('map')}
                                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${viewMode === 'map' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
                                >Bản đồ</button>
                            </div>
                        </div>
                    </div>

                    {/* ── FILTER BAR ───────────────────────────────────── */}
                    <div className="bg-white border border-gray-200 mb-6">
                        {/* Primary row */}
                        <div className="flex flex-col sm:flex-row gap-0 sm:divide-x sm:divide-gray-200">
                            <div className="flex-1 px-4 py-3">
                                <label htmlFor="search-gyms" className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Tìm kiếm</label>
                                <input
                                    id="search-gyms"
                                    type="text"
                                    placeholder="Tên gym, địa chỉ..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full text-sm text-black placeholder-gray-300 bg-transparent outline-none"
                                />
                            </div>
                            <div className="px-4 py-3 sm:w-44">
                                <label htmlFor="city-filter" className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Tỉnh/Thành</label>
                                <select id="city-filter" value={cityFilter} onChange={e => { setCityFilter(e.target.value); setDistrictFilter(''); }}
                                    className="w-full text-sm text-black bg-transparent outline-none appearance-none">
                                    <option value="">Tất cả</option>
                                    {allCities.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="px-4 py-3 sm:w-44">
                                <label htmlFor="district-filter" className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Quận/Huyện</label>
                                <select id="district-filter" value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}
                                    disabled={!cityFilter}
                                    className="w-full text-sm text-black bg-transparent outline-none appearance-none disabled:text-gray-300">
                                    <option value="">Tất cả</option>
                                    {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="px-4 py-3 sm:w-44">
                                <label htmlFor="sort-filter" className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Sắp xếp</label>
                                <select id="sort-filter" value={sortBy} onChange={e => setSortBy(e.target.value)}
                                    className="w-full text-sm text-black bg-transparent outline-none appearance-none">
                                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Secondary row: quick toggles */}
                        <div className="border-t border-gray-100 px-4 py-2.5 flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={verifiedOnly}
                                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer group-focus-within:ring-2 group-focus-within:ring-black group-focus-within:ring-offset-1 ${verifiedOnly ? 'bg-black' : 'bg-gray-200'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${verifiedOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                </div>
                                <span className="text-xs font-medium text-gray-700">Chỉ Verified</span>
                            </label>

                            {hasFilters && (
                                <button
                                    onClick={() => { setSearchTerm(''); setCityFilter(''); setDistrictFilter(''); setVerifiedOnly(false); }}
                                    className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors ml-auto">
                                    Xóa bộ lọc ×
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── CONTENT ──────────────────────────────────────── */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="bg-white border border-gray-100 animate-pulse">
                                    <div className="bg-gray-100" style={{ aspectRatio: '4/3' }} />
                                    <div className="p-4 space-y-2">
                                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                                        <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 border border-gray-200 bg-white">
                            <p className="text-sm text-gray-500 mb-3">{error}</p>
                            <button onClick={() => fetchGyms()} className="text-xs font-bold uppercase tracking-widest text-black underline underline-offset-2">
                                Thử lại
                            </button>
                        </div>
                    ) : viewMode === 'map' ? (
                        <Suspense fallback={<div className="h-[520px] bg-gray-100 animate-pulse" />}>
                            <GymMapView gyms={filteredGyms.length > 0 ? filteredGyms : gyms} />
                        </Suspense>
                    ) : filteredGyms.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-gray-200 bg-white">
                            <div className="text-5xl font-black text-gray-100 mb-3">0</div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Không tìm thấy phòng tập phù hợp</p>
                            <p className="text-xs text-gray-400">Thử đổi khu vực hoặc xóa bộ lọc</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredGyms.map((gym, idx) => (
                                <GymCard key={gym.id} gym={gym} index={idx} />
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};

export default Gyms;
