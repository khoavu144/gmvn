import LegalPageLayout, { LegalSection, LegalList, LegalCallout } from '../../components/LegalPageLayout';

export default function PaymentPolicyPage() {
    return (
        <LegalPageLayout
            title="Nguyên tắc Thanh toán & Thỏa thuận trực tiếp"
            lastUpdated="01/01/2026"
            breadcrumbs={[{ label: 'Dành cho huấn luyện viên' }, { label: 'Chính sách thanh toán' }]}
        >
            <LegalSection title="1. Phạm vi của GYMERVIET">
                <p>
                    GYMERVIET là nền tảng hồ sơ, khám phá và kết nối. Ứng dụng <strong className="font-semibold text-black">không xử lý thanh toán, không giữ tiền trung gian
                    và không xác minh giao dịch nhạy cảm thay cho các bên</strong>.
                </p>
                <LegalList items={[
                    'Học viên và huấn luyện viên tự trao đổi về giá, lịch, phạm vi dịch vụ và cách thanh toán phù hợp.',
                    'Bạn nên thống nhất mọi điều kiện quan trọng ngay trong hội thoại trước khi chuyển khoản hoặc bắt đầu dịch vụ.',
                    'Nếu cần, ứng dụng có thể được dùng để lưu lại bối cảnh trao đổi, nhưng không thay thế hợp đồng hay cam kết tài chính giữa hai bên.',
                    'Không có phí nền tảng bắt buộc và không có phí sàn đối với huấn luyện viên.',
                ]} />
            </LegalSection>

            <LegalSection title="2. Trách nhiệm của mỗi bên">
                <LegalCallout type="info">
                    GYMERVIET không tự động hoàn tiền, không giữ hộ tiền và không đảm bảo kết quả của một thỏa thuận tài chính trực tiếp.
                </LegalCallout>
                <p className="mt-4">
                    Trách nhiệm của huấn luyện viên là mô tả rõ gói tập, điều kiện tham gia, lịch trình và nguyên tắc dời/hủy.
                    Trách nhiệm của học viên là xác nhận lại mọi điều khoản quan trọng trước khi đồng ý tham gia.
                </p>
            </LegalSection>

            <LegalSection title="3. Nguyên tắc khi có thay đổi hoặc tranh chấp">
                <p className="font-semibold text-black mb-3">GYMERVIET có thể hỗ trợ ở các trường hợp sau:</p>
                <LegalList items={[
                    'Hồ sơ sử dụng thông tin sai sự thật, giả mạo chứng chỉ hoặc lừa đảo.',
                    'Một bên có hành vi quấy rối, đe dọa hoặc vi phạm Tiêu chuẩn cộng đồng.',
                    'Có tranh chấp về nội dung trao đổi đã diễn ra trên ứng dụng và bạn cần đội ngũ xem xét thêm về an toàn và kiểm duyệt.',
                ]} />

                <p className="font-semibold text-black mt-5 mb-3">GYMERVIET không tự đứng ra quyết định:</p>
                <LegalList items={[
                    'Hoàn tiền bao nhiêu, khi nào hoàn và hoàn bằng cách nào cho các khoản chuyển trực tiếp.',
                    'Một bên có phải tiếp tục dịch vụ hay không nếu điều này không được thống nhất rõ từ trước.',
                    'Bất kỳ cam kết tài chính nào diễn ra ngoài phạm vi lưu vết và moderation của nền tảng.',
                ]} />
            </LegalSection>

            <LegalSection title="4. Cách làm việc an toàn được khuyến nghị">
                <div className="space-y-3">
                    {[
                        'Xác nhận rõ phạm vi gói tập, lịch bắt đầu, lịch dời/hủy và cách thanh toán ngay trong hội thoại.',
                        'Chỉ chuyển khoản sau khi bạn hiểu rõ huấn luyện viên là ai, gói tập gồm những gì và trách nhiệm mỗi bên.',
                        'Giữ lại bằng chứng trao đổi và giao dịch của riêng bạn khi làm việc trực tiếp.',
                        'Nếu phát hiện hồ sơ giả mạo hoặc hành vi bất thường, dùng trang Báo cáo để đội ngũ xử lý về an toàn và tin cậy.',
                    ].map((step, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm text-gray-600">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</span>
                            <span>{step}</span>
                        </div>
                    ))}
                </div>
            </LegalSection>

            <LegalSection title="5. Liên hệ hỗ trợ">
                <p>
                    Nếu bạn cần đội ngũ xem xét một vấn đề về safety, giả mạo hồ sơ, nội dung vi phạm hoặc hành vi gây mất an toàn,
                    hãy liên hệ qua email <a href="mailto:disputes@gymerviet.com" className="font-medium text-black underline underline-offset-2">disputes@gymerviet.com</a>.
                    Chúng tôi sẽ phản hồi trong 5 ngày làm việc cho các trường hợp thuộc phạm vi moderation của nền tảng.
                </p>
            </LegalSection>
        </LegalPageLayout>
    );
}
