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
            <div className="text-gray-600 mb-4 group-hover:text-white">{icon}</div>
            <h4
                className={`text-sm font-black tracking-tight mb-2 group-hover:text-white ${uppercaseTitle ? 'uppercase' : ''}`}
            >
                {title}
            </h4>
            <p className="text-xs text-gray-600 mb-6 flex-1 group-hover:text-gray-300">{description}</p>
            <span className="text-black text-[10px] font-bold tracking-widest uppercase group-hover:text-white transition-colors inline-block border-b-2 border-black group-hover:border-white pb-1 w-fit">
                Truy cập
            </span>
        </>
    );

    const className = 'card flex flex-col group border-black hover:bg-black hover:text-white transition-colors';

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
