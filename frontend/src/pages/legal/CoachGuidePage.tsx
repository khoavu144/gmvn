import LegalPageLayout, { LegalSection, LegalList, LegalCallout } from '../../components/LegalPageLayout';
import { Link } from 'react-router-dom';

export default function TrainerGuidePage() {
    return (
        <LegalPageLayout
            title="Bắt đầu làm Coach"
            subtitle="Hướng dẫn đầy đủ để xây dựng profile chuyên nghiệp và bắt đầu nhận học viên trên GYMERVIET."
            breadcrumbs={[{ label: 'Dành cho Coach' }, { label: 'Bắt đầu làm Coach' }]}
            maxWidth="xl"
        >
            <LegalCallout type="info">
                GYMERVIET hiện không yêu cầu phí đăng ký cho Coach. Chúng tôi chỉ thu 5% phí nền tảng
                khi có giao dịch thành công.
            </LegalCallout>

            <div className="mt-8">

                <LegalSection title="Yêu cầu tối thiểu để trở thành Coach">
                    <LegalList items={[
                        'Có ít nhất 1 chứng chỉ fitness được công nhận (NASM, ACE, ACSM, VFF, hoặc tương đương).',
                        'Có kinh nghiệm thực tế huấn luyện (online hoặc offline).',
                        'Có tài khoản ngân hàng Việt Nam để nhận thanh toán.',
                        'Cam kết tuân thủ Tiêu chuẩn Cộng đồng và Chính sách của GYMERVIET.',
                    ]} />
                </LegalSection>

                <LegalSection title="Quy trình xác minh Coach (Badge Verified)">
                    <div className="space-y-3">
                        {[
                            { step: '01', title: 'Đăng ký tài khoản', desc: 'Chọn loại tài khoản "Coach chuyên nghiệp" khi đăng ký.' },
                            { step: '02', title: 'Hoàn thiện hồ sơ', desc: 'Điền đầy đủ thông tin Profile, thêm ảnh chứng chỉ vào Gallery, khai báo kinh nghiệm.' },
                            { step: '03', title: 'Gửi yêu cầu xác minh', desc: 'Liên hệ qua trang Liên hệ, chọn chủ đề "Đăng ký / xác minh Coach". Đính kèm ảnh chứng chỉ bản gốc.' },
                            { step: '04', title: 'Đội ngũ xem xét', desc: 'Chúng tôi xem xét trong 3–5 ngày làm việc. Kết quả gửi qua email.' },
                            { step: '05', title: 'Nhận badge Verified', desc: 'Sau khi xác minh, profile sẽ hiển thị badge "Verified" — tăng đáng kể độ tin tưởng từ học viên.' },
                        ].map((item) => (
                            <div key={item.step} className="flex gap-4 p-4 border border-gray-200 rounded-xs bg-white">
                                <span className="text-xs font-bold font-mono text-gray-400 pt-0.5 w-6 flex-shrink-0">{item.step}</span>
                                <div>
                                    <h4 className="font-semibold text-black text-sm">{item.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </LegalSection>

                <LegalSection title="Mẹo xây dựng profile hiệu quả">
                    <LegalList items={[
                        'Ảnh đại diện: Dùng ảnh chân dung rõ mặt, chuyên nghiệp, background sạch.',
                        'Headline: Cụ thể thay vì chung chung. "Strength Coach | 8 năm | 200+ học viên" tốt hơn "Personal Trainer".',
                        'Gallery: Upload 6–10 ảnh đa dạng (ảnh tập, transformation khách hàng, giải đấu).',
                        'FAQ: Trả lời trước 5–7 câu hỏi phổ biến nhất để giảm thời gian tư vấn lặp đi lặp lại.',
                        'Gói tập: Tối thiểu 2 gói — 1 gói online giá tốt và 1 gói premium đầy đủ dịch vụ.',
                        'Chứng chỉ: Nhập JSON chứng chỉ đầy đủ để hiển thị đẹp trên profile public.',
                    ]} />
                </LegalSection>

                <LegalSection title="Chính sách doanh thu">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="text-left py-3 px-4 font-bold text-black">Giá học viên trả</th>
                                    <th className="text-right py-3 px-4 font-bold text-black">Phí nền tảng (5%)</th>
                                    <th className="text-right py-3 px-4 font-bold text-black">Coach nhận (95%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    [500000, 25000, 475000],
                                    [1000000, 50000, 950000],
                                    [2000000, 100000, 1900000],
                                    [5000000, 250000, 4750000],
                                ].map((row, i) => (
                                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">{row[0].toLocaleString('vi-VN')}đ</td>
                                        <td className="py-3 px-4 text-right text-gray-600">{row[1].toLocaleString('vi-VN')}đ</td>
                                        <td className="py-3 px-4 text-right font-semibold text-black">{row[2].toLocaleString('vi-VN')}đ</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </LegalSection>

                <div className="flex gap-4 mt-4">
                    <Link to="/register" className="btn-primary">Đăng ký ngay</Link>
                    <Link to="/contact" className="btn-secondary">Liên hệ tư vấn</Link>
                </div>
            </div>
        </LegalPageLayout>
    );
}
