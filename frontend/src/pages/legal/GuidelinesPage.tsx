import LegalPageLayout, { LegalSection, LegalList } from '../../components/LegalPageLayout';
import { Link } from 'react-router-dom';

export default function GuidelinesPage() {
    return (
        <LegalPageLayout
            title="Hướng dẫn sử dụng"
            subtitle="Hướng dẫn từng bước để khai thác tối đa nền tảng GYMERVIET — dành cho cả học viên và Coach."
            breadcrumbs={[{ label: 'Hướng dẫn sử dụng' }]}
            maxWidth="xl"
        >
            {/* Tab-like navigation */}
            <div className="flex gap-2 mb-10 border-b border-[color:var(--mk-line)] pb-0 overflow-x-auto">
                {['Tổng quan', 'Dành cho học viên', 'Dành cho Coach'].map((tab, i) => (
                    <a
                        key={tab}
                        href={`#section-${i}`}
                        className="px-4 py-2.5 text-sm font-medium text-[color:var(--mk-text-soft)] hover:text-black border-b-2 border-transparent hover:border-[color:var(--mk-line)] whitespace-nowrap transition-colors"
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
                            { role: 'Người tập (User)', desc: 'Tìm kiếm và đăng ký gói tập với Coach. Theo dõi lịch tập, nhắn tin với Coach.', color: 'border-[color:var(--mk-line)]' },
                            { role: 'Vận động viên (Athlete)', desc: 'Như người tập nhưng có thêm portfolio chuyên nghiệp và có thể tạo gói tập của mình.', color: 'border-[color:var(--mk-line)]' },
                            { role: 'Coach chuyên nghiệp', desc: 'Tạo và bán gói tập, quản lý học viên, xây dựng hồ sơ public chuyên nghiệp.', color: 'border-black' },
                        ].map((r) => (
                            <div key={r.role} className={`card border ${r.color}`}>
                                <h4 className="font-bold text-sm text-black mb-2">{r.role}</h4>
                                <p className="text-sm text-[color:var(--mk-text-soft)]">{r.desc}</p>
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
                        'Vào trang Đăng ký, chọn loại tài khoản "Người tập luyện (Gymer)".',
                        'Điền email, mật khẩu (tối thiểu 8 ký tự), và họ tên.',
                        'Đăng nhập ngay sau khi đăng ký thành công.',
                    ]} />

                    <p className="font-medium text-black mt-5">Bước 2: Tìm Coach</p>
                    <LegalList items={[
                        'Vào mục "Khám phá Coach" để duyệt danh sách Coach.',
                        'Dùng thanh tìm kiếm để lọc theo tên, chuyên môn (yoga, giảm cân, tăng cơ...).',
                        'Bấm vào card Coach để xem profile đầy đủ, gói tập và đánh giá.',
                        'Dùng nút "Nhắn tin" để hỏi thăm trước khi đăng ký.',
                    ]} />

                    <p className="font-medium text-black mt-5">Bước 3: Đăng ký gói tập</p>
                    <LegalList items={[
                        'Chọn gói tập phù hợp → bấm "Đăng ký".',
                        'Hệ thống hiển thị QR Code chuyển khoản với nội dung cố định.',
                        'Chuyển khoản đúng số tiền và nội dung. Hệ thống xác nhận trong 1–5 phút.',
                        'Sau khi xác nhận, lịch tập xuất hiện trong mục "Lịch tập của tôi".',
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
                <LegalSection title="Dành cho Coach — Xây dựng profile & bán gói tập">
                    <p className="font-medium text-black">Bước 1: Hoàn thiện hồ sơ cá nhân</p>
                    <LegalList items={[
                        'Profile → tab "Cá nhân": thêm ảnh đại diện, giới thiệu bản thân, chuyên môn.',
                        'Profile → tab "Hồ sơ (Public)": thiết lập slug URL, ảnh bìa, headline chuyên nghiệp.',
                        'Thêm kinh nghiệm làm việc/học vấn/chứng chỉ ở tab "Kinh nghiệm".',
                        'Upload ảnh buổi tập, transformation vào tab "Gallery".',
                        'Thêm FAQ để học viên tiềm năng hiểu rõ dịch vụ của bạn.',
                    ]} />

                    <p className="font-medium text-black mt-5">Bước 2: Tạo gói tập</p>
                    <LegalList items={[
                        'Vào Dashboard → "Quản lý Gói tập" → "+ Tạo gói mới".',
                        'Điền đầy đủ: tên, mô tả, hình thức (online/offline/hybrid), mục tiêu.',
                        'Chọn cấu trúc giá: hàng tháng / trọn khóa / theo buổi.',
                        'Upload ảnh bìa minh họa cho gói tập (tỉ lệ 16:9).',
                        'Bấm "Phát hành" khi sẵn sàng — gói sẽ hiển thị trong trang profile của bạn.',
                    ]} />

                    <p className="font-medium text-black mt-5">Bước 3: Quản lý học viên</p>
                    <LegalList items={[
                        'Dashboard → "Học viên" để xem danh sách học viên đang active.',
                        'Tin nhắn để liên lạc trực tiếp với từng học viên.',
                        'Dashboard → "Doanh thu" để theo dõi thu nhập (sau khi trừ phí nền tảng 5%).',
                    ]} />
                </LegalSection>
            </div>

            <div className="mt-8 p-4 bg-[color:var(--mk-paper)] border border-[color:var(--mk-line)] rounded-xs text-sm text-[color:var(--mk-text-soft)]">
                Cần hỗ trợ thêm?{' '}
                <Link to="/faq" className="font-medium text-black underline underline-offset-2">Xem FAQ</Link>
                {' '}hoặc{' '}
                <Link to="/contact" className="font-medium text-black underline underline-offset-2">liên hệ đội ngũ</Link>.
            </div>
        </LegalPageLayout>
    );
}
