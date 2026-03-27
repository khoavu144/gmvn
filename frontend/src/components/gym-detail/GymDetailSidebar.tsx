import React from 'react';
import ShareButton from '../ShareButton';
import GymSimilarSection from './GymSimilarSection';
import type { GymBranch, GymCenter } from '../../types';
import { SummaryPill, buildWhatsappUrl, normalizePhone, renderActionButton } from '../../utils/gymDetailUtils';

export interface GymDetailSidebarProps {
    gym: GymCenter;
    branches: GymBranch[];
    branchDetail: GymBranch | null;
    branchName: string;
    branchPhone: string | null;
    branchEmail: string | null;
    branchWhatsapp: string | null;
    branchPrograms: unknown[];
    similarGyms: GymCenter[];
    lowestPrice: number | null;
    todayHours: { open?: string; close?: string; is_closed?: boolean } | undefined;
    leadAction: { href: string; label: string; isExternal: boolean; helper: string };
    canonicalUrl: string;
    seoTitle: string;
    seoDescription: string;
    navigateToSection: (sectionId: string) => void;
    setActiveBranchId: (id: string) => void;
}

const GymDetailSidebar: React.FC<GymDetailSidebarProps> = ({
    gym,
    branches,
    branchDetail,
    branchName,
    branchPhone,
    branchEmail,
    branchWhatsapp,
    branchPrograms,
    similarGyms,
    lowestPrice,
    todayHours,
    leadAction,
    canonicalUrl,
    seoTitle,
    seoDescription,
    navigateToSection,
    setActiveBranchId,
}) => {
    return (
        <aside className="gym-detail-sticky-rail space-y-4" style={{ contain: 'layout paint' }}>
            <div className="marketplace-panel gv-panel-pad-sm">
                <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Quyết định nhanh</div>
                <div className="mt-3 text-sm font-semibold text-[color:var(--mk-text-soft)]">Chi nhánh đang xem</div>
                <h3 className="mt-1 text-[1.55rem] font-bold leading-[0.98] tracking-[-0.05em] text-[color:var(--mk-text)]">
                    {branchName}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--mk-muted)]">
                    {branchDetail?.branch_tagline || branchDetail?.description || gym.discovery_blurb || 'Chọn đúng chi nhánh trước khi đặt hẹn tư vấn để nhận thông tin chuẩn nhất về giá mở cửa, lịch và trải nghiệm thực tế tại đó.'}
                </p>

                <div className="mt-5 rounded-lg bg-[color:var(--mk-text)] px-5 py-5 text-white">
                    <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white/55">Đầu tư ban đầu</div>
                    <div className="mt-2 text-[2.3rem] font-bold leading-none tracking-[-0.07em]">
                        {lowestPrice ? `${lowestPrice.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                    </div>
                    <div className="mt-2 text-sm text-white/72">
                        {lowestPrice ? 'Chi phí tối thiểu tại chi nhánh đang xem' : 'Cơ sở này chưa công khai bảng giá hiện hành'}
                    </div>
                </div>

                <div className="mt-5 space-y-3">
                    {renderActionButton(
                        leadAction,
                        'block w-full rounded-lg bg-[color:var(--mk-accent)] px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--mk-accent-ink)] transition hover:translate-y-[-1px]'
                    )}
                    <button
                        type="button"
                        onClick={() => navigateToSection(branchPrograms.length > 0 ? 'schedule' : 'pricing')}
                        className="block w-full rounded-lg border border-[color:var(--mk-line)] bg-white/70 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--mk-text)] transition hover:border-[color:var(--mk-accent)]/55"
                    >
                        {branchPrograms.length > 0 ? 'Xem lịch lớp' : 'Xem bảng giá'}
                    </button>
                </div>

                <div className="mt-4 text-sm leading-6 text-[color:var(--mk-muted)]">{leadAction.helper}</div>
            </div>

            {branches.length > 1 && (
                <div className="marketplace-panel gv-panel-pad-sm">
                    <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Chuyển chi nhánh</div>
                    <div className="mt-4 space-y-2">
                        {branches.map((branch) => (
                            <button
                                key={branch.id}
                                type="button"
                                onClick={() => setActiveBranchId(branch.id)}
                                className={`w-full rounded-lg border px-4 py-3 text-left transition ${branch.id === branchDetail?.id ? 'border-[color:var(--mk-accent)] bg-[color:var(--mk-accent-soft)]/55' : 'border-[color:var(--mk-line)] bg-white/70 hover:border-[color:var(--mk-accent)]/45'}`}
                            >
                                <div className="text-sm font-bold tracking-[-0.03em] text-[color:var(--mk-text)]">{branch.branch_name}</div>
                                <div className="mt-1 text-sm text-[color:var(--mk-muted)]">{[branch.district, branch.city].filter(Boolean).join(', ') || branch.address}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {similarGyms.length > 0 && (
                <div className="marketplace-panel gv-panel-pad-sm">
                    <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Venue tương tự</div>
                    <p className="mt-1 text-sm leading-6 text-[color:var(--mk-muted)]">
                        Gợi ý theo loại hình và khu vực — cuộn để xem thêm.
                    </p>
                    <GymSimilarSection similarGyms={similarGyms} />
                </div>
            )}

            <div className="marketplace-panel gv-panel-pad-sm">
                <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Lưu ý tại điểm tập</div>
                <div className="mt-4 space-y-3">
                    <SummaryPill
                        label="Hôm nay"
                        value={todayHours ? (todayHours.is_closed ? 'Đóng cửa' : `${todayHours.open || '—'} → ${todayHours.close || '—'}`) : 'Chưa cập nhật lịch'}
                    />
                    <SummaryPill label="Mật độ" value={branchDetail?.crowd_level_summary || 'Chưa cập nhật mật độ'} />
                    <SummaryPill label="Khung giờ tốt nhất" value={branchDetail?.best_visit_time_summary || 'Gắn thẻ cơ sở để nhắc chọn giờ trải nghiệm'} />
                    <SummaryPill label="Lưu ý đối tượng" value={branchDetail?.women_only_summary || branchDetail?.child_friendly_summary || 'Chưa có ghi chú riêng biệt'} />
                </div>
            </div>

            <div className="marketplace-panel gv-panel-pad-sm">
                <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Liên hệ nhanh</div>
                <div className="mt-4 grid gap-2">
                    {branchPhone && (
                        <a href={`tel:${normalizePhone(branchPhone)}`} className="rounded-lg border border-[color:var(--mk-line)] bg-white/75 px-4 py-3 text-sm font-bold text-[color:var(--mk-text)] transition hover:border-[color:var(--mk-accent)]/45">
                            Hotline · {branchPhone}
                        </a>
                    )}
                    {branchWhatsapp && (
                        <a href={buildWhatsappUrl(branchWhatsapp, `Xin chào, tôi muốn hỏi thêm về ${branchName}.`) || '#'} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[color:var(--mk-line)] bg-white/75 px-4 py-3 text-sm font-bold text-[color:var(--mk-text)] transition hover:border-[color:var(--mk-accent)]/45">
                            WhatsApp · {branchWhatsapp}
                        </a>
                    )}
                    {branchEmail && (
                        <a href={`mailto:${branchEmail}`} className="rounded-lg border border-[color:var(--mk-line)] bg-white/75 px-4 py-3 text-sm font-bold text-[color:var(--mk-text)] transition hover:border-[color:var(--mk-accent)]/45">
                            Email · {branchEmail}
                        </a>
                    )}
                </div>
            </div>

            <div className="marketplace-panel gv-panel-pad-sm">
                <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Chia sẻ cơ sở</div>
                <div className="mt-4 flex flex-wrap gap-2">
                    <ShareButton
                        url={canonicalUrl}
                        title={seoTitle}
                        text={seoDescription}
                        label="Chia sẻ Facebook"
                        variant="facebook"
                        className="!rounded-lg !border-[color:var(--mk-line)] !bg-white/75 !px-4 !py-3 !text-sm !font-bold !text-[color:var(--mk-text)]"
                        titleAttr="Chia sẻ venue này lên Facebook"
                    />
                    <ShareButton
                        url={canonicalUrl}
                        title={seoTitle}
                        text={seoDescription}
                        label="Sao chép Link"
                        className="!rounded-lg !border-[color:var(--mk-line)] !bg-white/75 !px-4 !py-3 !text-sm !font-bold !text-[color:var(--mk-text)]"
                        titleAttr="Sao chép liên kết cơ sở"
                    />
                </div>
            </div>
        </aside>
    );
};

export default GymDetailSidebar;
