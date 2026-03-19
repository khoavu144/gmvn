import { Link } from 'react-router-dom';

interface SimilarCoach {
    id: string;
    slug: string | null;
    full_name: string;
    avatar_url: string | null;
    specialties: string[] | null;
    base_price_monthly: number | null;
}

interface Props {
    coaches: SimilarCoach[];
}

export default function CoachRelatedFooter({ coaches }: Props) {
    if (coaches.length === 0) return null;

    return (
        <section className="py-10 border-t border-gray-100 bg-gray-50/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-5">
                    Huấn luyện viên tương tự
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coaches.map(coach => {
                        const link = coach.slug ? `/coach/${coach.slug}` : `/coaches/${coach.id}`;
                        return (
                            <Link
                                key={coach.id}
                                to={link}
                                className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-400 transition-colors group"
                            >
                                {coach.avatar_url ? (
                                    <img
                                        src={coach.avatar_url}
                                        alt={coach.full_name}
                                        className="w-12 h-12 rounded-full object-cover border border-gray-100 shrink-0"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-base font-bold text-gray-500 shrink-0">
                                        {coach.full_name.charAt(0)}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-bold text-black truncate group-hover:underline">{coach.full_name}</div>
                                    {coach.specialties && coach.specialties.length > 0 && (
                                        <div className="text-xs text-gray-500 mt-0.5 truncate">
                                            {coach.specialties.slice(0, 2).join(' · ')}
                                        </div>
                                    )}
                                </div>
                                {coach.base_price_monthly && (
                                    <div className="text-xs font-semibold text-gray-500 shrink-0">
                                        {Number(coach.base_price_monthly).toLocaleString('vi-VN')}₫
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
