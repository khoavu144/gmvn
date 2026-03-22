import React from 'react';
import { Link } from 'react-router-dom';
import type { GymTrainerLink } from '../../types';

function SectionHeading({ kicker, title, description }: { kicker: string; title: string; description?: string }) {
    return (
        <div className="mb-6 space-y-2">
            <div className="marketplace-section-kicker">{kicker}</div>
            <h2 className="marketplace-section-title">{title}</h2>
            {description && <p className="marketplace-lead max-w-none text-[0.98rem]">{description}</p>}
        </div>
    );
}

function getTrainerLinkPath(link: GymTrainerLink): string | null {
    const trainer = link.trainer;
    if (!trainer) return null;
    if (trainer.user_type === 'athlete') {
        return trainer.profile_slug ? `/athlete/${trainer.profile_slug}` : `/athletes/${trainer.id}`;
    }
    return trainer.profile_slug ? `/coach/${trainer.profile_slug}` : `/coaches/${trainer.id}`;
}

interface Props {
    branchTrainerLinks: GymTrainerLink[];
    setRef: (id: string) => (node: HTMLElement | null) => void;
}

const CARD_CLASS = 'group rounded-lg border border-[color:var(--mk-line)] bg-white/80 p-5 transition hover:-translate-y-1 hover:shadow-[color:var(--mk-shadow-soft)]';

const GymTrainersSection = React.memo(function GymTrainersSection({ branchTrainerLinks, setRef }: Props) {
    if (branchTrainerLinks.length === 0) return null;

    return (
            <section ref={setRef('trainers')} id="trainers" className="marketplace-panel p-6 sm:p-8">
                <SectionHeading
                    kicker="Chuyên gia"
                    title="Ai đang dẫn dắt trải nghiệm tại chi nhánh này"
                    description="Không chỉ là danh sách Huấn luyện viên — hãy nhìn chuyên môn, ngôn ngữ và nền tảng của họ để đánh giá độ phù hợp với cá nhân bạn."
                />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {branchTrainerLinks.map((link) => {
                        const trainerPath = getTrainerLinkPath(link);
                        const cardContent = (
                            <>
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 overflow-hidden rounded-full border border-[color:var(--mk-line)] bg-[color:var(--mk-paper-strong)]">
                                        {link.trainer?.avatar_url ? (
                                            <img src={link.trainer.avatar_url} alt={link.trainer.full_name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-sm font-bold uppercase text-[color:var(--mk-muted)]">
                                                {(link.trainer?.full_name || 'T').slice(0, 1)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="text-base font-bold tracking-[-0.03em] text-[color:var(--mk-text)]">
                                            {link.trainer?.full_name || 'Đối tác huấn luyện'}
                                        </div>
                                        <div className="mt-1 text-sm text-[color:var(--mk-muted)]">
                                            {link.specialization_summary || link.role_at_gym || 'Huấn luyện viên tại cơ sở này'}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {link.featured_at_branch && <span className="marketplace-badge marketplace-badge--accent">Huấn luyện viên nổi bật</span>}
                                    {link.accepts_private_clients && <span className="marketplace-badge marketplace-badge--neutral">Có nhận học viên riêng</span>}
                                    {(link.languages || []).slice(0, 2).map((lang) => (
                                        <span key={lang} className="marketplace-badge marketplace-badge--neutral">{lang}</span>
                                    ))}
                                </div>

                                {link.branch_intro && (
                                    <p className="mt-4 text-sm leading-7 text-[color:var(--mk-text-soft)]">{link.branch_intro}</p>
                                )}
                            </>
                        );

                        return trainerPath ? (
                            <Link key={link.id} to={trainerPath} className={CARD_CLASS}>{cardContent}</Link>
                        ) : (
                            <div key={link.id} className={CARD_CLASS}>{cardContent}</div>
                        );
                    })}
                </div>
            </section>
    );
});

export default GymTrainersSection;
