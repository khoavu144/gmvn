import { getOptimizedUrl, getSrcSet } from '../../utils/image';

interface BeforeAfterPhoto {
    id: string;
    before_url: string;
    after_url: string;
    client_name?: string;
    duration_weeks?: number;
    story?: string;
}

interface Props {
    photos: BeforeAfterPhoto[];
    eyebrow?: string;
    title?: string;
    emptyEyebrow?: string;
    emptyTitle?: string;
    emptyDescription?: string;
}

export default function CoachResultsShowcase({
    photos,
    eyebrow = 'Kết quả thực tế',
    title = 'Những chuyển đổi ấn tượng',
    emptyEyebrow,
    emptyTitle,
    emptyDescription,
}: Props) {
    const eEyebrow = emptyEyebrow ?? eyebrow;
    const eTitle = emptyTitle ?? title;
    const eDesc = emptyDescription ?? 'Chưa có ảnh trước/sau công khai trên hồ sơ. Bạn có thể nhắn tin Coach để xem thêm minh chứng phù hợp chính sách riêng tư.';

    if (photos.length === 0) {
        return (
            <section className="py-12 sm:py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">
                        {eEyebrow}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black mb-4">
                        {eTitle}
                    </h2>
                    <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-5 text-sm leading-7 text-gray-600 max-w-2xl">
                        {eDesc}
                    </p>
                </div>
            </section>
        );
    }

    const lead = photos[0];
    const rest = photos.slice(1, 3);

    return (
        <section className="py-12 sm:py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="mb-8">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--mk-muted)] mb-2">
                        {eyebrow}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black">
                        {title}
                    </h2>
                </div>

                {/* Lead transformation — large editorial */}
                <div className="bg-white border border-[color:var(--mk-line)] rounded-lg overflow-hidden mb-6">
                    <div className="grid grid-cols-2 gap-px bg-[color:var(--mk-paper)]">
                        <div className="relative bg-[color:var(--mk-paper)]">
                            <div className="absolute top-3 left-3 z-10 text-[10px] font-bold uppercase tracking-[0.15em] bg-black/70 text-white px-2 py-1 rounded-sm">
                                Trước
                            </div>
                            <img
                                src={getOptimizedUrl(lead.before_url, 600)}
                                srcSet={getSrcSet(lead.before_url)}
                                sizes="50vw"
                                alt="Ảnh trước"
                                className="w-full aspect-[4/5] object-cover"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                        <div className="relative bg-[color:var(--mk-paper)]">
                            <div className="absolute top-3 left-3 z-10 text-[10px] font-bold uppercase tracking-[0.15em] bg-white text-black px-2 py-1 rounded-sm shadow-sm">
                                Sau
                            </div>
                            <img
                                src={getOptimizedUrl(lead.after_url, 600)}
                                srcSet={getSrcSet(lead.after_url)}
                                sizes="50vw"
                                alt="Ảnh sau"
                                className="w-full aspect-[4/5] object-cover"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    </div>
                    {(lead.client_name || lead.duration_weeks || lead.story) && (
                        <div className="p-5 sm:p-6">
                            <div className="flex items-center gap-3 mb-2">
                                {lead.client_name && (
                                    <span className="font-bold text-sm text-black">{lead.client_name}</span>
                                )}
                                {lead.duration_weeks && (
                                    <span className="text-xs font-semibold text-[color:var(--mk-muted)] border border-[color:var(--mk-line)] px-2 py-0.5 rounded-sm">
                                        {lead.duration_weeks} tuần
                                    </span>
                                )}
                            </div>
                            {lead.story && (
                                <p className="text-sm text-[color:var(--mk-text-soft)] leading-relaxed line-clamp-3">{lead.story}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Supporting proof items */}
                {rest.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {rest.map(photo => (
                            <div key={photo.id} className="bg-white border border-[color:var(--mk-line)] rounded-lg overflow-hidden">
                                <div className="grid grid-cols-2 gap-px bg-[color:var(--mk-paper)]">
                                    <img
                                        src={getOptimizedUrl(photo.before_url, 300)}
                                        alt="Ảnh trước"
                                        className="w-full aspect-square object-cover"
                                        loading="lazy"
                                    />
                                    <img
                                        src={getOptimizedUrl(photo.after_url, 300)}
                                        alt="Ảnh sau"
                                        className="w-full aspect-square object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="px-4 py-3 flex items-center gap-2">
                                    {photo.client_name && (
                                        <span className="text-xs font-bold text-black">{photo.client_name}</span>
                                    )}
                                    {photo.duration_weeks && (
                                        <span className="text-[10px] text-[color:var(--mk-muted)]">{photo.duration_weeks} tuần</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
