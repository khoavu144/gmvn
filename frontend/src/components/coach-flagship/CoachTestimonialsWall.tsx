interface Testimonial {
    id: string;
    client_name: string;
    client_avatar?: string;
    rating: number;
    comment: string;
}

interface Props {
    testimonials: Testimonial[];
}

export default function CoachTestimonialsWall({ testimonials }: Props) {
    if (testimonials.length === 0) {
        return (
            <section className="py-12 sm:py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">
                        Phản hồi từ học viên
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black mb-4">
                        Họ nói gì về Coach
                    </h2>
                    <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-5 text-sm leading-7 text-gray-600 max-w-2xl">
                        Chưa có đánh giá công khai. Sau khi tập cùng Coach, bạn có thể để lại phản hồi để giúp người khác quyết định.
                    </p>
                </div>
            </section>
        );
    }

    const heroTestimonials = testimonials.slice(0, 2);
    const gridTestimonials = testimonials.slice(2);

    return (
        <section className="py-12 sm:py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">
                    Phản hồi từ học viên
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black mb-8">
                    Họ nói gì về Coach
                </h2>

                {/* Hero testimonials */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {heroTestimonials.map(t => (
                        <div key={t.id} className="relative bg-black text-white p-6 sm:p-8 rounded-lg">
                            <div className="text-4xl font-extrabold text-white/10 absolute top-4 right-6 select-none">"</div>
                            <div className="relative">
                                <div className="text-yellow-400 text-sm mb-4">
                                    {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                                </div>
                                <p className="text-base text-white/80 leading-relaxed mb-6 line-clamp-5">
                                    {t.comment}
                                </p>
                                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                                    {t.client_avatar ? (
                                        <img src={t.client_avatar} alt={t.client_name} className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white">
                                            {t.client_name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-sm font-semibold text-white">{t.client_name}</div>
                                        <div className="text-[11px] font-medium uppercase tracking-wider text-white/45">Học viên</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grid testimonials */}
                {gridTestimonials.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {gridTestimonials.map(t => (
                            <div key={t.id} className="border border-gray-200 rounded-lg p-5 bg-gray-50/80">
                                <div className="text-yellow-500 text-xs mb-3">
                                    {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-4">{t.comment}</p>
                                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                                    {t.client_avatar ? (
                                        <img src={t.client_avatar} alt={t.client_name} className="w-7 h-7 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                                            {t.client_name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-900">{t.client_name}</span>
                                        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Học viên</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
