import { getOptimizedUrl, getSrcSet } from '../../utils/image';
import type { GymTrainerLink } from '../../types';
import { Link } from 'react-router-dom';

interface MediaFeature {
    id: string;
    media_type: 'image' | 'video';
    url: string;
    thumbnail_url: string | null;
    caption: string | null;
}

interface PressMention {
    id: string;
    source_name: string;
    title: string;
    excerpt: string | null;
    mention_url: string | null;
}

interface Props {
    gymLinks: GymTrainerLink[];
    mediaFeatures: MediaFeature[];
    pressMentions: PressMention[];
}

export default function CoachAuthoritySection({ gymLinks, mediaFeatures, pressMentions }: Props) {
    const hasContent = gymLinks.length > 0 || mediaFeatures.length > 0 || pressMentions.length > 0;
    if (!hasContent) return null;

    return (
        <section className="py-12 sm:py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
                    Uy tín & Hoạt động
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black mb-8">
                    Thông tin xác thực
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Gym affiliations */}
                    {gymLinks.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Phòng gym liên kết</h3>
                            <div className="space-y-3">
                                {gymLinks.map(link => {
                                    const gymId = link.gym_center?.id;
                                    const gymName = link.gym_center?.name;
                                    if (!gymId || !gymName) return null;

                                    return (
                                        <Link
                                            key={link.id}
                                            to={`/gyms/${gymId}`}
                                            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-black transition-colors group"
                                        >
                                            <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold shrink-0 group-hover:scale-105 transition-transform">
                                                {gymName.charAt(0)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-bold text-black truncate">{gymName}</div>
                                                {link.branch?.branch_name && (
                                                    <div className="text-xs text-gray-500">{link.branch.branch_name}</div>
                                                )}
                                            </div>
                                            {link.role_at_gym && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 shrink-0">
                                                    {link.role_at_gym}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Media + Press */}
                    <div className="space-y-6">
                        {mediaFeatures.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Nội dung nổi bật</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {mediaFeatures.slice(0, 4).map(media => (
                                        <a
                                            key={media.id}
                                            href={media.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block rounded-lg overflow-hidden border border-gray-200 hover:border-black transition-colors"
                                        >
                                            <img
                                                src={getOptimizedUrl(media.thumbnail_url || media.url, 300)}
                                                srcSet={getSrcSet(media.thumbnail_url || media.url)}
                                                sizes="150px"
                                                alt={media.caption || 'Nội dung nổi bật'}
                                                className="w-full aspect-video object-cover"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            {media.caption && (
                                                <div className="px-3 py-2 text-xs text-gray-600 truncate">{media.caption}</div>
                                            )}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {pressMentions.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Báo chí nhắc đến</h3>
                                <div className="space-y-2">
                                    {pressMentions.map(press => (
                                        <a
                                            key={press.id}
                                            href={press.mention_url || '#'}
                                            target={press.mention_url ? '_blank' : undefined}
                                            rel={press.mention_url ? 'noreferrer' : undefined}
                                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                                                📰
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{press.source_name}</div>
                                                <div className="text-sm font-semibold text-black mt-0.5 line-clamp-1">{press.title}</div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
