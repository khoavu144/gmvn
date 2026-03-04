import { useState } from 'react';
import LegalPageLayout, { LegalCallout } from '../../components/LegalPageLayout';

type ViolationType =
    | 'fake_info'
    | 'harassment'
    | 'scam'
    | 'inappropriate_content'
    | 'fake_payment'
    | 'spam'
    | 'security'
    | 'other';

const violationTypes: { value: ViolationType; label: string; desc: string }[] = [
    { value: 'fake_info', label: 'Thông tin giả mạo', desc: 'Chứng chỉ, kinh nghiệm hoặc thông tin cá nhân không trung thực' },
    { value: 'harassment', label: 'Quấy rối / Đe dọa', desc: 'Ngôn ngữ thô tục, đe dọa, hoặc hành vi gây khó chịu trong tin nhắn' },
    { value: 'scam', label: 'Gian lận / Lừa đảo', desc: 'Yêu cầu thanh toán ngoài hệ thống, không cung cấp dịch vụ sau khi nhận tiền' },
    { value: 'inappropriate_content', label: 'Nội dung không phù hợp', desc: 'Ảnh hoặc mô tả vi phạm Tiêu chuẩn Cộng đồng' },
    { value: 'fake_payment', label: 'Gian lận thanh toán', desc: 'Giao dịch đáng ngờ, chuyển khoản sai nội dung cố ý' },
    { value: 'spam', label: 'Spam / Quảng cáo', desc: 'Gửi tin nhắn hàng loạt, quảng cáo ngoài mục đích fitness' },
    { value: 'security', label: 'Lỗ hổng bảo mật', desc: 'Phát hiện lỗi kỹ thuật hoặc lỗ hổng bảo mật trên nền tảng' },
    { value: 'other', label: 'Khác', desc: 'Vi phạm không thuộc các nhóm trên' },
];

export default function ReportPage() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [form, setForm] = useState({
        violation_type: '' as ViolationType | '',
        reported_user_id: '',
        description: '',
        evidence_url: '',
        reporter_email: '',
        anonymous: false,
    });
    const [submitted, setSubmitted] = useState(false);

    const handleNext = () => {
        if (step === 1 && form.violation_type) setStep(2);
        if (step === 2 && form.description.length >= 20) setStep(3);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API
        await new Promise(r => setTimeout(r, 600));
        setSubmitted(true);
    };

    const selectedType = violationTypes.find(v => v.value === form.violation_type);

    if (submitted) {
        return (
            <LegalPageLayout title="Báo cáo vi phạm" breadcrumbs={[{ label: 'Báo cáo vi phạm' }]}>
                <div className="card text-center py-16 max-w-sm mx-auto">
                    <div className="text-4xl mb-4 text-black font-bold">✓</div>
                    <h3 className="font-bold text-black text-lg mb-2">Đã nhận báo cáo</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Chúng tôi sẽ điều tra và xử lý trong vòng <strong>3–5 ngày làm việc</strong>.
                        {!form.anonymous && ` Kết quả sẽ được gửi đến ${form.reporter_email}.`}
                    </p>
                    <p className="text-xs text-gray-400 mt-4">
                        Mã báo cáo: RPT-{Math.random().toString(36).substring(7).toUpperCase()}
                    </p>
                </div>
            </LegalPageLayout>
        );
    }

    return (
        <LegalPageLayout
            title="Báo cáo vi phạm"
            subtitle="Giúp chúng tôi duy trì cộng đồng an toàn và chất lượng."
            breadcrumbs={[{ label: 'Báo cáo vi phạm' }]}
        >
            <LegalCallout type="info">
                Báo cáo giả mạo hoặc cố ý gây hại cho người dùng khác vi phạm Tiêu chuẩn Cộng đồng
                và có thể dẫn đến khóa tài khoản của người báo cáo.
            </LegalCallout>

            {/* Step indicator */}
            <div className="flex items-center gap-2 my-8">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                            {step > s ? '✓' : s}
                        </div>
                        <span className={`text-xs ${step >= s ? 'text-black font-medium' : 'text-gray-400'}`}>
                            {['Loại vi phạm', 'Chi tiết', 'Xác nhận'][s - 1]}
                        </span>
                        {s < 3 && <div className={`flex-1 h-px w-8 ${step > s ? 'bg-black' : 'bg-gray-200'}`} />}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                {/* Step 1 */}
                {step === 1 && (
                    <div className="space-y-3">
                        <h3 className="font-semibold text-black mb-4">Chọn loại vi phạm:</h3>
                        {violationTypes.map((type) => (
                            <label
                                key={type.value}
                                className={`flex items-start gap-4 p-4 border rounded-xs cursor-pointer transition-colors ${form.violation_type === type.value
                                    ? 'border-black bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-400 bg-white'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="violation_type"
                                    value={type.value}
                                    checked={form.violation_type === type.value}
                                    onChange={() => setForm(f => ({ ...f, violation_type: type.value }))}
                                    className="mt-0.5 text-black border-gray-300"
                                />
                                <div>
                                    <div className="font-semibold text-sm text-black">{type.label}</div>
                                    <div className="text-xs text-gray-600 mt-0.5">{type.desc}</div>
                                </div>
                            </label>
                        ))}
                        <div className="pt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={!form.violation_type}
                                className="btn-primary"
                            >
                                Tiếp theo →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xs text-sm">
                            <span className="font-semibold text-black">Loại vi phạm:</span>{' '}
                            <span className="text-gray-700">{selectedType?.label}</span>
                        </div>

                        <div>
                            <label className="form-label">ID hoặc tên người dùng bị báo cáo</label>
                            <input
                                type="text"
                                value={form.reported_user_id}
                                onChange={e => setForm(f => ({ ...f, reported_user_id: e.target.value }))}
                                className="form-input"
                                placeholder="Email, tên hiển thị, hoặc đường dẫn profile"
                            />
                        </div>

                        <div>
                            <label className="form-label">Mô tả vi phạm *</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                required
                                minLength={20}
                                rows={4}
                                className="form-input resize-none"
                                placeholder="Mô tả chi tiết những gì đã xảy ra, kèm thời gian cụ thể nếu có..."
                            />
                            <p className="form-helper">{form.description.length} ký tự (tối thiểu 20)</p>
                        </div>

                        <div>
                            <label className="form-label">Link bằng chứng (URL ảnh, tin nhắn) — Không bắt buộc</label>
                            <input
                                type="url"
                                value={form.evidence_url}
                                onChange={e => setForm(f => ({ ...f, evidence_url: e.target.value }))}
                                className="form-input"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button type="button" onClick={() => setStep(1)} className="btn-secondary">← Quay lại</button>
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={form.description.length < 20}
                                className="btn-primary"
                            >
                                Tiếp theo →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Email của bạn (để nhận phản hồi)</label>
                            <input
                                type="email"
                                value={form.reporter_email}
                                onChange={e => setForm(f => ({ ...f, reporter_email: e.target.value }))}
                                disabled={form.anonymous}
                                className="form-input"
                                placeholder="your@email.com"
                            />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer w-fit">
                            <input
                                type="checkbox"
                                checked={form.anonymous}
                                onChange={e => setForm(f => ({ ...f, anonymous: e.target.checked, reporter_email: '' }))}
                                className="rounded-xs text-black border-gray-300"
                            />
                            <span className="text-sm text-gray-700">Báo cáo ẩn danh (không nhận phản hồi)</span>
                        </label>

                        <div className="p-4 border border-gray-200 rounded-xs bg-gray-50 text-sm space-y-1.5 text-gray-700">
                            <p><span className="font-semibold text-black">Loại vi phạm:</span> {selectedType?.label}</p>
                            {form.reported_user_id && <p><span className="font-semibold text-black">Đối tượng:</span> {form.reported_user_id}</p>}
                            <p><span className="font-semibold text-black">Mô tả:</span> {form.description.slice(0, 100)}{form.description.length > 100 ? '...' : ''}</p>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button type="button" onClick={() => setStep(2)} className="btn-secondary">← Quay lại</button>
                            <button
                                type="submit"
                                disabled={!form.anonymous && !form.reporter_email}
                                className="btn-primary"
                            >
                                Gửi báo cáo
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </LegalPageLayout>
    );
}
