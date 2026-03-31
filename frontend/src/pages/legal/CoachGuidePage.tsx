import LegalPageLayout, { LegalSection, LegalList, LegalCallout } from '../../components/LegalPageLayout';
import { Link } from 'react-router-dom';

export default function TrainerGuidePage() {
    return (
        <LegalPageLayout
            title="Bắt đầu làm huấn luyện viên"
            subtitle="Hướng dẫn đầy đủ để xây dựng hồ sơ chuyên nghiệp và bắt đầu nhận học viên trên GYMERVIET."
            breadcrumbs={[{ label: 'Dành cho huấn luyện viên' }, { label: 'Bắt đầu làm huấn luyện viên' }]}
            maxWidth="xl"
        >
            <LegalCallout type="info">
                GYMERVIET hiện không thu phí đăng ký, không thu phí sàn và không đứng giữa để xử lý thanh toán cho huấn luyện viên.
            </LegalCallout>

            <div className="mt-8">

                <LegalSection title="Yêu cầu tối thiểu để trở thành huấn luyện viên">
                    <LegalList items={[
                        'Có ít nhất 1 chứng chỉ huấn luyện được công nhận (NASM, ACE, ACSM, VFF hoặc tương đương).',
                        'Có kinh nghiệm thực tế huấn luyện (online hoặc offline).',
                        'Có cách làm việc rõ ràng với học viên về lịch, phạm vi dịch vụ và điều kiện hợp tác.',
                        'Cam kết tuân thủ Tiêu chuẩn Cộng đồng và Chính sách của GYMERVIET.',
                    ]} />
                </LegalSection>

                <LegalSection title="Quy trình xác minh hồ sơ">
                    <div className="space-y-3">
                        {[
                            { step: '01', title: 'Đăng ký tài khoản', desc: 'Chọn loại tài khoản "Huấn luyện viên chuyên nghiệp" khi đăng ký.' },
                            { step: '02', title: 'Hoàn thiện hồ sơ', desc: 'Điền đầy đủ thông tin hồ sơ, thêm ảnh chứng chỉ vào thư viện ảnh, khai báo kinh nghiệm.' },
                            { step: '03', title: 'Gửi yêu cầu xác minh', desc: 'Liên hệ qua trang Liên hệ, chọn chủ đề "Đăng ký / xác minh huấn luyện viên". Đính kèm ảnh chứng chỉ bản gốc.' },
                            { step: '04', title: 'Đội ngũ xem xét', desc: 'Chúng tôi xem xét trong 3–5 ngày làm việc. Kết quả gửi qua email.' },
                            { step: '05', title: 'Nhận dấu xác minh', desc: 'Sau khi xác minh, hồ sơ sẽ hiển thị dấu "Xác minh" — tăng đáng kể độ tin tưởng từ học viên.' },
                        ].map((item) => (
                            <div key={item.step} className="flex gap-4 p-4 border border-gray-200 rounded-xs bg-white">
                                <span className="text-xs font-bold font-mono text-gray-500 pt-0.5 w-6 flex-shrink-0">{item.step}</span>
                                <div>
                                    <h4 className="font-semibold text-black text-sm">{item.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </LegalSection>

                <LegalSection title="Mẹo xây dựng hồ sơ hiệu quả">
                    <LegalList items={[
                        'Ảnh đại diện: Dùng ảnh chân dung rõ mặt, chuyên nghiệp, phông nền sạch.',
                        'Tiêu đề ngắn: Cụ thể thay vì chung chung. "HLV sức mạnh | 8 năm | 200+ học viên" tốt hơn "HLV cá nhân".',
                        'Thư viện ảnh: Tải lên 6–10 ảnh đa dạng (ảnh tập, thay đổi vóc dáng của khách hàng, giải đấu).',
                        'Câu hỏi thường gặp: Trả lời trước 5–7 câu hỏi phổ biến nhất để giảm thời gian tư vấn lặp đi lặp lại.',
                        'Chương trình: Tối thiểu 2 gói — 1 gói online giá tốt và 1 gói đầy đủ dịch vụ.',
                        'Chứng chỉ: Cập nhật đầy đủ để hiển thị đẹp trên hồ sơ công khai.',
                    ]} />
                </LegalSection>

                <LegalSection title="Nguyên tắc làm việc với học viên">
                    <LegalList items={[
                        'Bạn toàn quyền thống nhất trực tiếp với học viên về mức phí, lịch tập, cách thanh toán và điều kiện dời/hủy.',
                        'GYMERVIET không thu phí sàn và không giữ tiền hộ, nên bạn cần tự đặt kỳ vọng rõ ràng ngay từ đầu.',
                        'Mọi cam kết quan trọng nên được ghi nhận rõ trong hội thoại để giảm tranh chấp và tăng độ tin cậy cho profile.',
                        'Nếu phát hiện hành vi lừa đảo hoặc quấy rối, hãy dùng công cụ báo cáo để đội ngũ xử lý theo hướng moderation/safety.',
                    ]} />
                </LegalSection>

                <div className="flex gap-4 mt-4">
                    <Link to="/register" className="btn-primary">Đăng ký ngay</Link>
                    <Link to="/contact" className="btn-secondary">Liên hệ tư vấn</Link>
                </div>
            </div>
        </LegalPageLayout>
    );
}
