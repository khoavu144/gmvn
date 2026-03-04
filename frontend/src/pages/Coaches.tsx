import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trainerService } from '../services/trainerService';
import { Link } from 'react-router-dom';

export default function Trainers() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 12;

    const { data, isLoading, isError } = useQuery({
        queryKey: ['trainers', search, page],
        queryFn: () => trainerService.getTrainers(page, PAGE_SIZE, search),
        staleTime: 60000,
    });

    // Reset to page 1 on new search
    const handleSearchChange = (val: string) => {
        setSearch(val);
        setPage(1);
    };

    const totalPages = data?.totalPages ?? 1;

    return (
        <main className="max-w-7xl w-full mx-auto px-4 py-8 flex-1">
            <div className="mb-8">
                <h1 className="text-h1 mb-6">Khám phá Coach</h1>

                {/* Search Bar */}
                <div className="max-w-xl">
                    <label htmlFor="search" className="sr-only">Tìm kiếm</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 text-sm">🔍</span>
                        </div>
                        <input
                            type="text"
                            name="search"
                            id="search"
                            className="form-input pl-10"
                            placeholder="Tìm theo tên, chuyên môn hoặc từ khóa..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="text-center text-gray-500 py-20 text-sm">Đang tải danh sách...</div>
            ) : isError ? (
                <div className="text-center text-red-600 py-20 font-medium">Đã xảy ra lỗi khi tải dữ liệu.</div>
            ) : data?.trainers.length === 0 ? (
                <div className="text-center text-gray-500 py-20 text-sm">Không tìm thấy Coach nào phù hợp.</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {data?.trainers.map((trainer) => (
                            <Link key={trainer.id} to={`/trainers/${trainer.id}`} className="card group hover:border-black transition-colors flex flex-col cursor-pointer">
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

                    {/* BUG-13 Fix: Pagination Controls */}
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
