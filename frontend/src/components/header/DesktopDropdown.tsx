import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { NavGroup } from './headerNavConfig';

export function DesktopDropdown({ group, isActive, onToggle }: {
    group: NavGroup;
    isActive: boolean;
    onToggle: (id: string | null) => void;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isActive) return;
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onToggle(null);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isActive, onToggle]);

    useEffect(() => {
        if (!isActive) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onToggle(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isActive, onToggle]);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => onToggle(isActive ? null : group.id)}
                className={cn(
                    'flex min-h-[44px] items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                        ? 'text-black bg-gray-50'
                        : 'text-gray-600 hover:text-black hover:bg-gray-50'
                )}
                aria-expanded={isActive}
                aria-haspopup="true"
            >
                {group.label}
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', isActive && 'rotate-180')} />
            </button>

            {isActive && (
                <div className="absolute left-0 top-full mt-2 min-w-[16rem] rounded-lg border border-gray-200 bg-white shadow-xl shadow-black/5 ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {group.children.map((child) => (
                        <Link
                            key={child.to}
                            to={child.to}
                            onClick={() => onToggle(null)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group"
                        >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-600 group-hover:bg-black/5 transition-colors">
                                {child.icon}
                            </span>
                            <div className="text-sm font-semibold text-gray-900">{child.label}</div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
