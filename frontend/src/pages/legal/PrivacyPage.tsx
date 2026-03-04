import LegalPageLayout, { LegalSection, LegalList, LegalCallout } from '../../components/LegalPageLayout';

export default function PrivacyPage() {
    return (
        <LegalPageLayout
            title="Chính sách Bảo mật & Quyền riêng tư"
            subtitle="Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn theo chuẩn mực cao nhất."
            lastUpdated="01/01/2026"
            breadcrumbs={[{ label: 'Bảo mật & Quyền riêng tư' }]}
        >
            <LegalCallout type="info">
                GYMERVIET tuân thủ Luật An toàn thông tin mạng Việt Nam (Luật số 86/2015/QH13)
                và các quy định về bảo vệ dữ liệu cá nhân tại Nghị định 13/2023/NĐ-CP.
            </LegalCallout>

            <div className="mt-8">
                <LegalSection title="1. Thông tin chúng tôi thu thập">
                    <p><strong className="font-semibold text-black">Thông tin bạn cung cấp trực tiếp:</strong></p>
                    <LegalList items={[
                        'Họ tên, địa chỉ email khi đăng ký tài khoản.',
                        'Ảnh đại diện, ảnh bìa khi cập nhật profile.',
                        'Thông tin sức khỏe (chiều cao, cân nặng) nếu bạn chọn điền — hoàn toàn tùy chọn.',
                        'Nội dung tin nhắn trong hệ thống chat.',
                        'Thông tin thanh toán (số tài khoản ngân hàng không được lưu trữ — xử lý qua SePay).',
                    ]} />
                    <p className="mt-4"><strong className="font-semibold text-black">Thông tin thu thập tự động:</strong></p>
                    <LegalList items={[
                        'Địa chỉ IP, loại thiết bị, trình duyệt để bảo mật tài khoản.',
                        'Lịch sử đăng nhập để phát hiện truy cập bất thường.',
                        'Thời gian sử dụng các tính năng (không thu thập nội dung cá nhân).',
                    ]} />
                </LegalSection>

                <LegalSection title="2. Cách chúng tôi sử dụng thông tin">
                    <LegalList items={[
                        'Cung cấp và duy trì dịch vụ GYMERVIET.',
                        'Hiển thị profile công khai nếu bạn kích hoạt tùy chọn này.',
                        'Xử lý giao dịch và xác nhận thanh toán.',
                        'Gửi thông báo liên quan đến tài khoản (không gửi spam marketing).',
                        'Cải thiện chất lượng dịch vụ thông qua dữ liệu tổng hợp ẩn danh.',
                    ]} />
                </LegalSection>

                <LegalSection title="3. Chia sẻ thông tin với bên thứ ba">
                    <LegalCallout type="warning">
                        Chúng tôi <strong>KHÔNG bán</strong> thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào.
                    </LegalCallout>
                    <p className="mt-4">Thông tin chỉ được chia sẻ trong các trường hợp:</p>
                    <LegalList items={[
                        'Với Coach hoặc học viên khi bạn chủ động thiết lập mối quan hệ tập luyện.',
                        'Với SePay (đối tác xử lý thanh toán) — chỉ thông tin cần thiết để xác nhận giao dịch.',
                        'Với Supabase (lưu trữ file ảnh) — chỉ các file bạn chủ động upload.',
                        'Theo yêu cầu của pháp luật Việt Nam khi có lệnh từ cơ quan có thẩm quyền.',
                    ]} />
                </LegalSection>

                <LegalSection title="4. Bảo mật dữ liệu">
                    <LegalList items={[
                        'Mật khẩu được mã hóa một chiều bằng bcrypt — ngay cả đội ngũ chúng tôi cũng không biết mật khẩu của bạn.',
                        'Giao tiếp giữa trình duyệt và server được mã hóa bằng HTTPS/TLS.',
                        'Token xác thực có thời hạn ngắn (15 phút) và tự gia hạn an toàn.',
                        'Database được backup hàng ngày và lưu trữ tại máy chủ tại Việt Nam / Singapore.',
                    ]} />
                </LegalSection>

                <LegalSection title="5. Quyền của bạn">
                    <LegalList items={[
                        'Quyền truy cập: Xem toàn bộ dữ liệu chúng tôi lưu trữ về bạn.',
                        'Quyền chỉnh sửa: Cập nhật thông tin cá nhân bất cứ lúc nào trong Profile.',
                        'Quyền xóa: Yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan.',
                        'Quyền hạn chế: Tắt chế độ "profile public" để ẩn khỏi kết quả tìm kiếm.',
                        'Quyền xuất dữ liệu: Yêu cầu xuất dữ liệu cá nhân dưới dạng JSON/CSV.',
                    ]} />
                    <p className="mt-4">
                        Để thực hiện các quyền trên, gửi yêu cầu đến email:{' '}
                        <a href="mailto:privacy@gymerviet.com" className="font-medium text-black underline underline-offset-2">
                            privacy@gymerviet.com
                        </a>
                    </p>
                </LegalSection>

                <LegalSection title="6. Cookie">
                    <p>
                        GYMERVIET chỉ sử dụng <strong>localStorage</strong> để lưu token xác thực.
                        Chúng tôi không sử dụng cookie theo dõi (tracking cookies) hay cookie quảng cáo.
                    </p>
                </LegalSection>

                <LegalSection title="7. Liên hệ về bảo mật">
                    <p>
                        Phát hiện lỗ hổng bảo mật? Vui lòng báo cáo trách nhiệm đến{' '}
                        <a href="mailto:security@gymerviet.com" className="font-medium text-black underline underline-offset-2">
                            security@gymerviet.com
                        </a>
                        . Chúng tôi cam kết phản hồi trong vòng 48 giờ.
                    </p>
                </LegalSection>
            </div>
        </LegalPageLayout>
    );
}
