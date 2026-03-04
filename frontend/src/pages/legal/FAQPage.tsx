import { useState } from 'react';
import LegalPageLayout from '../../components/LegalPageLayout';
import { Link } from 'react-router-dom';

interface FAQItem {
    q: string;
    a: string;
}

interface FAQCategory {
    title: string;
    icon: string;
    items: FAQItem[];
}

const faqData: FAQCategory[] = [
    {
        title: 'Tài khoản & Đăng ký',
        icon: '👤',
        items: [
            {
                q: 'Tôi có thể đổi loại tài khoản từ Gymer sang HLV không?',
                a: 'Hiện tại chưa hỗ trợ đổi loại tài khoản trực tiếp. Bạn cần liên hệ đội hỗ trợ qua trang Liên hệ để được chuyển đổi thủ công.',
            },
            {
                q: 'Làm thế nào để xóa tài khoản?',
                a: 'Gửi yêu cầu xóa tài khoản đến privacy@gymerviet.com từ email đã đăng ký. Chúng tôi sẽ xử lý trong vòng 7 ngày làm việc và xóa toàn bộ dữ liệu liên quan.',
            },
            {
                q: 'Tôi quên mật khẩu thì làm thế nào?',
                a: 'Chức năng "Quên mật khẩu" đang được phát triển. Trong thời gian này, vui lòng liên hệ đội hỗ trợ để đặt lại mật khẩu thủ công.',
            },
        ],
    },
    {
        title: 'Thanh toán & Gói tập',
        icon: '💳',
        items: [
            {
                q: 'Tôi đã chuyển khoản nhưng gói tập chưa được kích hoạt?',
                a: 'Hệ thống xử lý thanh toán trong 1–5 phút. Nếu sau 10 phút vẫn chưa kích hoạt, hãy bấm "Tôi đã chuyển khoản" để kiểm tra lại. Nếu vẫn không được, liên hệ hỗ trợ kèm ảnh chụp màn hình giao dịch.',
            },
            {
                q: 'Có được hoàn tiền không?',
                a: 'Chúng tôi hỗ trợ hoàn tiền trong vòng 7 ngày kể từ ngày kích hoạt nếu gói tập chưa bắt đầu hoặc HLV không cung cấp dịch vụ đúng cam kết. Xem chi tiết tại trang Chính sách thanh toán.',
            },
            {
                q: 'Phí nền tảng là bao nhiêu?',
                a: 'GYMERVIET thu 5% từ mỗi giao dịch thành công. Ví dụ: gói 1.000.000đ — học viên trả 1.000.000đ, HLV nhận 950.000đ.',
            },
            {
                q: 'Tôi có thể hủy gói tập đang active không?',
                a: 'Bạn có thể hủy bất cứ lúc nào trong mục "Gói tập của tôi". Phần phí còn lại (theo tỉ lệ ngày còn lại) sẽ được hoàn trả theo chính sách hoàn tiền.',
            },
        ],
    },
    {
        title: 'Dành cho HLV',
        icon: '🏋️',
        items: [
            {
                q: 'Badge "Verified" là gì và làm thế nào để được xác minh?',
                a: 'Badge Verified xác nhận HLV đã được đội ngũ GYMERVIET kiểm tra chứng chỉ và kinh nghiệm thực tế. Gửi hồ sơ xác minh qua trang Liên hệ để được xem xét.',
            },
            {
                q: 'Tôi có thể tạo bao nhiêu gói tập?',
                a: 'Hiện tại không giới hạn số gói tập. Tuy nhiên, chúng tôi khuyến nghị tập trung 2–4 gói chất lượng cao thay vì nhiều gói chồng chéo.',
            },
            {
                q: 'Khi nào tiền từ giao dịch được chuyển về tài khoản của tôi?',
                a: 'Do thanh toán qua chuyển khoản trực tiếp, tiền vào tài khoản ngân hàng của bạn ngay khi học viên chuyển. GYMERVIET thu phí nền tảng sau theo chu kỳ hàng tháng.',
            },
        ],
    },
    {
        title: 'Kỹ thuật',
        icon: '⚙️',
        items: [
            {
                q: 'Chat realtime không hoạt động?',
                a: 'Tính năng chat dùng WebSocket. Kiểm tra: (1) Kết nối internet ổn định; (2) Thử tải lại trang; (3) Tắt VPN nếu đang dùng. Nếu vẫn lỗi, liên hệ hỗ trợ.',
            },
            {
                q: 'Tôi upload ảnh nhưng không thấy thay đổi?',
                a: 'Ảnh được lưu trên Supabase Storage. Nếu sau 30 giây ảnh chưa hiển thị, thử tải lại trang. Đảm bảo file không vượt quá 5MB và đúng định dạng (JPG, PNG, WEBP).',
            },
            {
                q: 'Ứng dụng có phiên bản mobile không?',
                a: 'Hiện tại GYMERVIET là web app tối ưu cho mobile browser. Phiên bản app iOS/Android đang trong kế hoạch phát triển.',
            },
        ],
    },
];

function FAQAccordion({ items }: { items: FAQItem[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="border border-gray-200 rounded-xs divide-y divide-gray-200 bg-white">
            {items.map((item, i) => (
                <div key={i}>
                    <button
                        onClick={() => setOpenIndex(openIndex === i ? null : i)}
                        className="w-full flex justify-between items-start gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none"
                        aria-expanded={openIndex === i}
                    >
                        <span className="text-sm font-medium text-black leading-relaxed">{item.q}</span>
                        <span className="text-gray-400 font-mono text-xs mt-0.5 flex-shrink-0 w-4 text-right">
                            {openIndex === i ? '−' : '+'}
                        </span>
                    </button>
                    {openIndex === i && (
                        <div className="px-5 pb-5 pt-1 bg-gray-50 border-t border-gray-100">
                            <p className="text-sm text-gray-700 leading-relaxed">{item.a}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function FAQPage() {
    return (
        <LegalPageLayout
            title="Câu hỏi thường gặp"
            subtitle="Tìm câu trả lời nhanh cho các thắc mắc phổ biến nhất."
            breadcrumbs={[{ label: 'Hỏi đáp FAQ' }]}
            maxWidth="xl"
        >
            <div className="space-y-8">
                {faqData.map((cat) => (
                    <div key={cat.title}>
                        <h2 className="flex items-center gap-2 text-base font-bold text-black mb-4">
                            <span>{cat.icon}</span>
                            <span>{cat.title}</span>
                        </h2>
                        <FAQAccordion items={cat.items} />
                    </div>
                ))}
            </div>

            <div className="mt-10 p-6 border border-gray-200 rounded-xs bg-white text-center">
                <h3 className="font-bold text-black mb-2">Không tìm thấy câu trả lời?</h3>
                <p className="text-sm text-gray-600 mb-4">Đội ngũ hỗ trợ của chúng tôi sẵn sàng giúp bạn.</p>
                <Link to="/contact" className="btn-primary inline-flex">
                    Liên hệ hỗ trợ
                </Link>
            </div>
        </LegalPageLayout>
    );
}
