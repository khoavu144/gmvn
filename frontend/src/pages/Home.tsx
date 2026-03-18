import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import FeaturedCoaches from '../components/FeaturedCoaches';

const HomeGymer = () => (
    <div className="relative bg-black px-6 py-20 md:px-12 md:py-32 flex flex-col justify-center min-h-[50vh] md:min-h-screen">
        <div className="max-w-lg mx-auto md:mr-0 md:ml-auto w-full flex flex-col items-start md:items-end text-left md:text-right pr-0 md:pr-12 lg:pr-24">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-6">
                Xây dựng bản thân
            </span>
            <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-none mb-6 uppercase">
                Kỷ<br />Luật.
            </h2>
            <p className="text-sm md:text-base text-gray-400 max-w-sm mb-10 leading-relaxed">
                Khởi tạo hành trình lột xác với hàng trăm giáo án cá nhân hóa từ chuyên gia hàng đầu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link to="/register" className="bg-white text-black px-8 py-4 rounded-none font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors text-center">
                    Khởi động hành trình
                </Link>
                <Link to="/coaches" className="bg-transparent border border-white/20 text-white px-8 py-4 rounded-none font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-colors text-center">
                    Tìm Coach
                </Link>
            </div>
        </div>
    </div>
);

const HomeGymCenter = () => (
    <div className="relative bg-white px-6 py-20 md:px-12 md:py-32 flex flex-col justify-center min-h-[50vh] md:min-h-screen">
        <div className="relative z-10 max-w-lg mx-auto md:ml-0 md:mr-auto w-full flex flex-col items-start text-left pl-0 md:pl-12 lg:pl-24">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">
                Mở rộng mạng lưới
            </span>
            <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-black tracking-tighter leading-none mb-6 uppercase">
                Center.
            </h2>
            <p className="text-sm md:text-base text-gray-500 max-w-sm mb-10 leading-relaxed">
                Số hoá phòng tập, quản trị doanh thu đa chi nhánh và bứt phá tệp hội viên không giới hạn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link to="/gyms" className="bg-black text-white px-8 py-4 rounded-none font-black uppercase tracking-widest text-xs hover:bg-gray-900 transition-colors text-center">
                    Gắn kết hệ thống
                </Link>
                <Link to="/register" className="bg-transparent border border-gray-200 text-black px-8 py-4 rounded-none font-bold uppercase tracking-widest text-xs hover:bg-gray-50 transition-colors text-center">
                    Trở thành Đối Tác
                </Link>
            </div>
        </div>
    </div>
);

export default function Home() {
    return (
        <div className="bg-white overflow-hidden">
            <Helmet>
                <title>GYMERVIET — Hệ sinh thái Gym & Coach số 1 Việt Nam</title>
                <meta name="description" content="Nền tảng kết nối Gymer, Coach và Gym Center hàng đầu Việt Nam. Tìm huấn luyện viên, phòng tập và giáo án cá nhân hoá." />
            </Helmet>

            {/* 1. HERO SECTION (Split Screen) */}
            <section className="relative w-full">
                <div className="grid md:grid-cols-2 relative">
                    <HomeGymer />
                    <HomeGymCenter />
                    {/* The Intersecting Brand Badge — desktop: floating circle, mobile: banner strip */}
                    <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-32 h-32 bg-white rounded-full items-center justify-center border-8 border-black shadow-2xl hover:scale-105 transition-transform duration-500">
                        <span className="font-black text-xs tracking-[0.2em] text-center leading-tight">
                            GYMER<br />VIET
                        </span>
                    </div>
                    <div className="md:hidden absolute left-0 right-0 top-1/2 -translate-y-1/2 z-20 flex justify-center">
                        <div className="bg-white border-4 border-black shadow-xl px-6 py-2 rounded-full">
                            <span className="font-black text-[10px] tracking-[0.25em]">GYMERVIET</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. FEATURED COACHES SECTION */}
            <FeaturedCoaches />

            {/* 3. ROLES INTRODUCTION */}
            <section className="py-24 md:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 md:mb-24 flex flex-col items-center">
                    <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-black text-center tracking-tighter uppercase leading-none">
                        Một Nền Tảng.<br />Ba Cột Mốc.
                    </h2>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
                        
                        {/* THE COACH CARD (Large, asymmetric focus) */}
                        <div className="md:col-span-7 bg-gradient-to-br from-black to-gray-900 rounded-2xl p-8 md:p-14 flex flex-col justify-end min-h-[400px] md:min-h-[600px] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070')] bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-700 mix-blend-luminosity"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                            
                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-white mb-6 border border-white/20">
                                    Dành cho Huấn luyện viên
                                </span>
                                <h3 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
                                    Thương hiệu<br />Cá nhân.
                                </h3>
                                <p className="text-gray-400 text-sm md:text-base mb-8 max-w-md leading-relaxed">
                                    Phát triển học viên không giới hạn địa lý. Quản lý lịch tập, giáo án và doanh thu chuyên nghiệp trên một công cụ quyền lực nhất.
                                </p>
                                <Link to="/register" className="inline-flex items-center bg-white text-black px-8 py-4 rounded-none font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors">
                                    Đăng ký Coach
                                </Link>
                            </div>
                        </div>

                        {/* STACKED SMALLER CARDS */}
                        <div className="md:col-span-5 flex flex-col gap-4 md:gap-6">
                            
                            {/* ATHLETE CARD */}
                            <div className="flex-1 bg-gray-50 rounded-2xl p-8 md:p-10 flex flex-col justify-between group hover:bg-gray-100 transition-colors border border-gray-200">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-white rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-6 border border-gray-200 shadow-sm">
                                        Dành cho Người tập luyện
                                    </span>
                                    <h3 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tighter mb-4 leading-tight">
                                        Vượt Qua<br />Giới Hạn.
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                                        Kết nối trực tiếp với Top Coach, nhận giáo án cá nhân hóa và theo dõi tiến độ lột xác từng ngày.
                                    </p>
                                </div>
                                <div>
                                    <Link to="/register" className="inline-flex items-center text-black font-bold uppercase tracking-widest text-xs border-b-2 border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors">
                                        Bắt đầu ngay
                                    </Link>
                                </div>
                            </div>
                            
                            {/* GYM CENTER CARD */}
                            <div className="flex-1 bg-black rounded-2xl p-8 md:p-10 flex flex-col justify-between group hover:bg-gray-900 transition-colors">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6 border border-white/10">
                                        Dành cho Cơ sở vật chất
                                    </span>
                                    <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">
                                        Tối Ưu<br />Vận Hành.
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                                        Số hóa toàn bộ chi nhánh. Thu hút hội viên mới và quản lý rủi ro kinh doanh ngay trên lòng bàn tay.
                                    </p>
                                </div>
                                <div>
                                    <Link to="/register" className="inline-flex items-center text-white font-bold uppercase tracking-widest text-xs border-b-2 border-white pb-1 hover:text-gray-300 hover:border-gray-300 transition-colors">
                                        Trở thành Đối Tác
                                    </Link>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* 4. FINAL CTA */}
            <section className="py-24 md:py-40 bg-black text-white text-center">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-5xl md:text-7xl/tight font-black text-white tracking-tighter mb-12 uppercase">
                        Không có lối tắt.<br />Chỉ có Gymerviet.
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="bg-white text-black px-10 py-5 rounded-none font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors">
                            Trở Thành Hội Viên
                        </Link>
                        <Link to="/register" className="bg-transparent border border-white/20 text-white px-10 py-5 rounded-none font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-colors">
                            Đối Tác Cơ Sở
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}