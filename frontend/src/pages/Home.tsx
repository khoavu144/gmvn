import { Link } from 'react-router-dom';
import FeaturedCoaches from '../components/FeaturedCoaches';

const HomeGymer = () => (
    <div className="relative bg-white px-8 py-24 md:px-16 md:py-32 flex flex-col justify-center animate-fade-in border-b md:border-b-0 md:border-r border-gray-200 group">
        <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        <div className="relative z-10 max-w-lg mx-auto md:mr-0 md:ml-auto w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-8 border border-gray-200">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                Dành cho Gymer
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-black leading-[1.05] mb-6 tracking-tight">
                Tập Luyện.<br /> <span className="text-gray-400">Đột Phá.</span>
            </h2>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed font-medium">
                Nền tảng kết nối Gymer và Coach hàng đầu Việt Nam. Nhận giáo án cá nhân hóa, theo dõi tiến trình và tương tác trực tiếp.
            </p>
            <div className="flex flex-wrap gap-4">
                <Link to="/register" className="bg-black text-white hover:bg-gray-800 transition-colors font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-lg flex items-center justify-center whitespace-nowrap flex-1 sm:flex-none">
                    Bắt đầu tập luyện
                </Link>
                <Link to="/coaches" className="border border-gray-300 text-black hover:border-black hover:bg-gray-50 transition-colors font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-lg flex items-center justify-center whitespace-nowrap flex-1 sm:flex-none">
                    Tìm Coach
                </Link>
            </div>
        </div>
    </div>
);

const HomeGymCenter = () => (
    <div className="relative bg-black text-white px-8 py-24 md:px-16 md:py-32 flex flex-col justify-center animate-fade-in group">
        <div className="absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        <div className="relative z-10 max-w-lg mx-auto md:ml-0 md:mr-auto w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-8 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Dành cho Gym Center
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight">
                Quản Lý.<br /><span className="text-gray-500">Tăng Trưởng.</span>
            </h2>
            <p className="text-lg text-gray-400 mb-10 leading-relaxed font-medium">
                Số hóa phòng tập của bạn. Quản lý hội viên, Coach, chi nhánh và doanh thu tất cả trong một nền tảng chuyên nghiệp.
            </p>
            <div className="flex flex-wrap gap-4">
                <Link to="/gyms" className="bg-white text-black hover:bg-gray-200 transition-colors font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-lg flex items-center justify-center whitespace-nowrap flex-1 sm:flex-none">
                    Danh sách phòng tập
                </Link>
                <Link to="/register" className="border border-gray-700 text-white hover:border-white hover:bg-white/10 transition-colors font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-lg flex items-center justify-center whitespace-nowrap flex-1 sm:flex-none">
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
                <div className="grid md:grid-cols-2 min-h-[90vh]">
                    <HomeGymer />
                    <HomeGymCenter />
                </div>
            </section>

            {/* 2. FEATURED COACHES SECTION (Replaces STATS) */}
            <FeaturedCoaches />

            {/* 3. ROLES INTRODUCTION (Expanded) */}
            <section className="py-24 md:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 md:mb-24">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-4 text-center">Hệ Sinh Thái</p>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-black tracking-tight text-center">Nền tảng dành riêng cho bạn</h2>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: 'Athlete',
                                subtitle: 'Người tập luyện',
                                desc: 'Tìm kiếm lộ trình tập luyện bài bản, theo dõi tiến độ và kết nối trực tiếp với Coach để đạt hiệu quả tối đa.',
                                cta: 'Bắt đầu ngay',
                                link: '/register',
                                bg: 'bg-gray-50'
                            },
                            {
                                title: 'Coach',
                                subtitle: 'Huấn luyện viên',
                                desc: 'Xây dựng thương hiệu cá nhân, quản lý hàng trăm học viên dễ dàng và tối ưu hóa doanh thu từ nghề nghiệp.',
                                cta: 'Đăng ký Coach',
                                link: '/register',
                                bg: 'bg-black text-white'
                            },
                            {
                                title: 'Gym Center',
                                subtitle: 'Cơ sở / Phòng tập',
                                desc: 'Số hóa quản lý chi nhánh, thiết bị, thu hút học viên mới và quản trị quan hệ đối tác với các Coach.',
                                cta: 'Trở thành Đối Tác',
                                link: '/register',
                                bg: 'bg-gray-50'
                            }
                        ].map((role, i) => (
                            <div key={i} className={`p-8 md:p-10 rounded-xl flex flex-col h-full ${role.bg}`}>
                                <h3 className="text-3xl font-extrabold mb-1">{role.title}</h3>
                                <p className={`text-xs font-bold uppercase tracking-widest mb-6 ${role.bg.includes('bg-black') ? 'text-gray-400' : 'text-gray-500'}`}>{role.subtitle}</p>
                                <p className={`text-sm leading-relaxed mb-10 flex-1 ${role.bg.includes('bg-black') ? 'text-gray-300' : 'text-gray-600'}`}>{role.desc}</p>
                                <Link
                                    to={role.link}
                                    className={`w-full text-center py-4 rounded-xs text-xs font-bold uppercase tracking-widest transition-all ${role.bg.includes('bg-black')
                                        ? 'bg-white text-black hover:bg-gray-200'
                                        : 'bg-black text-white hover:bg-gray-800'
                                        }`}
                                >
                                    {role.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. FINAL CTA */}
            <section className="py-24 md:py-40 bg-black text-white text-center">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tighter leading-none">
                        Sẵn sàng để đột phá?
                    </h2>
                    <p className="text-lg text-gray-400 mb-12 max-w-xl mx-auto">
                        Tham gia cùng cộng đồng GYMERVIET ngay hôm nay.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="bg-white text-black px-10 py-5 rounded-xs text-sm font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors">
                            Đăng ký miễn phí
                        </Link>
                        <Link to="/coaches" className="border border-white/20 text-white px-10 py-5 rounded-xs text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
                            Khám phá Coach
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}



