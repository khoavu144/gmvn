import LegalPageLayout, { LegalSection } from '../../components/LegalPageLayout';
import { Link } from 'react-router-dom';

const stats = [
    { value: '2024', label: 'Năm thành lập' },
    { value: '500+', label: 'Huấn luyện viên' },
    { value: '5.000+', label: 'Học viên' },
    { value: '50+', label: 'Tỉnh thành' },
];

const values = [
    {
        title: 'Minh bạch',
        desc: 'Mọi giao dịch, đánh giá và thông tin HLV đều hiển thị rõ ràng. Không có phí ẩn.',
    },
    {
        title: 'Chất lượng',
        desc: 'Chỉ HLV đã được xác minh hồ sơ và chứng chỉ mới được đánh dấu "Verified".',
    },
    {
        title: 'Kết nối thực',
        desc: 'Nhắn tin trực tiếp, không qua trung gian. HLV và học viên tự quyết định hành trình.',
    },
    {
        title: 'Dữ liệu của bạn',
        desc: 'Chúng tôi không bán dữ liệu cá nhân. Bạn có quyền xuất và xóa dữ liệu bất cứ lúc nào.',
    },
];

export default function AboutPage() {
    return (
        <LegalPageLayout
            title="Về GYMERVIET"
            subtitle="Nền tảng kết nối Gymer và Trainer hàng đầu Việt Nam — được xây dựng bởi người tập, cho người tập."
            breadcrumbs={[{ label: 'Về chúng tôi' }]}
            maxWidth="xl"
        >
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
                {stats.map((stat) => (
                    <div key={stat.label} className="card text-center !p-5">
                        <div className="text-2xl font-bold text-black">{stat.value}</div>
                        <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{stat.label}</div>
                    </div>
                ))}
            </div>

            <LegalSection title="Câu chuyện">
                <p>
                    GYMERVIET ra đời từ một vấn đề đơn giản: người tập gym không biết tìm HLV uy tín ở đâu,
                    còn HLV thì không có công cụ chuyên nghiệp để quản lý học viên và xây dựng thương hiệu cá nhân.
                </p>
                <p>
                    Thay vì một marketplace đông đúc thiếu tin cậy, chúng tôi xây dựng một nền tảng nơi
                    mỗi HLV có trang profile riêng như một portfolio chuyên nghiệp, và mỗi học viên
                    có đầy đủ công cụ để theo dõi hành trình của mình.
                </p>
            </LegalSection>

            <LegalSection title="Giá trị cốt lõi">
                <div className="grid sm:grid-cols-2 gap-4 mt-2">
                    {values.map((v) => (
                        <div key={v.title} className="card !hover:border-black">
                            <h3 className="font-bold text-black text-sm mb-2">{v.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
                        </div>
                    ))}
                </div>
            </LegalSection>

            <LegalSection title="Cách hoạt động">
                <div className="space-y-4">
                    {[
                        { step: '01', title: 'Đăng ký miễn phí', desc: 'Tạo tài khoản với vai trò Học viên, Vận động viên, hoặc Huấn luyện viên.' },
                        { step: '02', title: 'Khám phá & Kết nối', desc: 'Duyệt danh sách HLV theo chuyên môn, khu vực, mức giá. Nhắn tin trực tiếp để tư vấn.' },
                        { step: '03', title: 'Đăng ký gói tập', desc: 'Chọn gói phù hợp, thanh toán qua chuyển khoản (QR Code tự động). Nhận xác nhận tức thì.' },
                        { step: '04', title: 'Tập luyện & Theo dõi', desc: 'Nhận lịch tập cá nhân hóa, hoàn thành buổi tập, ghi nhật ký tiến trình.' },
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

            <LegalSection title="Liên hệ">
                <p>
                    Có câu hỏi hoặc đề xuất?{' '}
                    <Link to="/contact" className="font-medium text-black underline underline-offset-2">
                        Gửi tin nhắn cho chúng tôi
                    </Link>{' '}
                    hoặc xem{' '}
                    <Link to="/faq" className="font-medium text-black underline underline-offset-2">
                        câu hỏi thường gặp
                    </Link>.
                </p>
            </LegalSection>
        </LegalPageLayout>
    );
}
