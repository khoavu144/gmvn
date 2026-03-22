import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

type Props = {
    label: string;
    path: string;
};

/** Shared strip for coach/athlete public profile preview on dashboards */
export default function DashboardPublicProfileBanner({ label, path }: Props) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = `${origin}${path}`;

    return (
        <div className="flex flex-col gap-3 rounded-lg bg-gray-900 px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500">{label}</p>
                <p className="truncate text-sm font-bold">{fullUrl}</p>
            </div>
            <Link
                to={path}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-sm bg-white px-4 py-2 text-xs font-bold text-black hover:bg-gray-50"
            >
                <Eye className="h-3.5 w-3.5" aria-hidden />
                Xem trang công khai
            </Link>
        </div>
    );
}
