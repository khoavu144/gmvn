import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="bg-white overflow-hidden">
            {/* 1. HERO SECTION (Redesigned) */}
            <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-32 md:pb-40 border-b border-gray-100">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div className="animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                            Đã sẵn sàng cho 2026
                        </div>
                        <h2 className="text-4xl md:text-6xl font-extrabold text-black leading-[1.1] mb-6 tracking-tight">
                            Tìm huấn luyện viên phù hợp với bạn
                        </h2>
                        <p className="text-lg text-gray-600 max-w-xl mb-10 leading-relaxed">
                            Nền tảng kết nối Gymer và Trainer hàng đầu Việt Nam. Nhận chương
                            trình tập luyện cá nhân hóa, theo dõi tiến trình, và nhắn tin trực
                            tiếp với HLV — thiết kế để tối ưu hóa hiệu suất.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/register" className="btn-primary px-8 py-4 text-base">
                                Bắt đầu miễn phí
                            </Link>
                            <Link to="/trainers" className="btn-secondary px-8 py-4 text-base">
                                Khám phá Trainer
                            </Link>
                        </div>
                        <div className="mt-12 flex items-center gap-4 text-xs text-gray-400">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
                                ))}
                            </div>
                            <span>Đã có 10,000+ thành viên tham gia cộng đồng</span>
                        </div>
                    </div>

                    {/* App Preview / Visual (SVG/CSS based) */}
                    <div className="relative hidden md:block animate-fade-in" style={{ animationDelay: '100ms' }}>
                        <div className="absolute -inset-4 bg-gray-50 rounded-3xl -rotate-1 skew-x-1 border border-gray-100" />
                        <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform rotate-1">
                            {/* Mock UI */}
                            <div className="bg-gray-50 h-8 border-b border-gray-100 flex items-center px-4 gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-gray-200" />
                                <div className="w-2 h-2 rounded-full bg-gray-200" />
                                <div className="w-2 h-2 rounded-full bg-gray-200" />
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <div className="h-2 w-20 bg-gray-100 rounded" />
                                        <div className="h-4 w-32 bg-black rounded" />
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gray-100" />
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                        <div key={i} className={`h-16 rounded-xs ${i === 4 ? 'bg-black' : 'bg-gray-50 border border-gray-100'}`} />
                                    ))}
                                </div>
                                <div className="space-y-3">
                                    <div className="h-24 w-full bg-gray-50 border border-gray-100 rounded-xs p-4 flex gap-4">
                                        <div className="w-12 h-12 rounded bg-gray-200 flex-shrink-0" />
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="h-2 w-3/4 bg-gray-200 rounded" />
                                            <div className="h-1.5 w-1/2 bg-gray-100 rounded" />
                                            <div className="h-1.5 w-1/4 bg-gray-100 rounded" />
                                        </div>
                                    </div>
                                    <div className="h-24 w-full bg-gray-50 border border-gray-100 rounded-xs p-4 flex gap-4">
                                        <div className="w-12 h-12 rounded bg-gray-200 flex-shrink-0" />
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="h-2 w-2/3 bg-gray-200 rounded" />
                                            <div className="h-1.5 w-1/3 bg-gray-100 rounded" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Floating elements */}
                        <div className="absolute -right-8 top-1/4 bg-black text-white p-4 rounded-xs shadow-xl max-w-[180px] animate-slide-down">
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Mục tiêu tuần</p>
                            <p className="text-sm font-semibold">Tăng 2kg cơ nạc</p>
                            <div className="mt-3 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white w-2/3" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. STATS SECTION (Trust Signals) */}
            <section className="bg-white py-12 md:py-20 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        {[
                            { label: 'Người tập luyện', value: '10,000+' },
                            { label: 'Huấn luyện viên', value: '500+' },
                            { label: 'Buổi tập đã xong', value: '50,000+' },
                            { label: 'Đánh giá trung bình', value: '4.9 ★' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl md:text-4xl font-extrabold text-black mb-1">{stat.value}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-[10px] text-gray-300 mt-12 uppercase tracking-[0.2em]">
                        Hệ thống xác minh bởi cộng đồng HLV chuyên nghiệp VIỆT NAM
                    </p>
                </div>
            </section>

            {/* 3. HOW IT WORKS (3 Step Process) */}
            <section className="py-24 md:py-32 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 md:mb-24">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">Quy trình</p>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-black tracking-tight">Bắt đầu chỉ với 3 bước</h2>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-12 md:gap-8 relative">
                        {/* Connector line (desktop only) */}
                        <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-px bg-gray-200 -z-10" />

                        {[
                            { step: '01', title: 'Tìm Trainer', desc: 'Duyệt danh sách HLV theo chuyên môn, mục tiêu và mức giá mong muốn.' },
                            { step: '02', title: 'Kết nối trực tiếp', desc: 'Nhắn tin hỏi thăm, tư vấn và đặt lịch tập phù hợp với cá nhân bạn.' },
                            { step: '03', title: 'Tập luyện & Tiến bộ', desc: 'Thực hiện chương trình cá nhân hóa và theo dõi kết quả từng ngày qua biểu đồ.' },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center group">
                                <div className="w-20 h-20 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-8 shadow-sm group-hover:border-black transition-colors duration-300">
                                    <span className="text-xl font-extrabold text-black tracking-tighter">{item.step}</span>
                                </div>
                                <h3 className="text-xl font-bold text-black mb-4">{item.title}</h3>
                                <p className="text-gray-600 max-w-[280px] leading-relaxed text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. WHY CHOOSE US (Features Cards) */}
            <section className="py-24 md:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-start">
                    <div className="sticky top-20">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">Ưu điểm</p>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-black tracking-tight mb-8">
                            Tại sao chọn chúng tôi?
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed mb-8">
                            Chúng tôi loại bỏ các rào cản truyền thống giữa HLV và người tập, tạo ra môi trường làm việc trực tiếp, minh bạch và hiệu quả 100%.
                        </p>
                        <div className="flex gap-4">
                            <Link to="/about" className="text-black font-bold text-sm underline underline-offset-8 decoration-gray-200 hover:decoration-black transition-all">Tìm hiểu về triết lý của chúng tôi →</Link>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {[
                            {
                                title: 'HLV Xác minh',
                                icon: '✓',
                                desc: 'Tất cả HLV trên hệ thống đều phải trải qua bước kiểm duyệt chứng chỉ và kinh nghiệm thực tế.'
                            },
                            {
                                title: 'Dữ liệu cá nhân',
                                icon: '🔒',
                                desc: 'Dữ liệu sức khỏe và tiến trình của bạn được mã hóa và bảo mật hoàn toàn.'
                            },
                            {
                                title: 'Công cụ cho HLV',
                                icon: '⚙️',
                                desc: 'Hệ thống quản lý học viên chuyên nghiệp, giúp HLV tập trung 100% vào chuyên môn.'
                            },
                            {
                                title: 'Cộng đồng thật',
                                icon: '👥',
                                desc: 'Hàng nghìn người tập đã đạt được mục tiêu Body Transformation qua nền tảng.'
                            }
                        ].map((card, i) => (
                            <div key={i} className="card !p-8 group hover:-translate-y-1 bg-white">
                                <div className="text-2xl mb-6 w-12 h-12 rounded bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                    {card.icon}
                                </div>
                                <h4 className="text-lg font-bold text-black mb-3">{card.title}</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. FEATURED TRAINERS (Carousel Mock) */}
            <section className="py-24 md:py-32 bg-gray-50/30 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">Danh sách</p>
                            <h2 className="text-3xl md:text-5xl font-extrabold text-black tracking-tight">Huấn luyện viên nổi bật</h2>
                        </div>
                        <div className="hidden sm:flex gap-2">
                            <button className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center hover:border-black transition-colors">←</button>
                            <button className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center hover:border-black transition-colors">→</button>
                        </div>
                    </div>
                </div>

                <div className="max-w-[100vw] overflow-x-auto no-scrollbar">
                    <div className="flex gap-6 px-4 sm:px-6 lg:px-8 pb-8 min-w-max ml-[calc((100vw-1280px)/2)] max-w-7xl">
                        {[
                            { name: 'Coach John', role: 'Strength Training', rating: '4.9', reviews: '250', clients: '200+' },
                            { name: 'Coach Jane', role: 'Yoga & Wellness', rating: '5.0', reviews: '120', clients: '150+' },
                            { name: 'Coach Mike', role: 'Weight Loss', rating: '4.8', reviews: '98', clients: '180+' },
                            { name: 'Coach Sarah', role: 'Powerlifting', rating: '4.9', reviews: '145', clients: '110+' },
                            { name: 'Coach Alex', role: 'Mobility & Rehab', rating: '4.7', reviews: '82', clients: '90+' },
                        ].map((coach, i) => (
                            <div key={i} className="w-[280px] card !p-6 group hover:border-black transition-all">
                                <div className="w-full aspect-square bg-gray-100 rounded-xs mb-6 overflow-hidden relative">
                                    <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-20">🏋️</div>
                                </div>
                                <h4 className="text-lg font-bold text-black mb-1">{coach.name}</h4>
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-4">{coach.role}</p>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center text-xs font-bold text-black bg-gray-100 px-2 py-0.5 rounded-full">★ {coach.rating}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{coach.reviews} đánh giá</div>
                                </div>
                                <div className="flex justify-between items-center pt-5 border-t border-gray-100">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{coach.clients} học viên</span>
                                    <Link to="/trainers" className="text-xs font-bold text-black hover:underline underline-offset-4">Xem Profile →</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. TESTIMONIALS (Social Proof) */}
            <section className="py-24 md:py-32 bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 md:mb-24">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">Cảm nhận</p>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-black tracking-tight">Thành công từ cộng đồng</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                quote: 'Tôi đã giảm 15kg trong 3 tháng nhờ sự tận tâm của Coach. Hệ thống theo dõi rất dễ dùng.',
                                author: 'Nguyễn Minh',
                                location: 'TP. Hồ Chí Minh',
                                rating: 5
                            },
                            {
                                quote: 'Hệ thống chat trực tiếp rất tiện lợi. Tôi luôn nhận được phản hồi nhanh chóng mỗi khi có thắc mắc.',
                                author: 'Trần Hương',
                                location: 'Hà Nội',
                                rating: 5
                            },
                            {
                                quote: 'Từng là vận động viên chuyên nghiệp, GYMERVIET giúp tôi quay trở lại tập luyện với lộ trình bài bản nhất.',
                                author: 'Phạm Linh',
                                location: 'Đà Nẵng',
                                rating: 5
                            }
                        ].map((t, i) => (
                            <div key={i} className="p-8 md:p-10 border border-gray-100 rounded-xs bg-gray-50/50 flex flex-col justify-between">
                                <div>
                                    <div className="flex gap-0.5 mb-6">
                                        {[...Array(t.rating)].map((_, j) => <span key={j} className="text-sm">★</span>)}
                                    </div>
                                    <p className="text-lg text-black font-medium leading-relaxed italic">"{t.quote}"</p>
                                </div>
                                <div className="mt-10 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                                    <div>
                                        <div className="text-sm font-bold text-black">{t.author}</div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t.location}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. PRICING TABLE (Simple) */}
            <section className="py-24 md:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 md:mb-24">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-4 text-center">Gói dịch vụ</p>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-black tracking-tight text-center">Lựa chọn phù hợp với bạn</h2>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-px bg-gray-200 border border-gray-200">
                        {[
                            {
                                title: 'Miễn phí',
                                price: '0đ',
                                features: ['Duyệt danh sách HLV', 'Nhắn tin tư vấn cơ bản', 'Theo dõi 1 buổi tập/ngày', 'Tham gia cộng đồng'],
                                cta: 'Bắt đầu ngay',
                                type: 'free'
                            },
                            {
                                title: 'Có Coach',
                                price: '79k-499k',
                                suffix: '/tháng',
                                features: ['HLV cá nhân 1 kèm 1', 'Giáo án tập luyện riêng', 'Theo dõi tiến trình 24/7', 'Video hướng dẫn kỹ thuật'],
                                cta: 'Tìm HLV phù hợp',
                                type: 'coach',
                                highlighted: true
                            },
                            {
                                title: 'Premium',
                                price: '99k',
                                suffix: '/tháng',
                                features: ['Tất cả tính năng tập luyện', 'Mở khóa phân tích nâng cao', 'Backup dữ liệu vĩnh viễn', 'Hỗ trợ ưu tiên (24/7)'],
                                cta: 'Nâng cấp Premium',
                                type: 'premium'
                            }
                        ].map((plan, i) => (
                            <div key={i} className={`p-8 md:p-12 bg-white flex flex-col h-full ${plan.highlighted ? 'relative' : ''}`}>
                                {plan.highlighted && (
                                    <div className="absolute top-0 inset-x-0 h-1 bg-black" />
                                )}
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.3em] mb-8">{plan.title}</h3>
                                <div className="mb-10 min-h-[80px]">
                                    <span className="text-4xl md:text-5xl font-extrabold text-black">{plan.price}</span>
                                    {plan.suffix && <span className="text-sm text-gray-400 font-bold ml-1 uppercase">{plan.suffix}</span>}
                                </div>
                                <ul className="space-y-4 mb-12 flex-1">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex gap-3 text-sm text-gray-600 leading-snug">
                                            <span className="text-black font-bold flex-shrink-0">✓</span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to={plan.type === 'free' ? '/register' : '/trainers'}
                                    className={`w-full text-center py-4 rounded-xs text-xs font-bold uppercase tracking-widest transition-all ${plan.highlighted
                                            ? 'bg-black text-white hover:bg-gray-800'
                                            : 'border border-gray-200 text-black hover:border-black'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8. FAQ SECTION (Accordion) */}
            <section className="py-24 md:py-32 bg-gray-50/50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">Hỗ trợ</p>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-black tracking-tight">Câu hỏi thường gặp</h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: 'GYMERVIET hoạt động như thế nào?',
                                a: 'Chúng tôi là nền tảng kết nối trực tiếp. Bạn tìm HLV phù hợp, nhắn tin trao đổi, và đăng ký gói tập. Mọi quy trình theo dõi buổi tập và tiến độ đều được thực hiện ngay trên web app.'
                            },
                            {
                                q: 'Tôi có thể thay đổi HLV sau khi đăng ký không?',
                                a: 'Có, bạn có thể yêu cầu đổi HLV trong vòng 7 ngày đầu tiên nếu cảm thấy không phù hợp. Chúng tôi sẽ hỗ trợ chuyển đổi hoặc hoàn phí theo chính sách.'
                            },
                            {
                                q: 'Dữ liệu sức khỏe của tôi có an toàn không?',
                                a: 'An toàn tuyệt đối. Mọi thông tin sức khỏe và lộ trình tập luyện chỉ có bạn và HLV trực tiếp của bạn được quyền truy cập.'
                            }
                        ].map((faq, i) => (
                            <details key={i} className="group border border-gray-200 bg-white rounded-xs">
                                <summary className="flex justify-between items-center p-6 cursor-pointer list-none focus:outline-none">
                                    <span className="text-sm md:text-base font-bold text-black">{faq.q}</span>
                                    <span className="text-gray-400 font-mono transition-transform group-open:rotate-45">+</span>
                                </summary>
                                <div className="px-6 pb-6 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <Link to="/faq" className="text-xs font-bold text-gray-400 hover:text-black uppercase tracking-widest underline underline-offset-4">Xem tất cả câu hỏi →</Link>
                    </div>
                </div>
            </section>

            {/* 9. FINAL CTA SECTION (Final Push) */}
            <section className="py-24 md:py-40 bg-black text-white text-center">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tighter leading-none">
                        Sẵn sàng để thay đổi cơ thể của bạn?
                    </h2>
                    <p className="text-lg text-gray-400 mb-12 max-w-xl mx-auto">
                        Tham gia cùng 10,000+ gymer khác đang tập luyện hiệu quả hơn mỗi ngày cùng đội ngũ HLV chuyên nghiệp.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="bg-white text-black px-10 py-5 rounded-xs text-sm font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors">
                            Bắt đầu miễn phí ngay
                        </Link>
                        <Link to="/trainers" className="border border-white/20 text-white px-10 py-5 rounded-xs text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
                            Khám phá Trainers
                        </Link>
                    </div>
                    <p className="mt-10 text-[10px] text-gray-500 uppercase tracking-[0.2em] font-medium">
                        Không cần thẻ tín dụng • Hoàn toàn miễn phí khởi tạo
                    </p>
                </div>
            </section>
        </div>
    );
}



