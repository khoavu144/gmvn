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
        <div className="page-shell">
            <div className="border-b border-gray-200 bg-white">
                <div className={`page-container ${widthClass} py-10 sm:py-14`}>
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <nav className="mb-6 flex items-center gap-2 text-xs text-gray-500" aria-label="Breadcrumb">
                            <Link to="/" className="font-medium transition-colors hover:text-black">Trang chủ</Link>
                            {breadcrumbs.map((crumb, i) => (
                                <span key={i} className="flex items-center gap-2">
                                    <span className="text-gray-300">/</span>
                                    {crumb.to ? (
                                        <Link to={crumb.to} className="font-medium transition-colors hover:text-black">
                                            {crumb.label}
                                        </Link>
                                    ) : (
                                        <span className="font-semibold text-gray-600">{crumb.label}</span>
                                    )}
                                </span>
                            ))}
                        </nav>
                    )}

                    <div className="page-header mb-0 border-b-0 pb-0">
                        <p className="page-kicker">Hỗ trợ & chính sách</p>
                        <h1 className="page-title max-w-3xl">{title}</h1>
                        {subtitle && (
                            <p className="page-description max-w-2xl">{subtitle}</p>
                        )}
                        {lastUpdated && (
                            <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-gray-500">
                                Cập nhật lần cuối: {lastUpdated}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className={`page-container ${widthClass} py-10 sm:py-12`}>
                {children}
            </div>
        </div>
    );
}

// ── Prose components cho nội dung văn bản ────────────────────────────────────

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 border-b border-gray-200 pb-3 text-lg font-bold tracking-tight text-black">{title}</h2>
            <div className="space-y-3 text-sm leading-7 text-gray-600">
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
        info: 'border-gray-200 bg-gray-50 text-gray-600',
        warning: 'border-amber-200 bg-amber-50 text-amber-800',
        danger: 'border-black bg-black text-white',
    }[type];

    return (
        <div className={`rounded-lg border px-4 py-3 text-sm leading-7 shadow-sm ${styles}`}>
            {children}
        </div>
    );
}
