import type { GymTrainerLink } from '../../types';

interface Props {
    isVerified: boolean;
    basePriceMonthly: number | null;
    gymLinks: GymTrainerLink[];
    programCount: number;
    specialties: string[] | null;
    testimonialCount: number;
    beforeAfterCount: number;
}

export default function CoachTrustRibbon({
    isVerified,
    basePriceMonthly,
    gymLinks,
    programCount,
    specialties,
    testimonialCount,
    beforeAfterCount,
}: Props) {
    const proofs: { icon: string; label: string; value: string }[] = [];

    if (isVerified) {
        proofs.push({ icon: '✓', label: 'Xác thực', value: 'Đã xác minh' });
    }

    if (gymLinks.length > 0) {
        const gymNames = gymLinks.map(l => l.gym_center?.name).filter(Boolean);
        proofs.push({
            icon: '🏋️',
            label: 'Hoạt động tại',
            value: gymNames.length > 0 ? gymNames.slice(0, 2).join(', ') : `${gymLinks.length} phòng gym`
        });
    }

    if (programCount > 0) {
        proofs.push({ icon: '📋', label: 'Gói tập', value: `${programCount} chương trình` });
    }

    if (beforeAfterCount > 0) {
        proofs.push({ icon: '📸', label: 'Kết quả', value: `${beforeAfterCount} kết quả` });
    }

    if (testimonialCount > 0) {
        proofs.push({ icon: '⭐', label: 'Đánh giá', value: `${testimonialCount} phản hồi` });
    }

    if (basePriceMonthly) {
        proofs.push({
            icon: '💰',
            label: 'Giá từ',
            value: `${Number(basePriceMonthly).toLocaleString('vi-VN')}₫`
        });
    }

    if (specialties && specialties.length > 2) {
        proofs.push({
            icon: '🎯',
            label: 'Chuyên môn',
            value: `${specialties.length} lĩnh vực`
        });
    }

    if (proofs.length === 0) return null;

    return (
        <div className="bg-white border-b border-[color:var(--mk-line)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex overflow-x-auto gap-0 py-0 scrollbar-hide -mx-4 sm:mx-0">
                    {proofs.slice(0, 6).map((proof, i) => (
                        <div
                            key={i}
                            className={`flex items-center gap-3 px-5 py-4 shrink-0 ${
                                i > 0 ? 'border-l border-[color:var(--mk-line)]' : ''
                            }`}
                        >
                            <span className="text-base">{proof.icon}</span>
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--mk-muted)]">
                                    {proof.label}
                                </div>
                                <div className="text-sm font-semibold text-black truncate">
                                    {proof.value}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
