import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

export default function Home() {
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );
    const user = useSelector((state: RootState) => state.auth.user);

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-base font-semibold text-black">
                        GYMERVIET
                    </h1>
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <span className="text-sm text-gray-600">
                                    Xin chào, {user?.full_name}
                                </span>
                                <Link to="/dashboard" className="btn-primary text-sm">
                                    Dashboard
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-tertiary text-sm">
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className="btn-primary text-sm">
                                    Đăng ký
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                <div className="max-w-3xl">
                    <h2 className="text-h1 md:text-4xl font-semibold text-black leading-tight mb-6">
                        Tìm huấn luyện viên phù hợp với bạn
                    </h2>
                    <p className="text-body max-w-2xl mb-10">
                        Nền tảng kết nối Gymer và Trainer hàng đầu Việt Nam. Nhận chương
                        trình tập luyện cá nhân hóa, theo dõi tiến trình, và nhắn tin trực
                        tiếp với HLV - Mọi thứ được thiết kế tập trung vào hiệu suất.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/register" className="btn-primary">
                            Bắt đầu miễn phí
                        </Link>
                        <Link to="/trainers" className="btn-secondary">
                            Khám phá Trainer
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="bg-gray-50 py-20 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 className="text-h2 mb-12">
                        Tại sao chọn GYMERVIET?
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="card">
                            <h4 className="card-header">
                                Cá nhân hóa
                            </h4>
                            <p className="card-body mb-0">
                                Chương trình tập luyện được thiết kế riêng cho mục tiêu và thể trạng của bạn, không có nội dung thừa.
                            </p>
                        </div>
                        <div className="card">
                            <h4 className="card-header">
                                Giao tiếp trực tiếp
                            </h4>
                            <p className="card-body mb-0">
                                Kết nối và nhắn tin trực tiếp với HLV để nhận phản hồi theo thời gian thực bất cứ lúc nào.
                            </p>
                        </div>
                        <div className="card">
                            <h4 className="card-header">
                                Theo dõi dữ liệu
                            </h4>
                            <p className="card-body mb-0">
                                Biểu đồ và dữ liệu tập luyện trực quan. Tập trung vào số liệu thay vì giao diện bóng bẩy.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white py-8">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 gap-4">
                    <div>© 2026 GYMERVIET. Professional Tool.</div>
                    <div className="flex gap-6">
                        <Link to="#" className="hover:text-black hover:underline" onClick={(e) => e.preventDefault()}>Về chúng tôi</Link>
                        <Link to="#" className="hover:text-black hover:underline" onClick={(e) => e.preventDefault()}>Bảo mật</Link>
                        <Link to="#" className="hover:text-black hover:underline" onClick={(e) => e.preventDefault()}>Hỗ trợ</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
