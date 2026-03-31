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
    {
        title: 'Sản phẩm & Marketplace',
        icon: '🛍️',
        items: [
            {
                q: 'Sản phẩm trong marketplace được kiểm định như thế nào?',
                a: 'Tất cả sản phẩm trên GYMERVIET Marketplace đều được xét duyệt bởi đội chuyên gia của chúng tôi. Chúng tôi kiểm tra tính xác thực, chất lượng nội dung và cam kết của người bán. Chỉ những sản phẩm đạt tiêu chuẩn mới được phép bán.',
            },
            {
                q: 'Làm sao để biết sản phẩm phù hợp với mục tiêu của tôi?',
                a: 'Mỗi sản phẩm đều có gắn tag mục tiêu tập luyện (giảm cân, tăng cơ, tăng sức mạnh, v.v.) và mô tả chi tiết. Bạn có thể dùng bộ lọc "Mục tiêu" để tìm sản phẩm phù hợp. Ngoài ra, đọc đánh giá của những người dùng khác để hiểu rõ hơn.',
            },
            {
                q: 'Có thể kết hợp sản phẩm marketplace với gói tập từ Coach không?',
                a: 'Hoàn toàn có! Nhiều Coach sẽ đề xuất các sản phẩm từ marketplace để hỗ trợ gói tập của họ. Bạn có thể mua sản phẩm độc lập hoặc theo gợi ý của Coach. Cả hai thực hiện song song, không ảnh hưởng lẫn nhau.',
            },
            {
                q: 'Chính sách hoàn tiền / hủy đơn hàng cho sản phẩm như thế nào?',
                a: 'Bạn có thể hủy đơn hàng trong vòng 1 giờ sau khi thanh toán, sẽ được hoàn tiền 100%. Sau 1 giờ, có thể liên hệ người bán để yêu cầu hủy (tùy chính sách của từng người bán). Nếu sản phẩm không đúng cam kết, yêu cầu hoàn tiền trong vòng 14 ngày.',
            },
            {
                q: 'Có giới hạn về số lượng sản phẩm tôi có thể mua không?',
                a: 'Không có giới hạn. Bạn có thể mua bao nhiêu sản phẩm tùy thích. Mỗi lần mua được xem là giao dịch riêng. Nếu mua số lượng lớn (từ 5 sản phẩm trở lên), liên hệ hỗ trợ để được tư vấn chiết khấu tập thể.',
            },
        ],
    },
];

/** Curated subset for Home — same copy as full FAQ (single source via faqData). */
export const HOME_FAQ_PREVIEW_ITEMS: FAQItem[] = [
    faqData[1].items[2],
    faqData[4].items[0],
    faqData[2].items[0],
    faqData[1].items[1],
    faqData[4].items[2],
    faqData[0].items[2],
];
