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
                q: 'Tôi có thể đổi loại tài khoản từ người tập sang huấn luyện viên không?',
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
        title: 'Đăng ký & làm việc với huấn luyện viên',
        icon: '💳',
        items: [
            {
                q: 'Tôi đã nhắn tin về chương trình nhưng huấn luyện viên chưa phản hồi?',
                a: 'Hãy chờ thêm trong khung thời gian hợp lý và nhắn lại trong hội thoại nếu cần. Nếu huấn luyện viên đã hiển thị trạng thái nhận học viên nhưng bỏ mặc nhiều lượt liên hệ, bạn có thể báo cáo để đội ngũ kiểm tra chất lượng hồ sơ.',
            },
            {
                q: 'Có được hoàn tiền không?',
                a: 'GYMERVIET không đứng giữa để giữ tiền, xác minh hay hoàn tiền cho các giao dịch trực tiếp giữa hai bên. Trước khi chuyển khoản, bạn nên thống nhất rõ phạm vi, lịch tập, điều kiện hủy và cách xử lý phát sinh ngay trong hội thoại.',
            },
            {
                q: 'Phí nền tảng là bao nhiêu?',
                a: 'Hiện tại GYMERVIET không thu phí nền tảng và không thu phí sàn đối với huấn luyện viên. Nền tảng tập trung vào hồ sơ, khám phá và kết nối; phần thỏa thuận tài chính là trách nhiệm trực tiếp giữa các bên.',
            },
            {
                q: 'Tôi có thể kết thúc chương trình đang theo dõi không?',
                a: 'Bạn có thể dừng theo dõi hoặc kết thúc trạng thái chương trình trong ứng dụng khi không còn tiếp tục làm việc cùng huấn luyện viên. Việc hoàn tiền, chuyển buổi hay bù lịch là thỏa thuận trực tiếp giữa bạn và huấn luyện viên, không do GYMERVIET quyết định thay.',
            },
        ],
    },
    {
        title: 'Dành cho huấn luyện viên',
        icon: '🏋️',
        items: [
            {
                q: 'Dấu "Xác minh" là gì và làm thế nào để được xác minh?',
                a: 'Dấu "Xác minh" cho biết đội GYMERVIET đã xem chứng chỉ và kinh nghiệm của bạn. Gửi hồ sơ qua trang Liên hệ để được xét duyệt.',
            },
            {
                q: 'Tôi có thể tạo bao nhiêu chương trình?',
                a: 'Hiện tại không giới hạn số chương trình. Tuy nhiên, chúng tôi khuyến nghị tập trung 2–4 chương trình chất lượng cao thay vì nhiều chương trình chồng chéo.',
            },
            {
                q: 'Khi nào tiền từ giao dịch được chuyển về tài khoản của tôi?',
                a: 'GYMERVIET không giữ tiền và không thu phí sàn. Nếu bạn chọn nhận thanh toán trực tiếp từ học viên, hãy tự thống nhất rõ điều kiện tham gia, chính sách dời/hủy và cách xác nhận đã nhận tiền trước khi bắt đầu dịch vụ.',
            },
        ],
    },
    {
        title: 'Kỹ thuật',
        icon: '⚙️',
        items: [
            {
                q: 'Chat thời gian thực không hoạt động?',
                a: 'Tính năng chat dùng WebSocket. Kiểm tra: (1) Kết nối internet ổn định; (2) Thử tải lại trang; (3) Tắt VPN nếu đang dùng. Nếu vẫn lỗi, liên hệ hỗ trợ.',
            },
            {
                q: 'Tôi tải ảnh lên nhưng không thấy thay đổi?',
                a: 'Ảnh được lưu trên Supabase Storage. Nếu sau 30 giây ảnh chưa hiển thị, thử tải lại trang. Đảm bảo file không vượt quá 5MB và đúng định dạng (JPG, PNG, WEBP).',
            },
            {
                q: 'Ứng dụng có phiên bản mobile không?',
                a: 'Hiện tại GYMERVIET là ứng dụng web tối ưu cho trình duyệt di động. Phiên bản iOS/Android đang trong kế hoạch phát triển.',
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
                q: 'Có thể kết hợp sản phẩm marketplace với chương trình từ huấn luyện viên không?',
                a: 'Hoàn toàn có! Nhiều huấn luyện viên sẽ đề xuất các sản phẩm từ marketplace để hỗ trợ chương trình của họ. Bạn có thể xem sản phẩm độc lập hoặc theo gợi ý của huấn luyện viên.',
            },
            {
                q: 'Việc mua bán sản phẩm diễn ra như thế nào?',
                a: 'GYMERVIET là nơi hiển thị và khám phá sản phẩm. Khi muốn mua, bạn liên hệ trực tiếp với người bán qua thông tin trên trang sản phẩm. Mọi giao dịch là thỏa thuận trực tiếp giữa hai bên, GYMERVIET không đứng giữa xử lý thanh toán hay đảm bảo hoàn tiền.',
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
