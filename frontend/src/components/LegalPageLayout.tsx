import { Link } from 'react-router-dom';

interface Breadcrumb {
    label: string;
    to?: string;
}

interface LegalPageLayoutProps {
    title: string;
    subtitle?: string;
    lastUpdated?: string;
    breadcrumbs?: Breadcrumb[];
    children: React.ReactNode;
    maxWidth?: 'md' | 'lg' | 'xl';
}

export default function LegalPageLayout({
    title,
    subtitle,
    lastUpdated,
    breadcrumbs,
    children,
    maxWidth = 'lg',
}: LegalPageLayoutProps) {
    const widthClass = {
        md: 'max-w-2xl',
        lg: 'max-w-3xl',
        xl: 'max-w-4xl',
    }[maxWidth];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Page header */}
            <div className="bg-white border-b border-gray-200">
                <div className={`${widthClass} mx-auto px-4 py-10 sm:py-14`}>
                    {/* Breadcrumb */}
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
                            <Link to="/" className="hover:text-black transition-colors">Trang chủ</Link>
                            {breadcrumbs.map((crumb, i) => (
                                <span key={i} className="flex items-center gap-2">
                                    <span className="text-gray-300">/</span>
                                    {crumb.to ? (
                                        <Link to={crumb.to} className="hover:text-black transition-colors">
                                            {crumb.label}
                                        </Link>
                                    ) : (
                                        <span className="text-gray-700 font-medium">{crumb.label}</span>
                                    )}
                                </span>
                            ))}
                        </nav>
                    )}

                    <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">{title}</h1>
                    {subtitle && (
                        <p className="text-base text-gray-600 mt-3 leading-relaxed max-w-xl">{subtitle}</p>
                    )}
                    {lastUpdated && (
                        <p className="text-xs text-gray-400 mt-4 uppercase tracking-wider">
                            Cập nhật lần cuối: {lastUpdated}
                        </p>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className={`${widthClass} mx-auto px-4 py-10 sm:py-14`}>
                {children}
            </div>
        </div>
    );
}

// ── Prose components cho nội dung văn bản ────────────────────────────────────

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-10">
            <h2 className="text-lg font-bold text-black mb-4 pb-3 border-b border-gray-200">{title}</h2>
            <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                {children}
            </div>
        </section>
    );
}

export function LegalList({ items }: { items: string[] }) {
    return (
        <ul className="space-y-2 ml-4">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

export function LegalCallout({
    type = 'info',
    children,
}: {
    type?: 'info' | 'warning' | 'danger';
    children: React.ReactNode;
}) {
    const styles = {
        info: 'border-gray-300 bg-gray-50 text-gray-700',
        warning: 'border-gray-400 bg-gray-100 text-gray-800',
        danger: 'border-black bg-black text-white',
    }[type];

    return (
        <div className={`border-l-4 px-4 py-3 rounded-r-xs text-sm leading-relaxed ${styles}`}>
            {children}
        </div>
    );
}
