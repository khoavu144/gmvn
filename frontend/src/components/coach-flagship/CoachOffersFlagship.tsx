import { useState } from 'react';

interface Program {
    id: string;
    name: string;
    description: string | null;
    duration_weeks: number | null;
    difficulty: string | null;
    price_monthly: number | null;
    price_one_time: number | null;
    price_per_session: number | null;
    pricing_type: 'monthly' | 'lump_sum' | 'per_session';
    training_format: string;
    current_clients: number;
    max_clients: number;
}

interface Props {
    programs: Program[];
    subscribing: string | null;
    onSubscribe: (programId: string) => void;
}

function formatPrice(prog: Program) {
    if (prog.pricing_type === 'monthly' && prog.price_monthly) {
        return { amount: Number(prog.price_monthly).toLocaleString('vi-VN') + '₫', period: '/tháng' };
    }
    if (prog.pricing_type === 'lump_sum' && prog.price_one_time) {
        return { amount: Number(prog.price_one_time).toLocaleString('vi-VN') + '₫', period: ' trọn gói' };
    }
    if (prog.pricing_type === 'per_session' && prog.price_per_session) {
        return { amount: Number(prog.price_per_session).toLocaleString('vi-VN') + '₫', period: '/buổi' };
    }
    return null;
}

export default function CoachOffersFlagship({ programs, subscribing, onSubscribe }: Props) {
    const [showAll, setShowAll] = useState(false);

    if (programs.length === 0) {
        return (
            <section id="programs" className="py-12 sm:py-16 scroll-mt-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
                        Gói tập luyện
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black mb-6">
                        Chương trình huấn luyện
                    </h2>
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg py-16 text-center">
                        <div className="text-gray-400 text-sm font-medium mb-3">Chưa có gói tập khả dụng</div>
                        <div className="text-xs text-gray-400">Liên hệ trực tiếp để được tư vấn chương trình phù hợp</div>
                    </div>
                </div>
            </section>
        );
    }

    const featured = programs[0];
    const others = programs.slice(1);
    const featuredPrice = formatPrice(featured);
    const visibleOthers = showAll ? others : others.slice(0, 2);

    return (
        <section id="programs" className="py-12 sm:py-16 bg-[#fafafa] scroll-mt-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
                    Gói tập luyện
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black mb-8">
                    Chọn chương trình phù hợp
                </h2>

                {/* Featured offer */}
                <div className="bg-white border-2 border-black rounded-xl overflow-hidden mb-6 shadow-sm">
                    <div className="bg-black text-white px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-center">
                        Gói được đề xuất
                    </div>
                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-extrabold text-black mb-2">{featured.name}</h3>
                                {featured.description && (
                                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{featured.description}</p>
                                )}
                                <div className="flex flex-wrap gap-2">
                                    {featured.duration_weeks && (
                                        <span className="text-xs font-semibold border border-gray-200 px-2.5 py-1 rounded-sm uppercase">{featured.duration_weeks} tuần</span>
                                    )}
                                    {featured.difficulty && (
                                        <span className="text-xs font-semibold border border-gray-200 px-2.5 py-1 rounded-sm uppercase">{featured.difficulty}</span>
                                    )}
                                    <span className="text-xs font-semibold border border-gray-200 px-2.5 py-1 rounded-sm">
                                        {featured.current_clients}/{featured.max_clients} chỗ
                                    </span>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                {featuredPrice ? (
                                    <div>
                                        <div className="text-3xl font-extrabold text-black">{featuredPrice.amount}</div>
                                        <div className="text-xs text-gray-500 mt-1">{featuredPrice.period}</div>
                                    </div>
                                ) : (
                                    <div className="text-sm font-semibold text-gray-500">Liên hệ báo giá</div>
                                )}
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <button
                                onClick={() => onSubscribe(featured.id)}
                                disabled={subscribing === featured.id}
                                className="btn-primary flex-1 sm:flex-none sm:px-10 py-3 text-sm font-bold uppercase tracking-wider"
                            >
                                {subscribing === featured.id ? 'Đang xử lý...' : 'Đăng ký ngay'}
                            </button>
                            <span className="text-xs text-gray-400 text-center sm:text-left">
                                Thanh toán an toàn qua chuyển khoản ngân hàng
                            </span>
                        </div>
                    </div>
                </div>

                {/* Other offers */}
                {others.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {visibleOthers.map(prog => {
                            const price = formatPrice(prog);
                            return (
                                <div key={prog.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-400 transition-colors flex flex-col">
                                    <div className="flex-1">
                                        <h3 className="text-base font-bold text-black mb-2">{prog.name}</h3>
                                        {prog.description && (
                                            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">{prog.description}</p>
                                        )}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {prog.duration_weeks && (
                                                <span className="text-[10px] font-semibold border border-gray-200 px-2 py-0.5 rounded-sm uppercase">{prog.duration_weeks} tuần</span>
                                            )}
                                            {prog.difficulty && (
                                                <span className="text-[10px] font-semibold border border-gray-200 px-2 py-0.5 rounded-sm uppercase">{prog.difficulty}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                        {price ? (
                                            <div className="text-lg font-bold text-black">
                                                {price.amount}<span className="text-xs font-normal text-gray-500">{price.period}</span>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500">Liên hệ</div>
                                        )}
                                        <button
                                            onClick={() => onSubscribe(prog.id)}
                                            disabled={subscribing === prog.id}
                                            className="btn-secondary px-5 text-xs font-bold uppercase"
                                        >
                                            {subscribing === prog.id ? '...' : 'Đăng ký'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!showAll && others.length > 2 && (
                    <button
                        onClick={() => setShowAll(true)}
                        className="mt-4 text-sm font-semibold text-gray-500 hover:text-black transition-colors mx-auto block"
                    >
                        Xem thêm {others.length - 2} gói tập →
                    </button>
                )}
            </div>
        </section>
    );
}
