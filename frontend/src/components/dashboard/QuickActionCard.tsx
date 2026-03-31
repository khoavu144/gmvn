import { Link } from 'react-router-dom';

interface QuickActionCardProps {
    to?: string;
    onClick?: () => void;
    icon: React.ReactNode;
    title: string;
    description: string;
    /** Default true (legacy dashboards). Set false for sentence-case admin titles. */
    uppercaseTitle?: boolean;
}

/**
 * Reusable quick-action card used across all Dashboard role views.
 * Supports both Link (navigation) and button (tab-switch) modes.
 */
export default function QuickActionCard({
    to,
    onClick,
    icon,
    title,
    description,
    uppercaseTitle = true,
}: QuickActionCardProps) {
    const content = (
        <>
            <div className="text-gray-500 mb-4 group-hover:text-gray-900 transition-colors">{icon}</div>
            <h4
                className={`text-sm font-black tracking-tight mb-2 text-gray-900 ${uppercaseTitle ? 'uppercase' : ''}`}
            >
                {title}
            </h4>
            <p className="text-xs text-gray-500 mb-6 flex-1">{description}</p>
            <span className="text-black text-xs font-bold tracking-widest uppercase inline-block border-b-2 border-black pb-1 w-fit">
                Truy cập
            </span>
        </>
    );

    const className = 'card flex flex-col group border-gray-200 hover:border-gray-900 hover:shadow-md transition-all duration-150';

    if (onClick && !to) {
        return (
            <button onClick={onClick} className={`${className} text-left`}>
                {content}
            </button>
        );
    }

    return (
        <Link to={to || '#'} className={className} onClick={onClick}>
            {content}
        </Link>
    );
}
