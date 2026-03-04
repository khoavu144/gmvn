import LegalPageLayout, { LegalSection, LegalList, LegalCallout } from '../../components/LegalPageLayout';
import { Link } from 'react-router-dom';

export default function CommunityStandardsPage() {
    return (
        <LegalPageLayout
            title="Tiêu chuẩn cộng đồng"
            subtitle="Những nguyên tắc chung giúp GYMERVIET là môi trường an toàn, chuyên nghiệp và tích cực cho tất cả mọi người."
            lastUpdated="01/01/2026"
            breadcrumbs={[{ label: 'Tiêu chuẩn cộng đồng' }]}
        >
            <LegalCallout type="info">
                Bằng cách sử dụng GYMERVIET, bạn đồng ý tuân thủ các tiêu chuẩn này.
                Vi phạm có thể dẫn đến cảnh báo, tạm khóa hoặc xóa tài khoản vĩnh viễn.
            </LegalCallout>

            <div className="mt-8 space-y-0">

                <LegalSection title="1. Tôn trọng lẫn nhau">
                    <p>Chúng tôi kỳ vọng mọi thành viên — HLV và học viên — đều giao tiếp với thái độ lịch sự và chuyên nghiệp.</p>
                    <LegalList items={[
                        'Không sử dụng ngôn ngữ thô tục, xúc phạm, kỳ thị trong tin nhắn hoặc mô tả profile.',
                        'Không quấy rối, đe dọa, hoặc gây áp lực cho người dùng khác.',
                        'Không phân biệt đối xử dựa trên giới tính, dân tộc, tôn giáo, vóc dáng cơ thể.',
                        'Phản hồi tin nhắn trong thời gian hợp lý — đặc biệt với HLV đã nhận học viên.',
                    ]} />
                </LegalSection>

                <LegalSection title="2. Thông tin trung thực">
                    <p>Sự tin tưởng là nền tảng của nền tảng này. Chúng tôi yêu cầu thông tin chính xác từ tất cả người dùng.</p>
                    <LegalList items={[
                        'HLV phải cung cấp thông tin chứng chỉ, kinh nghiệm và thành tích thực tế, có thể xác minh.',
                        'Không đặt giá gói tập sai lệch hoặc mô tả dịch vụ không đúng sự thật.',
                        'Học viên không được giả mạo thông tin cá nhân hoặc tạo tài khoản trùng lặp để lách quy định.',
                        'Ảnh đại diện và ảnh bìa phải là ảnh thực tế của bản thân/hoạt động — không dùng ảnh người khác.',
                    ]} />
                </LegalSection>

                <LegalSection title="3. Nội dung phù hợp">
                    <p>GYMERVIET là nền tảng fitness chuyên nghiệp. Nội dung đăng tải phải phù hợp với mục đích này.</p>
                    <LegalList items={[
                        'Không đăng nội dung khiêu dâm, bạo lực, hoặc gây sốc trong gallery hoặc mô tả.',
                        'Không quảng cáo các sản phẩm, dịch vụ không liên quan đến fitness và sức khỏe.',
                        'Không spam tin nhắn hàng loạt hoặc liên hệ người dùng khác ngoài mục đích tập luyện.',
                        'Không đăng liên kết độc hại, phần mềm độc hại, hoặc lừa đảo qua tin nhắn.',
                    ]} />
                </LegalSection>

                <LegalSection title="4. Giao dịch tài chính">
                    <p>Mọi giao dịch thanh toán phải diễn ra qua hệ thống của GYMERVIET để đảm bảo quyền lợi cả hai bên.</p>
                    <LegalList items={[
                        'Không yêu cầu học viên thanh toán ngoài hệ thống (tiền mặt, chuyển khoản riêng không qua app).',
                        'HLV không được hủy gói tập đơn phương sau khi học viên đã thanh toán.',
                        'Không hoàn tiền ngoài chính sách — xem chi tiết tại trang Chính sách thanh toán.',
                        'Báo cáo ngay nếu phát hiện giao dịch bất thường hoặc nghi ngờ gian lận.',
                    ]} />
                </LegalSection>

                <LegalSection title="5. Bảo mật tài khoản">
                    <LegalList items={[
                        'Không chia sẻ mật khẩu tài khoản với bất kỳ ai, kể cả đội ngũ GYMERVIET (chúng tôi không bao giờ hỏi mật khẩu).',
                        'Không cho người khác sử dụng tài khoản của bạn.',
                        'Thông báo ngay nếu phát hiện tài khoản bị xâm phạm qua trang Liên hệ.',
                    ]} />
                </LegalSection>

                <LegalSection title="6. Xử lý vi phạm">
                    <p>Chúng tôi áp dụng hệ thống 3 bậc tùy theo mức độ vi phạm:</p>
                    <div className="space-y-3 mt-3">
                        {[
                            { level: 'Cảnh báo', color: 'border-gray-300', desc: 'Vi phạm lần đầu, mức độ nhẹ. Tài khoản không bị ảnh hưởng nhưng ghi nhận lịch sử.' },
                            { level: 'Tạm khóa 7–30 ngày', color: 'border-gray-400', desc: 'Vi phạm nghiêm trọng hoặc tái phạm. Không thể đăng ký mới / nhận học viên trong thời gian bị khóa.' },
                            { level: 'Xóa tài khoản vĩnh viễn', color: 'border-black', desc: 'Vi phạm rất nghiêm trọng (gian lận, lừa đảo, quấy rối) hoặc vi phạm sau khi đã bị tạm khóa.' },
                        ].map((item) => (
                            <div key={item.level} className={`border-l-4 ${item.color} pl-4 py-2`}>
                                <span className="font-semibold text-sm text-black">{item.level}:</span>
                                <span className="text-sm text-gray-600 ml-2">{item.desc}</span>
                            </div>
                        ))}
                    </div>
                    <p className="mt-4">
                        Để báo cáo hành vi vi phạm, sử dụng{' '}
                        <Link to="/report" className="font-medium text-black underline underline-offset-2">
                            trang Báo cáo vi phạm
                        </Link>.
                    </p>
                </LegalSection>

            </div>
        </LegalPageLayout>
    );
}
