import LegalPageLayout, { LegalSection, LegalList, LegalCallout } from '../../components/LegalPageLayout';

export default function TermsPage() {
    return (
        <LegalPageLayout
            title="Điều khoản dịch vụ"
            lastUpdated="01/01/2026"
            breadcrumbs={[{ label: 'Điều khoản dịch vụ' }]}
        >
            <LegalCallout type="warning">
                Vui lòng đọc kỹ trước khi sử dụng. Việc đăng ký và sử dụng GYMERVIET
                đồng nghĩa với việc bạn đồng ý với toàn bộ các điều khoản dưới đây.
            </LegalCallout>

            <div className="mt-8">
                <LegalSection title="1. Chấp nhận điều khoản">
                    <p>
                        Các Điều khoản Dịch vụ này ("Điều khoản") điều chỉnh việc bạn truy cập và sử dụng
                        nền tảng GYMERVIET, bao gồm website, ứng dụng di động và các dịch vụ liên quan.
                        Nếu bạn không đồng ý, vui lòng không sử dụng dịch vụ.
                    </p>
                </LegalSection>

                <LegalSection title="2. Điều kiện sử dụng tài khoản">
                    <LegalList items={[
                        'Bạn phải từ 16 tuổi trở lên để tạo tài khoản.',
                        'Mỗi người chỉ được tạo một tài khoản. Tài khoản trùng lặp sẽ bị xóa.',
                        'Bạn chịu trách nhiệm về mọi hoạt động diễn ra dưới tài khoản của mình.',
                        'Không được chuyển nhượng hoặc bán tài khoản cho người khác.',
                    ]} />
                </LegalSection>

                <LegalSection title="3. Dịch vụ và thanh toán">
                    <LegalList items={[
                        'GYMERVIET là nền tảng kết nối — chúng tôi không trực tiếp cung cấp dịch vụ huấn luyện.',
                        'Chất lượng dịch vụ huấn luyện là trách nhiệm của HLV đăng ký trên nền tảng.',
                        'GYMERVIET thu phí nền tảng 20% từ mỗi giao dịch thành công.',
                        'Giá hiển thị trên gói tập là giá học viên trả, HLV nhận 80% sau khi trừ phí.',
                    ]} />
                </LegalSection>

                <LegalSection title="4. Giới hạn trách nhiệm">
                    <p>
                        GYMERVIET không chịu trách nhiệm về chấn thương, thiệt hại sức khỏe hoặc thiệt hại
                        tài chính phát sinh từ việc thực hiện các chương trình tập luyện trên nền tảng.
                        Người dùng tự chịu trách nhiệm về sức khỏe của mình và nên tham khảo ý kiến bác sĩ
                        trước khi bắt đầu bất kỳ chương trình tập luyện nào.
                    </p>
                </LegalSection>

                <LegalSection title="5. Sở hữu trí tuệ">
                    <LegalList items={[
                        'Nội dung bạn đăng tải (ảnh, mô tả) vẫn thuộc sở hữu của bạn.',
                        'Bạn cấp cho GYMERVIET quyền hiển thị nội dung đó trong phạm vi nền tảng.',
                        'Không được sao chép, phân phối giao diện, mã nguồn hoặc thiết kế của GYMERVIET.',
                    ]} />
                </LegalSection>

                <LegalSection title="6. Chấm dứt dịch vụ">
                    <p>
                        Chúng tôi có thể tạm khóa hoặc xóa tài khoản vi phạm Tiêu chuẩn Cộng đồng.
                        Với các tài khoản HLV bị xóa, các học viên đang active sẽ được hoàn tiền
                        phần còn lại của gói tập.
                    </p>
                </LegalSection>

                <LegalSection title="7. Luật áp dụng">
                    <p>
                        Các Điều khoản này được điều chỉnh bởi pháp luật Cộng hòa Xã hội Chủ nghĩa Việt Nam.
                        Mọi tranh chấp sẽ được giải quyết tại Tòa án nhân dân có thẩm quyền tại Việt Nam.
                    </p>
                </LegalSection>

                <LegalSection title="8. Thay đổi điều khoản">
                    <p>
                        Chúng tôi có thể cập nhật Điều khoản này. Người dùng sẽ được thông báo qua email
                        đã đăng ký ít nhất 7 ngày trước khi thay đổi có hiệu lực.
                        Tiếp tục sử dụng sau ngày hiệu lực đồng nghĩa với việc chấp nhận thay đổi.
                    </p>
                </LegalSection>
            </div>
        </LegalPageLayout>
    );
}
