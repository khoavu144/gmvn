import { useState } from 'react';
import { useCoachApplication } from '../../hooks/useCoachApplication';
import CoachUpgradeWizard from './CoachUpgradeWizard';

export default function UpgradeToCoachBanner() {
    const { application, isLoading, isSubmitting, error, submit } = useCoachApplication();
    const [wizardOpen, setWizardOpen] = useState(false);

    if (isLoading) return null;

    // ── Already approved (user_type just hasn't refreshed) ──
    if (application?.status === 'approved') return null;

    // ── Pending review ──────────────────────────────────────
    if (application?.status === 'pending') {
        return (
            <div style={{
                background: '#f8fafc', border: '1.5px solid #e2e8f0',
                borderRadius: 16, padding: '20px 24px',
                display: 'flex', alignItems: 'center', gap: 16,
            }}>
                <span style={{ fontSize: '1.5rem' }}>⏳</span>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>
                        Đơn đăng ký Coach đang chờ duyệt
                    </p>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                        Đội ngũ GYMERVIET đang xem xét đơn của bạn. Thường trong vòng 1–3 ngày làm việc.
                    </p>
                </div>
                <span style={{
                    padding: '4px 12px', borderRadius: 999, background: '#fef3c7',
                    color: '#92400e', fontSize: '0.7rem', fontWeight: 700,
                    letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}>
                    Đang xét duyệt
                </span>
            </div>
        );
    }

    // ── Rejected — allow re-apply ───────────────────────────
    if (application?.status === 'rejected') {
        return (
            <>
                <div style={{
                    background: '#fff5f5', border: '1.5px solid #fecaca',
                    borderRadius: 16, padding: '20px 24px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.5rem' }}>❌</span>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#991b1b', margin: '0 0 4px' }}>
                                Đơn bị từ chối
                            </p>
                            <p style={{ fontSize: '0.78rem', color: '#7f1d1d', margin: '0 0 12px', lineHeight: 1.5 }}>
                                {application.rejection_reason ?? 'Đơn không đáp ứng tiêu chí hiện tại.'}
                            </p>
                            <button
                                onClick={() => setWizardOpen(true)}
                                style={{
                                    padding: '8px 18px', borderRadius: 999, border: 'none',
                                    background: '#1e293b', color: '#fff',
                                    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                                }}
                            >Nộp đơn lại</button>
                        </div>
                    </div>
                </div>
                <CoachUpgradeWizard
                    isOpen={wizardOpen}
                    onClose={() => setWizardOpen(false)}
                    onSubmit={submit}
                    isSubmitting={isSubmitting}
                    error={error}
                />
            </>
        );
    }

    // ── Default: no application yet ─────────────────────────
    return (
        <>
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                borderRadius: 16, padding: '24px 28px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 20, flexWrap: 'wrap',
                boxShadow: '0 8px 28px rgba(15,23,42,0.18)',
            }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                    <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 999,
                        background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)',
                        fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em',
                        textTransform: 'uppercase', marginBottom: 10,
                    }}>Cơ hội mới</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: '0 0 8px', lineHeight: 1.3 }}>
                        Chia sẻ chuyên môn — Trở thành Coach GYMERVIET
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.55, maxWidth: 420 }}>
                        Bạn có thành tích thi đấu hoặc kiến thức chuyên sâu? Đăng ký làm Coach để xây dựng hồ sơ, nhận học viên và tăng thu nhập.
                    </p>
                </div>
                <button
                    onClick={() => setWizardOpen(true)}
                    style={{
                        padding: '12px 24px', borderRadius: 999, border: 'none',
                        background: '#fff', color: '#0f172a',
                        fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
                        whiteSpace: 'nowrap', flexShrink: 0,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
                >
                    🚀 Đăng ký làm Coach
                </button>
            </div>

            <CoachUpgradeWizard
                isOpen={wizardOpen}
                onClose={() => setWizardOpen(false)}
                onSubmit={submit}
                isSubmitting={isSubmitting}
                error={error}
            />
        </>
    );
}
