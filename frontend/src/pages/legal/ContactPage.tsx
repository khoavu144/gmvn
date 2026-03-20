import { useState } from 'react';
import LegalPageLayout from '../../components/LegalPageLayout';

type ContactTopic = 'general' | 'payment' | 'account' | 'security' | 'trainer' | 'other';

const topics: { value: ContactTopic; label: string }[] = [
    { value: 'general', label: 'Câu hỏi chung về nền tảng' },
    { value: 'payment', label: 'Vấn đề thanh toán / hoàn tiền' },
    { value: 'account', label: 'Vấn đề tài khoản' },
    { value: 'security', label: 'Báo cáo lỗ hổng bảo mật' },
    { value: 'trainer', label: 'Đăng ký / xác minh HLV' },
    { value: 'other', label: 'Khác' },
];

export default function ContactPage() {
    const [form, setForm] = useState({
        name: '', email: '', topic: '' as ContactTopic | '', message: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API delay
        await new Promise(res => setTimeout(res, 800));
        setLoading(false);
        setSubmitted(true);
    };

    return (
        <LegalPageLayout
            title="Liên hệ"
            subtitle="Chúng tôi thường phản hồi trong vòng 24 giờ vào ngày làm việc (Thứ 2 – Thứ 6)."
            breadcrumbs={[{ label: 'Liên hệ' }]}
            maxWidth="lg"
        >
            <div className="grid sm:grid-cols-3 gap-8">
                {/* Contact info sidebar */}
                <div className="space-y-4">
                    {[
                        { icon: '📧', label: 'Email hỗ trợ', value: 'support@gymerviet.com' },
                        { icon: '🔒', label: 'Bảo mật', value: 'security@gymerviet.com' },
                        { icon: '⏰', label: 'Giờ làm việc', value: 'T2–T6, 8:00–17:30' },
                    ].map((item) => (
                        <div key={item.label} className="flex items-start gap-3 p-3 border border-[color:var(--mk-line)] rounded-xs bg-white">
                            <span className="text-lg mt-0.5">{item.icon}</span>
                            <div>
                                <div className="text-xs font-semibold text-[color:var(--mk-muted)] uppercase tracking-wider">{item.label}</div>
                                <div className="text-sm text-black mt-0.5 font-medium">{item.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact form */}
                <div className="sm:col-span-2">
                    {submitted ? (
                        <div className="card text-center py-12">
                            <div className="text-3xl mb-4">✓</div>
                            <h3 className="font-bold text-black text-lg mb-2">Đã nhận được tin nhắn!</h3>
                            <p className="text-sm text-[color:var(--mk-text-soft)]">
                                Chúng tôi sẽ phản hồi đến <strong>{form.email}</strong> trong vòng 24 giờ.
                            </p>
                            <button
                                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', topic: '', message: '' }); }}
                                className="btn-secondary mt-6"
                            >
                                Gửi tin nhắn khác
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="card space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Họ và tên *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        required
                                        className="form-input"
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        required
                                        className="form-input"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Chủ đề *</label>
                                <select
                                    value={form.topic}
                                    onChange={e => setForm(f => ({ ...f, topic: e.target.value as ContactTopic }))}
                                    required
                                    className="form-input"
                                >
                                    <option value="">Chọn chủ đề...</option>
                                    {topics.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="form-label">Nội dung *</label>
                                <textarea
                                    value={form.message}
                                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                    required
                                    rows={5}
                                    minLength={20}
                                    className="form-input resize-none"
                                    placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                                />
                                <p className="form-helper">{form.message.length}/500 ký tự</p>
                            </div>

                            <div className="pt-2 border-t border-[color:var(--mk-line)] flex justify-end">
                                <button type="submit" disabled={loading} className="btn-primary min-w-[140px]">
                                    {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </LegalPageLayout>
    );
}
