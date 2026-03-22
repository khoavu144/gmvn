import React from 'react';
import type { GymPricing } from '../../types';

function SectionHeading({ kicker, title, description }: { kicker: string; title: string; description?: string }) {
    return (
        <div className="mb-6 space-y-2">
            <div className="marketplace-section-kicker">{kicker}</div>
            <h2 className="marketplace-section-title">{title}</h2>
            {description && <p className="marketplace-lead max-w-none text-[0.98rem]">{description}</p>}
        </div>
    );
}

const BILLING_LABELS: Record<string, string> = {
    per_day: '/ ngày', per_month: '/ tháng', per_quarter: '/ quý',
    per_year: '/ năm', per_session: '/ buổi',
};

interface Props {
    branchPricing: GymPricing[];
    setRef: (id: string) => (node: HTMLElement | null) => void;
    leadAction: {
        href: string;
        label: string;
        isExternal: boolean;
        helper?: string;
    } | null;
}

function renderActionButton(leadAction: Props['leadAction'], className: string) {
    if (!leadAction) return null;
    return leadAction.isExternal ? (
        <a href={leadAction.href} target="_blank" rel="noopener noreferrer" className={className}>
            {leadAction.label}
        </a>
    ) : (
        <a href={leadAction.href} className={className}>
            {leadAction.label}
        </a>
    );
}

const GymPricingSection = React.memo(function GymPricingSection({ branchPricing, setRef, leadAction }: Props) {
    if (branchPricing.length === 0) return null;

    return (
            <section ref={setRef('pricing')} id="pricing" className="marketplace-panel p-6 sm:p-7">
                <SectionHeading
                    kicker="Bảng giá"
                    title="Các gói vào cửa và cách bắt đầu"
                    description="Đừng chỉ nhìn gói nổi bật. Hãy nhìn gói khởi điểm, các dịch vụ đi kèm và chính sách để biết chi phí thực sự của việc tập luyện."
                />

                <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                    {branchPricing.map((plan) => (
                        <article
                            key={plan.id}
                            className={`rounded-lg border px-4 py-4 ${plan.is_highlighted ? 'border-[color:var(--mk-accent)] bg-[color:var(--mk-accent-soft)]/55' : 'border-[color:var(--mk-line)] bg-white/80'}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <div className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[color:var(--mk-muted)]">{plan.plan_type || 'membership'}</div>
                                    <h3 className="mt-1.5 text-lg font-bold tracking-[-0.04em] text-[color:var(--mk-text)]">{plan.plan_name}</h3>
                                </div>
                                {plan.is_highlighted && <span className="marketplace-badge marketplace-badge--accent">Recommended</span>}
                            </div>

                            <div className="mt-4 flex items-end gap-2">
                                <div className="text-[1.9rem] font-bold leading-none tracking-[-0.05em] text-[color:var(--mk-text)]">
                                    {Number(plan.price).toLocaleString('vi-VN')}₫
                                </div>
                                <div className="pb-1 text-sm font-semibold text-[color:var(--mk-muted)]">
                                    {BILLING_LABELS[plan.billing_cycle] || plan.billing_cycle}
                                </div>
                            </div>

                            {plan.description && (
                                <p className="mt-3 text-sm leading-6 text-[color:var(--mk-text-soft)]">{plan.description}</p>
                            )}

                            {(plan.included_services || []).length > 0 && (
                                <div className="mt-3.5 flex flex-wrap gap-1.5">
                                    {(plan.included_services || []).slice(0, 4).map((item) => (
                                        <span key={item} className="marketplace-badge marketplace-badge--neutral">{item}</span>
                                    ))}
                                </div>
                            )}

                            <div className="mt-4 space-y-1.5 text-sm leading-6 text-[color:var(--mk-text-soft)]">
                                {plan.highlighted_reason && <div>• {plan.highlighted_reason}</div>}
                                {plan.trial_available && <div>• Có trial {plan.trial_price ? `${Number(plan.trial_price).toLocaleString('vi-VN')}₫` : ''}</div>}
                                {plan.freeze_policy_summary && <div>• Freeze: {plan.freeze_policy_summary}</div>}
                                {plan.cancellation_policy_summary && <div>• Cancel: {plan.cancellation_policy_summary}</div>}
                            </div>

                            <div className="mt-4 pt-1">
                                {renderActionButton(
                                    leadAction,
                                    'block w-full rounded-lg bg-[color:var(--mk-text)] px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:translate-y-[-1px] hover:bg-[color:var(--mk-accent-ink)]'
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            </section>
    );
});

export default GymPricingSection;
