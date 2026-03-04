import LegalPageLayout, { LegalSection, LegalList, LegalCallout } from '../../components/LegalPageLayout';

export default function PaymentPolicyPage() {
    return (
        <LegalPageLayout
            title="Chính sách Thanh toán & Hoàn tiền"
            lastUpdated="01/01/2026"
            breadcrumbs={[{ label: 'Dành cho HLV' }, { label: 'Chính sách thanh toán' }]}
        >
            <LegalSection title="1. Phương thức thanh toán">
                <p>
                    GYMERVIET sử dụng hệ thống thanh toán qua <strong className="font-semibold text-black">chuyển khoản ngân hàng tự động</strong>
                    {' '}tích hợp với SePay. Hệ thống hỗ trợ tất cả ngân hàng Việt Nam qua VietQR.
                </p>
                <LegalList items={[
                    'Học viên quét QR Code hoặc chuyển khoản thủ công với nội dung cố định.',
                    'SePay xác nhận giao dịch trong 1–5 phút sau khi nhận tiền.',
                    'Hệ thống tự động kích hoạt gói tập sau khi xác nhận.',
                    'Không hỗ trợ thanh toán bằng thẻ tín dụng trong phiên bản hiện tại.',
                ]} />
            </LegalSection>

            <LegalSection title="2. Phí nền tảng">
                <LegalCallout type="info">
                    GYMERVIET thu <strong>20% phí nền tảng</strong> từ mỗi giao dịch thành công.
                    HLV nhận <strong>80%</strong> giá trị gói tập.
                </LegalCallout>
                <p className="mt-4">
                    Phí nền tảng bao gồm: xử lý thanh toán, lưu trữ dữ liệu, hỗ trợ kỹ thuật,
                    và chi phí vận hành nền tảng. Không có phí ẩn nào khác.
                </p>
            </LegalSection>

            <LegalSection title="3. Chính sách hoàn tiền">
                <p className="font-semibold text-black mb-3">Trường hợp được hoàn tiền 100%:</p>
                <LegalList items={[
                    'Hủy trong vòng 24 giờ sau khi kích hoạt và chưa có buổi tập nào.',
                    'HLV không phản hồi trong vòng 3 ngày sau khi gói tập được kích hoạt.',
                    'Gói tập bị gián đoạn do lỗi kỹ thuật từ phía GYMERVIET.',
                    'HLV bị khóa tài khoản do vi phạm Tiêu chuẩn Cộng đồng.',
                ]} />

                <p className="font-semibold text-black mt-5 mb-3">Trường hợp được hoàn tiền theo tỉ lệ:</p>
                <LegalList items={[
                    'Hủy sau ngày đầu tiên: Hoàn (số tuần chưa bắt đầu / tổng số tuần) × 80% giá trị gói.',
                    'HLV không hoàn thành cam kết: Xem xét từng trường hợp, tối đa 80% giá trị còn lại.',
                ]} />

                <p className="font-semibold text-black mt-5 mb-3">Trường hợp KHÔNG được hoàn tiền:</p>
                <LegalList items={[
                    'Đã sử dụng hết gói tập.',
                    'Hủy sau 30 ngày kể từ ngày kích hoạt.',
                    'Vi phạm Tiêu chuẩn Cộng đồng dẫn đến khóa tài khoản.',
                    'Thanh toán nhầm nội dung chuyển khoản (không đúng mã giao dịch).',
                ]} />
            </LegalSection>

            <LegalSection title="4. Quy trình yêu cầu hoàn tiền">
                <div className="space-y-3">
                    {[
                        'Gửi yêu cầu qua trang Liên hệ, chọn chủ đề "Vấn đề thanh toán / hoàn tiền".',
                        'Cung cấp: ID giao dịch, email tài khoản, lý do hoàn tiền, và ảnh chụp màn hình liên quan.',
                        'Đội ngũ xem xét trong 3–5 ngày làm việc.',
                        'Tiền được hoàn về tài khoản ngân hàng gốc trong 5–10 ngày làm việc sau khi duyệt.',
                    ].map((step, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm text-gray-700">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</span>
                            <span>{step}</span>
                        </div>
                    ))}
                </div>
            </LegalSection>

            <LegalSection title="5. Tranh chấp thanh toán">
                <p>
                    Nếu không đồng ý với quyết định hoàn tiền, bạn có thể gửi khiếu nại lên cấp cao hơn
                    qua email <a href="mailto:disputes@gymerviet.com" className="font-medium text-black underline underline-offset-2">disputes@gymerviet.com</a>.
                    Chúng tôi cam kết phản hồi trong 5 ngày làm việc.
                </p>
            </LegalSection>
        </LegalPageLayout>
    );
}
