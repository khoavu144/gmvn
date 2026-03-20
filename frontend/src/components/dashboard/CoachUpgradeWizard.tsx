import { useState } from 'react';
import type { CoachApplicationInput } from '../../hooks/useCoachApplication';

const SPECIALTY_SUGGESTIONS = [
    'Giảm cân', 'Tăng cơ', 'Cardio', 'Yoga', 'CrossFit',
    'Calisthenics', 'Dinh dưỡng thể thao', 'Thi đấu thể hình',
    'Power Lifting', 'HIIT', 'Pilates', 'Chạy bộ', 'Boxing',
    'Phục hồi chấn thương', 'Tập cho người cao tuổi',
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (input: CoachApplicationInput) => Promise<boolean>;
    isSubmitting: boolean;
    error: string | null;
}

export default function CoachUpgradeWizard({ isOpen, onClose, onSubmit, isSubmitting, error }: Props) {
    const [step, setStep] = useState(1);
    const [agreed, setAgreed] = useState(false);

    // Form state
    const [specialties, setSpecialties] = useState<string[]>([]);
    const [headline, setHeadline] = useState('');
    const [basePriceMonthly, setBasePriceMonthly] = useState('');
    const [motivation, setMotivation] = useState('');
    const [certificationsNote, setCertificationsNote] = useState('');

    const toggleSpecialty = (s: string) => {
        setSpecialties(prev =>
            prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
        );
    };

    const canNext1 = specialties.length > 0 && headline.trim().length >= 10;
    const canNext2 = motivation.trim().length >= 50;
    const canSubmit = canNext1 && canNext2 && agreed;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        const ok = await onSubmit({
            specialties,
            headline: headline.trim(),
            base_price_monthly: basePriceMonthly ? Math.min(Number(basePriceMonthly), 99999999) : null,
            motivation: motivation.trim(),
            certifications_note: certificationsNote.trim() || null,
        });
        if (ok) onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wizard-title"
            style={{
                position: 'fixed', inset: 0, zIndex: 999,
                background: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px',
            }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{
                background: '#fff', borderRadius: 8, width: '100%', maxWidth: 560,
                maxHeight: '90vh', overflowY: 'auto', padding: '32px 28px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                    <div>
                        <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>
                            Bước {step} / 3
                        </p>
                        <h2 id="wizard-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#080c1e', margin: 0 }}>
                            {step === 1 && 'Chuyên môn & Định vị'}
                            {step === 2 && 'Giá dịch vụ & Câu chuyện'}
                            {step === 3 && 'Xem lại & Gửi đơn'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Đóng"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.4rem', lineHeight: 1, padding: 4 }}
                    >×</button>
                </div>

                {/* Progress bar */}
                <div style={{ height: 4, background: '#f0f0f0', borderRadius: 8, marginBottom: 28 }}>
                    <div style={{ height: 4, borderRadius: 8, background: '#080c1e', width: `${(step / 3) * 100}%`, transition: 'width 0.3s ease' }} />
                </div>

                {/* ── STEP 1 ─────────────────────────────── */}
                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 10 }}>
                                Chuyên môn của bạn *
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {SPECIALTY_SUGGESTIONS.map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => toggleSpecialty(s)}
                                        style={{
                                            padding: '6px 14px', borderRadius: 8,
                                            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                                            border: specialties.includes(s) ? '2px solid #080c1e' : '2px solid #e5e7eb',
                                            background: specialties.includes(s) ? '#080c1e' : '#fff',
                                            color: specialties.includes(s) ? '#fff' : '#374151',
                                            transition: 'all 0.12s',
                                        }}
                                    >{s}</button>
                                ))}
                            </div>
                            {specialties.length === 0 && (
                                <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 6 }}>Chọn ít nhất 1 chuyên môn</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="wiz-headline" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                                Tiêu đề profile * <span style={{ color: '#9ca3af', fontWeight: 400 }}>(10–120 ký tự)</span>
                            </label>
                            <input
                                id="wiz-headline"
                                value={headline}
                                onChange={e => setHeadline(e.target.value)}
                                maxLength={120}
                                placeholder='VD: "Coach giảm cân chuyên biệt cho dân văn phòng"'
                                style={{
                                    width: '100%', padding: '10px 14px', borderRadius: 8,
                                    border: '1.5px solid #e5e7eb', fontSize: '0.88rem',
                                    outline: 'none', boxSizing: 'border-box',
                                }}
                            />
                            <p style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: 4, textAlign: 'right' }}>{headline.length}/120</p>
                        </div>
                    </div>
                )}

                {/* ── STEP 2 ─────────────────────────────── */}
                {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <label htmlFor="wiz-price" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                                Giá dịch vụ / tháng (VNĐ) <span style={{ color: '#9ca3af', fontWeight: 400 }}>— tùy chọn</span>
                            </label>
                            <input
                                id="wiz-price"
                                type="number"
                                value={basePriceMonthly}
                                onChange={e => {
                                    const v = e.target.value;
                                    if (v === '' || (Number(v) >= 0 && Number(v) <= 99999999)) {
                                        setBasePriceMonthly(v);
                                    }
                                }}
                                min={0}
                                max={99999999}
                                placeholder="VD: 2000000"
                                style={{
                                    width: '100%', padding: '10px 14px', borderRadius: 8,
                                    border: '1.5px solid #e5e7eb', fontSize: '0.88rem',
                                    outline: 'none', boxSizing: 'border-box',
                                }}
                            />
                            {basePriceMonthly && (
                                <p style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: 4 }}>
                                    ≈ {Number(basePriceMonthly).toLocaleString('vi-VN')} đ/tháng
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="wiz-motivation" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                                Tại sao bạn muốn trở thành Coach? * <span style={{ color: '#9ca3af', fontWeight: 400 }}>(tối thiểu 50 ký tự)</span>
                            </label>
                            <textarea
                                id="wiz-motivation"
                                value={motivation}
                                onChange={e => setMotivation(e.target.value)}
                                rows={5}
                                maxLength={1000}
                                placeholder="Chia sẻ câu chuyện và định hướng phát triển của bạn..."
                                style={{
                                    width: '100%', padding: '10px 14px', borderRadius: 8,
                                    border: '1.5px solid #e5e7eb', fontSize: '0.88rem',
                                    outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                                    fontFamily: 'inherit',
                                }}
                            />
                            <p style={{ fontSize: '0.68rem', color: motivation.length < 50 ? '#ef4444' : '#9ca3af', marginTop: 4, textAlign: 'right' }}>
                                {motivation.length}/1000 {motivation.length < 50 ? `(cần thêm ${50 - motivation.length} ký tự)` : '✓'}
                            </p>
                        </div>
                    </div>
                )}

                {/* ── STEP 3 ─────────────────────────────── */}
                {step === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Summary */}
                        <div style={{ background: '#f9fafb', borderRadius: 8, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <Row label="Chuyên môn" value={specialties.join(', ')} />
                            <Row label="Tiêu đề" value={headline} />
                            {basePriceMonthly && <Row label="Giá/tháng" value={`${Number(basePriceMonthly).toLocaleString('vi-VN')} đ`} />}
                            <Row label="Lý do" value={motivation.slice(0, 120) + (motivation.length > 120 ? '...' : '')} />
                        </div>

                        <div>
                            <label htmlFor="wiz-cert" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                                Chứng chỉ / giải thưởng <span style={{ color: '#9ca3af', fontWeight: 400 }}>— tùy chọn</span>
                            </label>
                            <textarea
                                id="wiz-cert"
                                value={certificationsNote}
                                onChange={e => setCertificationsNote(e.target.value)}
                                rows={3}
                                maxLength={500}
                                placeholder="VD: Chứng chỉ ACE-CPT, Top 3 Mr. Saigon Fitness 2023..."
                                style={{
                                    width: '100%', padding: '10px 14px', borderRadius: 8,
                                    border: '1.5px solid #e5e7eb', fontSize: '0.88rem',
                                    outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </div>

                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={e => setAgreed(e.target.checked)}
                                style={{ marginTop: 2, flexShrink: 0 }}
                            />
                            <span style={{ fontSize: '0.78rem', color: '#374151', lineHeight: 1.5 }}>
                                Tôi xác nhận thông tin trên là chính xác và đồng ý với{' '}
                                <span style={{ color: '#080c1e', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>
                                    điều khoản dành cho Coach GYMERVIET
                                </span>
                            </span>
                        </label>

                        {error && (
                            <p style={{ fontSize: '0.82rem', color: '#dc2626', background: '#fef2f2', padding: '10px 14px', borderRadius: 8, margin: 0 }}>
                                ⚠️ {error}
                            </p>
                        )}
                    </div>
                )}

                {/* Footer buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, gap: 12 }}>
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(s => s - 1)}
                            style={{ padding: '11px 20px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', color: '#374151' }}
                        >← Quay lại</button>
                    ) : <div />}

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            disabled={step === 1 ? !canNext1 : !canNext2}
                            style={{
                                padding: '11px 24px', borderRadius: 8, border: 'none',
                                background: (step === 1 ? canNext1 : canNext2) ? '#080c1e' : '#e5e7eb',
                                color: (step === 1 ? canNext1 : canNext2) ? '#fff' : '#9ca3af',
                                fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                            }}
                        >Tiếp theo →</button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit || isSubmitting}
                            style={{
                                padding: '11px 24px', borderRadius: 8, border: 'none',
                                background: canSubmit && !isSubmitting ? '#080c1e' : '#e5e7eb',
                                color: canSubmit && !isSubmitting ? '#fff' : '#9ca3af',
                                fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                            }}
                        >
                            {isSubmitting ? 'Đang gửi...' : '✓ Gửi đơn đăng ký'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

const Row = ({ label, value }: { label: string; value: string }) => (
    <div>
        <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: '0.82rem', color: '#111', fontWeight: 500, margin: 0 }}>{value}</p>
    </div>
);
