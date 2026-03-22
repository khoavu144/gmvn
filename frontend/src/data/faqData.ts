export interface FAQItem {
    q: string;
    a: string;
}

export interface FAQCategory {
    title: string;
    icon: string;
    items: FAQItem[];
}

export const faqData: FAQCategory[] = [
    {
        title: 'Tài khoản & Đăng ký',
        icon: '👤',
        items: [
            {
                q: 'Tôi có thể đổi loại tài khoản từ Gymer sang Coach không?',
                a: 'Hiện tại chưa hỗ trợ đổi loại tài khoản trực tiếp. Bạn cần liên hệ đội hỗ trợ qua trang Liên hệ để được chuyển đổi thủ công.',
            },
            {
                q: 'Làm thế nào để xóa tài khoản?',
                a: 'Gửi yêu cầu xóa tài khoản đến privacy@gymerviet.com từ email đã đăng ký. Chúng tôi sẽ xử lý trong vòng 7 ngày làm việc và xóa toàn bộ dữ liệu liên quan.',
            },
            {
                q: 'Tôi quên mật khẩu thì làm thế nào?',
                a: 'Mục "Quên mật khẩu" đang hoàn thiện. Tạm thời hãy liên hệ hỗ trợ để được cấp lại mật khẩu.',
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
                a: 'Chúng tôi hỗ trợ hoàn tiền trong vòng 7 ngày kể từ ngày kích hoạt nếu gói tập chưa bắt đầu hoặc Coach không cung cấp dịch vụ đúng cam kết. Xem chi tiết tại trang Chính sách thanh toán.',
            },
            {
                q: 'Phí nền tảng là bao nhiêu?',
                a: 'GYMERVIET thu 5% từ mỗi giao dịch thành công. Ví dụ: gói 1.000.000đ — học viên trả 1.000.000đ, Coach nhận 950.000đ.',
            },
            {
                q: 'Tôi có thể hủy gói tập đang active không?',
                a: 'Bạn có thể hủy bất cứ lúc nào trong mục "Gói tập của tôi". Phần phí còn lại (theo tỉ lệ ngày còn lại) sẽ được hoàn trả theo chính sách hoàn tiền.',
            },
        ],
    },
    {
        title: 'Dành cho Coach',
        icon: '🏋️',
        items: [
            {
                q: 'Badge "Verified" là gì và làm thế nào để được xác minh?',
                a: 'Badge Verified có nghĩa đội GYMERVIET đã xem chứng chỉ và kinh nghiệm của bạn. Gửi hồ sơ qua trang Liên hệ để được xét duyệt.',
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

/** Curated subset for Home — same copy as full FAQ (single source via faqData). */
export const HOME_FAQ_PREVIEW_ITEMS: FAQItem[] = [
    faqData[1].items[2],
    faqData[1].items[1],
    faqData[2].items[0],
    faqData[0].items[2],
    faqData[0].items[0],
    faqData[3].items[2],
];
