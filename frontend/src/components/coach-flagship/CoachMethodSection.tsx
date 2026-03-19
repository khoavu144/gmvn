interface Highlight { id: string; title: string; value: string }

interface Props {
    bio: string | null;
    specialties: string[] | null;
    highlights: Highlight[];
    gymCount: number;
}

export default function CoachMethodSection({ bio, specialties, highlights, gymCount }: Props) {
    // Derive method pillars from highlights, or fallback to specialties
    const pillars = highlights.length > 0
        ? highlights.slice(0, 4)
        : (specialties || []).slice(0, 4).map((s, i) => ({
            id: `sp-${i}`,
            title: s,
            value: 'Chuyên môn được đào tạo bài bản'
        }));

    if (!bio && pillars.length === 0) return null;

    return (
        <section className="py-12 sm:py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16">
                    {/* Left: Narrative */}
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
                            Phương pháp huấn luyện
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black mb-6">
                            Triết lý & Phong cách
                        </h2>
                        {bio && (
                            <div className="text-base text-gray-600 leading-[1.8] whitespace-pre-line">
                                {bio}
                            </div>
                        )}
                        {gymCount > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>🏋️</span>
                                    <span>Đang hoạt động tại <strong className="text-black">{gymCount}</strong> phòng gym</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Method pillars */}
                    {pillars.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {pillars.map((pillar, i) => (
                                <div
                                    key={pillar.id}
                                    className="relative p-5 rounded-lg border border-gray-100 bg-gray-50/50 hover:border-gray-300 transition-colors group"
                                >
                                    <div className="absolute top-4 right-4 text-4xl font-extrabold text-gray-100 group-hover:text-gray-200 transition-colors select-none">
                                        {String(i + 1).padStart(2, '0')}
                                    </div>
                                    <div className="relative">
                                        <h3 className="text-sm font-bold text-black mb-2 uppercase tracking-wide">
                                            {pillar.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            {pillar.value}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
