import LegalPageLayout, { LegalSection, LegalList } from '../../components/LegalPageLayout';
import { Link } from 'react-router-dom';

export default function GuidelinesPage() {
    return (
        <LegalPageLayout
            title="Hướng dẫn sử dụng"
            subtitle="Hướng dẫn từng bước để khai thác tối đa nền tảng GYMERVIET — dành cho cả học viên và huấn luyện viên."
            breadcrumbs={[{ label: 'Hướng dẫn sử dụng' }]}
            maxWidth="xl"
        >
            {/* Tab-like navigation */}
            <div className="flex gap-2 mb-10 border-b border-gray-200 pb-0 overflow-x-auto">
                {['Tổng quan', 'Dành cho học viên', 'Dành cho huấn luyện viên'].map((tab, i) => (
                    <a
                        key={tab}
                        href={`#section-${i}`}
                        className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-black border-b-2 border-transparent hover:border-gray-200 whitespace-nowrap transition-colors"
                    >
                        {tab}
                    </a>
                ))}
            </div>

            {/* Section 0: Overview */}
            <div id="section-0">
                <LegalSection title="Tổng quan nền tảng">
                    <p>GYMERVIET kết nối 3 nhóm người dùng chính:</p>
                    <div className="grid sm:grid-cols-3 gap-4 mt-3">
                        {[
                            { role: 'Người tập', desc: 'Tìm kiếm huấn luyện viên, nhắn tin trao đổi trực tiếp. Theo dõi lịch tập và tiến trình.', color: 'border-gray-200' },
                            { role: 'Vận động viên', desc: 'Như người tập nhưng có thêm hồ sơ chuyên nghiệp và có thể tạo chương trình của riêng mình.', color: 'border-gray-200' },
                            { role: 'Huấn luyện viên chuyên nghiệp', desc: 'Tạo chương trình tập, quản lý học viên, xây dựng hồ sơ công khai chuyên nghiệp.', color: 'border-black' },
                        ].map((r) => (
                            <div key={r.role} className={`card border ${r.color}`}>
                                <h4 className="font-bold text-sm text-black mb-2">{r.role}</h4>
                                <p className="text-sm text-gray-600">{r.desc}</p>
                            </div>
                        ))}
                    </div>
                </LegalSection>
            </div>

            {/* Section 1: For athletes/users */}
            <div id="section-1">
                <LegalSection title="Dành cho học viên — Bắt đầu tập luyện">
                    <p className="font-medium text-black">Bước 1: Đăng ký tài khoản</p>
                    <LegalList items={[
                        'Vào trang Đăng ký, chọn loại tài khoản "Người tập luyện".',
                        'Điền email, mật khẩu (tối thiểu 8 ký tự), và họ tên.',
                        'Đăng nhập ngay sau khi đăng ký thành công.',
                    ]} />

                    <p className="font-medium text-black mt-5">Bước 2: Tìm huấn luyện viên</p>
                    <LegalList items={[
                        'Vào mục "Khám phá huấn luyện viên" để duyệt danh sách huấn luyện viên.',
                        'Dùng thanh tìm kiếm để lọc theo tên, chuyên môn (yoga, giảm cân, tăng cơ...).',
                        'Bấm vào card huấn luyện viên để xem hồ sơ đầy đủ, chương trình và đánh giá.',
                        'Dùng nút "Nhắn tin" để hỏi thăm trước khi đăng ký.',
                    ]} />

                    <p className="font-medium text-black mt-5">Bước 3: Liên hệ & Thỏa thuận</p>
                    <LegalList items={[
                        'Xem chương trình huấn luyện viên đăng tải, chọn chương trình phù hợp.',
                        'Nhắn tin trực tiếp với huấn luyện viên để trao đổi chi tiết.',
                        'Thống nhất lịch tập, chi phí và cách thanh toán trực tiếp với huấn luyện viên.',
                        'Sau khi thỏa thuận xong, huấn luyện viên sẽ thiết lập lịch tập cho bạn.',
                    ]} />

                    <p className="font-medium text-black mt-5">Bước 4: Theo dõi tiến trình</p>
                    <LegalList items={[
                        'Vào Dashboard → "Lịch tập của tôi" để xem lịch theo tuần.',
                        'Hoàn thành buổi tập → bấm "Đánh dấu xong" và ghi chú nếu cần.',
                        'Tiến trình cân nặng, số đo được lưu tại mục "Tiến trình".',
                    ]} />
                </LegalSection>
            </div>

            {/* Section 2: For Coaches */}
            <div id="section-2">
                <LegalSection title="Dành cho huấn luyện viên — Xây dựng hồ sơ & chương trình">
                    <p className="font-medium text-black">Bước 1: Hoàn thiện hồ sơ cá nhân</p>
                    <LegalList items={[
                        'Hồ sơ → tab "Cá nhân": thêm ảnh đại diện, giới thiệu bản thân, chuyên môn.',
                        'Hồ sơ → tab "Hồ sơ (công khai)": thiết lập slug URL, ảnh bìa, tiêu đề giới thiệu chuyên nghiệp.',
                        'Thêm kinh nghiệm làm việc/học vấn/chứng chỉ ở tab "Kinh nghiệm".',
                        'Tải ảnh buổi tập và kết quả thay đổi vào tab "Thư viện ảnh".',
                        'Thêm FAQ để học viên tiềm năng hiểu rõ dịch vụ của bạn.',
                    ]} />

                    <p className="font-medium text-black mt-5">Bước 2: Tạo chương trình</p>
                    <LegalList items={[
                        'Vào Dashboard → "Quản lý chương trình" → "+ Tạo chương trình mới".',
                        'Điền đầy đủ: tên, mô tả, hình thức (trực tuyến/trực tiếp/kết hợp), mục tiêu.',
                        'Chọn cấu trúc giá: hàng tháng / trọn khóa / theo buổi.',
                        'Tải ảnh bìa minh họa cho chương trình (tỉ lệ 16:9).',
                        'Bấm "Xuất bản" khi sẵn sàng — chương trình sẽ hiển thị trong hồ sơ của bạn.',
                    ]} />

                    <p className="font-medium text-black mt-5">Bước 3: Quản lý học viên</p>
                    <LegalList items={[
                        'Dashboard → "Học viên" để xem danh sách học viên đang hoạt động.',
                        'Tin nhắn để liên lạc trực tiếp với từng học viên.',
                        'Dashboard → xem số học viên đang hoạt động, lượng kết nối mới và trạng thái hồ sơ công khai để theo dõi đà phát triển của bạn.',
                    ]} />
                </LegalSection>
            </div>

            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xs text-sm text-gray-600">
                Cần hỗ trợ thêm?{' '}
                <Link to="/faq" className="font-medium text-black underline underline-offset-2">Xem FAQ</Link>
                {' '}hoặc{' '}
                <Link to="/contact" className="font-medium text-black underline underline-offset-2">liên hệ đội ngũ</Link>.
            </div>
        </LegalPageLayout>
    );
}
