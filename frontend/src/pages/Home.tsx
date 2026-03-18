import { Link } from 'react-router-dom';
import { ArrowRight, Dumbbell, Users, Building2 } from 'lucide-react';
import FeaturedCoaches from '../components/FeaturedCoaches';

const HomeGymer = () => (
    <div className="relative bg-white px-6 py-16 md:px-12 md:py-24 flex flex-col justify-center border-b md:border-b-0 border-gray-200">
        <div className="max-w-lg mx-auto md:mr-0 md:ml-auto w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-6 border border-gray-200">
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                Dành cho Gymer
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black tracking-tight leading-tight mb-4">
                Tập Luyện.<br /> <span className="text-gray-400">Đột Phá.</span>
            </h2>
            <p className="text-base text-gray-600 leading-relaxed mb-8">
                Nền tảng kết nối Gymer và Coach hàng đầu Việt Nam. Nhận giáo án cá nhân hóa, theo dõi tiến trình và tương tác trực tiếp.
            </p>
            <div className="flex flex-wrap gap-3">
                <Link to="/register" className="btn-primary inline-flex items-center">
                    Bắt đầu tập luyện
                    <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link to="/coaches" className="btn-ghost inline-flex items-center">
                    Tìm Coach
                </Link>
            </div>
        </div>
    </div>
);

const HomeGymCenter = () => (
    <div className="relative bg-gray-50 px-6 py-16 md:px-12 md:py-24 flex flex-col justify-center border-l border-gray-200">
        <div className="relative z-10 max-w-lg mx-auto md:ml-0 md:mr-auto w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-6 border border-gray-200">
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                Dành cho Gym Center
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black tracking-tight leading-tight mb-4">
                Quản Lý.<br /><span className="text-gray-400">Tăng Trưởng.</span>
            </h2>
            <p className="text-base text-gray-600 leading-relaxed mb-8">
                Số hóa phòng tập của bạn. Quản lý hội viên, Coach, chi nhánh và doanh thu tất cả trong một nền tảng chuyên nghiệp.
            </p>
            <div className="flex flex-wrap gap-3">
                <Link to="/gyms" className="btn-primary inline-flex items-center">
                    Danh sách phòng tập
                </Link>
                <Link to="/register" className="btn-secondary inline-flex items-center">
                    Đăng ký Đối Tác
                </Link>
            </div>
        </div>
    </div>
);

export default function Home() {
    return (
        <div className="bg-white overflow-hidden">
            {/* 1. HERO SECTION (Split Screen) */}
            <section className="border-b border-gray-200">
                <div className="grid md:grid-cols-2 min-h-[85vh]">
                    <HomeGymer />
                    <HomeGymCenter />
                </div>
            </section>

            {/* 2. FEATURED COACHES SECTION */}
            <FeaturedCoaches />

            {/* 3. ROLES INTRODUCTION */}
            <section className="py-16 md:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 md:mb-16">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center mb-3">Hệ Sinh Thái</p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-black text-center">Nền tảng dành riêng cho bạn</h2>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                        {[
                            {
                                title: 'Athlete',
                                subtitle: 'Người tập luyện',
                                desc: 'Tìm kiếm lộ trình tập luyện bài bản, theo dõi tiến độ và kết nối trực tiếp với Coach để đạt hiệu quả tối đa.',
                                cta: 'Bắt đầu ngay',
                                link: '/register',
                                icon: Dumbbell,
                                bg: 'bg-gray-50'
                            },
                            {
                                title: 'Coach',
                                subtitle: 'Huấn luyện viên',
                                desc: 'Xây dựng thương hiệu cá nhân, quản lý hàng trăm học viên dễ dàng và tối ưu hóa doanh thu từ nghề nghiệp.',
                                cta: 'Đăng ký Coach',
                                link: '/register',
                                icon: Users,
                                bg: 'bg-black text-white'
                            },
                            {
                                title: 'Gym Center',
                                subtitle: 'Cơ sở / Phòng tập',
                                desc: 'Số hóa quản lý chi nhánh, thiết bị, thu hút học viên mới và quản trị quan hệ đối tác với các Coach.',
                                cta: 'Trở thành Đối Tác',
                                link: '/register',
                                icon: Building2,
                                bg: 'bg-gray-50'
                            }
                        ].map((role, i) => {
                            const Icon = role.icon;
                            const isDark = role.bg.includes('bg-black');
                            return (
                                <div key={i} className={`p-6 md:p-8 rounded-xl flex flex-col h-full ${role.bg}`}>
                                    <Icon className={`w-8 h-8 mb-4 ${isDark ? 'text-white' : 'text-black'}`} />
                                    <h3 className="heading-3 mb-1">{role.title}</h3>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{role.subtitle}</p>
                                    <p className={`body-2 mb-6 flex-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{role.desc}</p>
                                    <Link
                                        to={role.link}
                                        className={`text-center py-3 px-4 rounded text-xs font-bold uppercase tracking-widest transition-colors ${isDark
                                            ? 'bg-white text-black hover:bg-gray-200'
                                            : 'bg-black text-white hover:bg-gray-800'
                                            }`}
                                    >
                                        {role.cta}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 4. FINAL CTA */}
            <section className="py-20 md:py-32 bg-black text-white text-center">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="heading-1 text-white mb-6">
                        Sẵn sàng để đột phá?
                    </h2>
                    <p className="body-1 text-gray-400 mb-10 max-w-xl mx-auto">
                        Tham gia cùng cộng đồng GYMERVIET ngay hôm nay.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/register" className="btn-secondary btn-lg">
                            Đăng ký miễn phí
                        </Link>
                        <Link to="/coaches" className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold border border-white/40 text-white hover:bg-white/10 rounded-sm transition-colors">
                            Khám phá Coach
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}