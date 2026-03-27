import { lazy, Suspense } from 'react';
import { Star, ArrowRight } from 'lucide-react';
import type { GymCenter, GymBranch } from '../../types';

const LazyBarChart = lazy(() => import('recharts').then((m) => ({ default: m.BarChart })));
const LazyBar = lazy(() => import('recharts').then((m) => ({ default: m.Bar })));
const LazyXAxis = lazy(() => import('recharts').then((m) => ({ default: m.XAxis })));
const LazyYAxis = lazy(() => import('recharts').then((m) => ({ default: m.YAxis })));
const LazyTooltip = lazy(() => import('recharts').then((m) => ({ default: m.Tooltip })));
const LazyResponsiveContainer = lazy(() => import('recharts').then((m) => ({ default: m.ResponsiveContainer })));
const LazyRadialBarChart = lazy(() => import('recharts').then((m) => ({ default: m.RadialBarChart })));
const LazyRadialBar = lazy(() => import('recharts').then((m) => ({ default: m.RadialBar })));

const ChartFallback = () => <div className="h-full w-full animate-pulse rounded-lg bg-gray-50" />;

interface Props {
    gym: GymCenter;
    stats: {
        total_views: number;
        total_trainers: number;
        avg_rating: number;
        total_reviews: number;
        total_branches: number;
        rating_distribution?: Record<number, number>;
    } | null;
    branches: GymBranch[];
}

export default function DashboardOverviewTab({ gym, stats, branches }: Props) {
    return (
        <div className="animate-fade-in">
            <div className="mb-10">
                <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Thống Kê Tổng Quan</h1>
                <p className="text-gray-500">Giám sát hoạt động trên hệ thống GYMERVIET</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Tổng lượt xem', val: stats?.total_views ?? gym.view_count },
                    { label: 'Chi nhánh', val: stats?.total_branches ?? branches.length },
                    { label: 'Đánh giá', val: stats?.avg_rating != null ? `★ ${Number(stats.avg_rating).toFixed(1)}` : 'N/A' },
                    { label: 'HLV liên kết', val: stats?.total_trainers ?? 0 },
                ].map((item, i) => (
                    <div key={i} className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">{item.label}</p>
                        <p className="text-3xl font-black">{item.val}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm h-80 col-span-1 lg:col-span-2 flex flex-col">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-6">Phân bổ đánh giá</p>
                    <div className="flex-1 min-h-0">
                        <Suspense fallback={<ChartFallback />}>
                            <LazyResponsiveContainer width="100%" height="100%">
                                <LazyBarChart data={
                                    [
                                        { rating: '1★', count: stats?.rating_distribution?.[1] || 0 },
                                        { rating: '2★', count: stats?.rating_distribution?.[2] || 0 },
                                        { rating: '3★', count: stats?.rating_distribution?.[3] || 0 },
                                        { rating: '4★', count: stats?.rating_distribution?.[4] || 0 },
                                        { rating: '5★', count: stats?.rating_distribution?.[5] || 0 },
                                    ]
                                } margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <LazyXAxis dataKey="rating" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <LazyYAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                                    <LazyTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <LazyBar dataKey="count" fill="#000000" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                </LazyBarChart>
                            </LazyResponsiveContainer>
                        </Suspense>
                    </div>
                </div>

                <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm h-80 col-span-1 flex flex-col">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Tỷ lệ lấp đầy HLV</p>
                    <div className="flex-1 min-h-0 relative">
                        <Suspense fallback={<ChartFallback />}>
                            <LazyResponsiveContainer width="100%" height="100%">
                                <LazyRadialBarChart
                                    cx="50%" cy="50%"
                                    innerRadius="70%" outerRadius="100%"
                                    barSize={24}
                                    data={[
                                        { name: 'Đã lấp đầy', value: Math.min(100, Math.round(((stats?.total_trainers || 0) / (Math.max(1, branches.length) * 5)) * 100)) || 0, fill: '#000000' }
                                    ]}
                                    startAngle={90} endAngle={-270}
                                >
                                    <LazyRadialBar background={{ fill: '#f3f4f6' }} dataKey="value" cornerRadius={12} />
                                </LazyRadialBarChart>
                            </LazyResponsiveContainer>
                        </Suspense>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <span className="text-3xl font-black block">
                                    {Math.min(100, Math.round(((stats?.total_trainers || 0) / (Math.max(1, branches.length) * 5)) * 100)) || 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Đánh giá gần đây</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-5 rounded-lg border border-gray-200 bg-white shadow-sm hover:border-black transition-colors cursor-pointer group flex flex-col min-h-[160px]">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, idx) => <Star key={idx} className={`w-3 h-3 ${idx === 4 && i === 3 ? 'text-gray-300' : 'text-yellow-400 fill-yellow-400'}`} />)}
                                </div>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{i} ngày trước</span>
                            </div>
                            <p className="text-sm text-gray-600 italic line-clamp-3 mb-4 flex-1">"Phòng tập sạch sẽ, cơ sở vật chất tuyệt vời. Rất đáng tiền đăng ký gói năm ở đây!"</p>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-t border-gray-200 pt-3 flex items-center justify-between mt-auto">
                                <span>Hội viên ẩn danh</span>
                                <span className="text-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Xem <ArrowRight className="w-3 h-3 inline" /></span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
