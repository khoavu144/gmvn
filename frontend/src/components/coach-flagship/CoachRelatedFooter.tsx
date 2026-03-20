import { Link } from 'react-router-dom';
import { useState } from 'react';

interface SimilarCoach {
    id: string;
    slug: string | null;
    full_name: string;
    avatar_url: string | null;
    specialties: string[] | null;
    base_price_monthly: number | null;
    user_type?: string;
}

interface Props {
    coaches: SimilarCoach[];
}

const PAGE_SIZE = 2;

export default function CoachRelatedFooter({ coaches }: Props) {
    const [page, setPage] = useState(0);
    if (coaches.length === 0) return null;

    const totalPages = Math.ceil(coaches.length / PAGE_SIZE);
    const visible = coaches.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

    return (
        <section className="coach-related-section">
            <div className="coach-related-inner">
                {/* Header + prev/next — always visible */}
                <div className="coach-related-header">
                    <h3 className="coach-related-title">Huấn luyện viên tương tự</h3>
                    <div className="coach-related-nav">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="coach-related-nav-btn"
                            aria-label="Previous"
                        >
                            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <span className="coach-related-page">{page + 1} / {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page === totalPages - 1}
                            className="coach-related-nav-btn"
                            aria-label="Next"
                        >
                            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Cards */}
                <div className="coach-related-grid">
                    {visible.map(coach => {
                        const link = coach.user_type === 'athlete'
                            ? (coach.slug ? `/athlete/${coach.slug}` : `/athletes/${coach.id}`)
                            : (coach.slug ? `/coach/${coach.slug}` : `/coaches/${coach.id}`);
                        return (
                            <Link key={coach.id} to={link} className="coach-related-card">
                                {coach.avatar_url ? (
                                    <img src={coach.avatar_url} alt={coach.full_name} className="coach-related-avatar" />
                                ) : (
                                    <div className="coach-related-avatar coach-related-avatar--fallback">
                                        {coach.full_name.charAt(0)}
                                    </div>
                                )}
                                <div className="coach-related-info">
                                    <div className="coach-related-name">{coach.full_name}</div>
                                    {coach.specialties && coach.specialties.length > 0 && (
                                        <div className="coach-related-spec">
                                            {coach.specialties.slice(0, 2).join(' · ')}
                                        </div>
                                    )}
                                </div>
                                {coach.base_price_monthly && (
                                    <div className="coach-related-price">
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
