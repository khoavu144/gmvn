import React, { useEffect, useMemo, useState } from 'react';
import { gymService } from '../../services/gymService';
import type { GymProgram, GymProgramSession } from '../../types';
import { Skeleton } from '../ui/Skeleton';

function SectionHeading({ kicker, title, description }: { kicker: string; title: string; description?: string }) {
    return (
        <div className="mb-6 space-y-2">
            <div className="marketplace-section-kicker">{kicker}</div>
            <h2 className="marketplace-section-title">{title}</h2>
            {description && <p className="marketplace-lead max-w-none text-[0.98rem]">{description}</p>}
        </div>
    );
}

const PROGRAM_TYPE_LABELS: Record<string, string> = {
    yoga: 'Yoga', pilates: 'Pilates', hiit: 'HIIT', cycling: 'Cycling',
    boxing: 'Boxing', dance: 'Dance', strength: 'Strength',
    meditation: 'Meditation', recovery: 'Recovery', mobility: 'Mobility', other: 'Class',
};

const BOOKING_MODE_LABELS: Record<string, string> = {
    walk_in: 'Walk-in', pre_booking: 'Đặt trước', member_only: 'Chỉ hội viên',
};

function formatProgramSubtitle(program: GymProgram): string {
    const parts: string[] = [];
    if (program.program_type) parts.push(PROGRAM_TYPE_LABELS[program.program_type] || program.program_type);
    if (program.level) parts.push(program.level);
    if (program.booking_mode) parts.push(BOOKING_MODE_LABELS[program.booking_mode] || program.booking_mode);
    return parts.join(' · ') || 'Chi tiết lịch lớp';
}

function formatSessionDate(iso?: string | null) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
    branchPrograms: GymProgram[];
    gymId: string;
    branchId?: string | null;
    setRef: (id: string) => (node: HTMLElement | null) => void;
}

const GymProgramsSection = React.memo(function GymProgramsSection({ branchPrograms, gymId, branchId, setRef }: Props) {
    const [pickedProgramId, setPickedProgramId] = useState<string | null>(null);
    const [programSessions, setProgramSessions] = useState<GymProgramSession[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);

    const effectiveProgramId = useMemo(() => {
        if (!branchPrograms.length) return null;
        if (pickedProgramId && branchPrograms.some((p) => p.id === pickedProgramId)) {
            return pickedProgramId;
        }
        return branchPrograms[0].id;
    }, [branchPrograms, pickedProgramId]);

    const activeProgram = branchPrograms.find((p) => p.id === effectiveProgramId) || null;

    /* eslint-disable react-hooks/set-state-in-effect -- fetch lifecycle: reset/loading must run when branch/program changes */
    useEffect(() => {
        if (!gymId || !branchId || !effectiveProgramId) {
            setProgramSessions([]);
            return;
        }
        let mounted = true;
        setSessionsLoading(true);
        gymService.getProgramSessions(gymId, branchId, effectiveProgramId)
            .then((res) => { if (mounted) setProgramSessions(res.success ? (res.sessions || []) : []); })
            .catch(() => { if (mounted) setProgramSessions([]); })
            .finally(() => { if (mounted) setSessionsLoading(false); });
        return () => { mounted = false; };
    }, [effectiveProgramId, branchId, gymId]);
    /* eslint-enable react-hooks/set-state-in-effect */

    if (branchPrograms.length === 0) return null;

    return (
            <section ref={setRef('schedule')} id="schedule" className="marketplace-panel p-6 sm:p-7">
                <SectionHeading
                    kicker="Lịch tập"
                    title="Lịch lớp và nhịp hoạt động tại chi nhánh"
                    description="Một cơ sở tốt không chỉ hiển thị đẹp trên hình ảnh — lịch lớp phải đủ rõ để bạn hình dung ngay tuần đầu tiên tập luyện của mình sẽ trông như thế nào."
                />

                <div className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
                    <div className="space-y-2.5">
                        {branchPrograms.map((program) => (
                            <button
                                key={program.id}
                                type="button"
                                onClick={() => setPickedProgramId(program.id)}
                                className={`w-full rounded-lg border px-4 py-3.5 text-left transition ${activeProgram?.id === program.id ? 'border-[color:var(--mk-accent)] bg-[color:var(--mk-accent-soft)]/55' : 'border-[color:var(--mk-line)] bg-white/80 hover:border-[color:var(--mk-accent)]/45'}`}
                            >
                                <div className="text-sm font-bold tracking-[-0.03em] text-[color:var(--mk-text)]">{program.title}</div>
                                <div className="mt-1 text-sm text-[color:var(--mk-muted)]">{formatProgramSubtitle(program)}</div>
                                {program.description && (
                                    <p className="mt-2.5 line-clamp-2 text-sm leading-6 text-[color:var(--mk-text-soft)]">{program.description}</p>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="rounded-lg border border-[color:var(--mk-line)] bg-white/78 p-4 sm:p-5">
                        {activeProgram ? (
                            <>
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Chương trình đã chọn</div>
                                        <h3 className="mt-1.5 text-xl font-bold tracking-[-0.04em] text-[color:var(--mk-text)]">{activeProgram.title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-[color:var(--mk-text-soft)]">{activeProgram.description || 'Chưa có mô tả chi tiết cho lớp này.'}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="marketplace-badge marketplace-badge--neutral">{activeProgram.capacity} chỗ</span>
                                        <span className="marketplace-badge marketplace-badge--neutral">{activeProgram.duration_minutes} phút</span>
                                    </div>
                                </div>

                                {(activeProgram.equipment_required || []).length > 0 && (
                                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                                        {(activeProgram.equipment_required || []).map((item) => (
                                            <span key={item} className="marketplace-badge marketplace-badge--neutral">{item}</span>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-5">
                                    <div className="mb-2.5 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Các buổi học sắp tới</div>
                                    {sessionsLoading ? (
                                        <div className="space-y-2.5">
                                            <Skeleton className="h-16 w-full rounded-lg" />
                                            <Skeleton className="h-16 w-full rounded-lg" />
                                        </div>
                                    ) : programSessions.length > 0 ? (
                                        <div className="space-y-2.5">
                                            {programSessions.slice(0, 6).map((session: GymProgramSession) => (
                                                <div key={session.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[color:var(--mk-line)] bg-[color:var(--mk-paper)] px-4 py-3">
                                                    <div>
                                                        <div className="text-sm font-bold text-[color:var(--mk-text)]">{formatSessionDate(session.starts_at)}</div>
                                                        <div className="text-sm text-[color:var(--mk-muted)]">{session.session_note || 'Đang mở đăng ký'}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[color:var(--mk-muted)]">Còn chỗ</div>
                                                        <div className="mt-1 text-sm font-bold text-[color:var(--mk-text)]">{session.seats_remaining}/{session.seats_total}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-dashed border-[color:var(--mk-line)] px-4 py-4 text-sm text-[color:var(--mk-muted)]">
                                            Lịch chi tiết cho lớp này đang được cập nhật. Bạn vẫn có thể dùng CTA bên phải để nhận tư vấn nhanh từ chi nhánh.
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="rounded-lg border border-dashed border-[color:var(--mk-line)] px-4 py-4 text-sm text-[color:var(--mk-muted)]">
                                Chưa có chương trình lớp cho chi nhánh này.
                            </div>
                        )}
                    </div>
                </div>
            </section>
    );
});

export default GymProgramsSection;
