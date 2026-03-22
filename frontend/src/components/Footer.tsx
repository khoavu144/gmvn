import { Link } from 'react-router-dom';

const footerLinks = [
    {
        title: 'Về chúng tôi',
        links: [
            { label: 'Về GYMERVIET', to: '/about' },
            { label: 'Bảo mật & Quyền riêng tư', to: '/privacy' },
        ],
    },
    {
        title: 'Cộng đồng',
        links: [
            { label: 'Tiêu chuẩn cộng đồng', to: '/community-standards' },
            { label: 'Hướng dẫn sử dụng', to: '/guidelines' },
            { label: 'Điều khoản dịch vụ', to: '/terms' },
        ],
    },
    {
        title: 'Hỗ trợ',
        links: [
            { label: 'Câu hỏi thường gặp', to: '/faq' },
            { label: 'Liên hệ', to: '/contact' },
            { label: 'Báo cáo vi phạm', to: '/report' },
        ],
    },
    {
        title: 'Dành cho Coach',
        links: [
            { label: 'Bắt đầu làm Coach', to: '/coach-guide' },
            { label: 'Chính sách thanh toán', to: '/payment-policy' },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200">
            {/* Main footer grid */}
            <div className="page-container py-12 sm:py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
                    {footerLinks.map((col) => (
                        <div key={col.title}>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-black mb-4">
                                {col.title}
                            </h3>
                            <ul className="space-y-2.5">
                                {col.links.map((link) => (
                                    <li key={link.to}>
                                        <Link
                                            to={link.to}
                                            className="text-sm text-gray-600 hover:text-black transition-colors hover:underline underline-offset-2"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-200">
                <div className="page-container py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-black tracking-wider">GYMERVIET</span>
                        <span>©&nbsp;{new Date().getFullYear()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/privacy" className="hover:text-black transition-colors">Bảo mật</Link>
                        <span className="text-gray-400">|</span>
                        <Link to="/terms" className="hover:text-black transition-colors">Điều khoản</Link>
                        <span className="text-gray-400">|</span>
                        <Link to="/contact" className="hover:text-black transition-colors">Liên hệ</Link>
                    </div>
                    <div className="text-[10px] text-gray-600 mt-2 sm:mt-0 italic">by khoavu.</div>
                </div>
            </div>
        </footer>
    );
}
