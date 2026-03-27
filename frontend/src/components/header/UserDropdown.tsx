import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, UserCog, MessageSquare, Calendar, Dumbbell, ShieldCheck, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';

export function UserDropdown({ user, onLogout, isActive, onToggle }: {
    user: { full_name: string; user_type: string; avatar_url?: string | null };
    onLogout: () => void;
    isActive: boolean;
    onToggle: () => void;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isActive) return;
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onToggle();
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isActive, onToggle]);

    useEffect(() => {
        if (!isActive) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onToggle();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isActive, onToggle]);

    const dashboardLink = user.user_type === 'gym_owner' ? '/gym-owner' : '/dashboard';
    const roleLabel: Record<string, string> = {
        trainer: 'Coach',
        athlete: 'Vận động viên',
        gym_owner: 'Chủ phòng tập',
        admin: 'Admin',
        user: 'Thành viên',
    };

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={onToggle}
                className={cn(
                    'flex min-h-[44px] items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-colors text-sm',
                    isActive
                        ? 'border-gray-200 bg-gray-50'
                        : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                )}
                aria-expanded={isActive}
            >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white text-xs font-bold shrink-0">
                    {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden xl:block">
                    <div className="font-semibold text-gray-900 leading-tight max-w-[120px] truncate">{user.full_name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 leading-tight">
                        {roleLabel[user.user_type] || user.user_type}
                    </div>
                </div>
                <ChevronDown className={cn('w-3.5 h-3.5 text-gray-500 transition-transform duration-200', isActive && 'rotate-180')} />
            </button>

            {isActive && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-xl shadow-black/5 ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-gray-200">
                        <div className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{roleLabel[user.user_type] || user.user_type}</div>
                    </div>

                    <div className="py-1">
                        <Link to={dashboardLink} onClick={onToggle} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors">
                            <LayoutDashboard className="w-4 h-4 text-gray-500" />
                            {user.user_type === 'gym_owner' ? 'Quản lý Phòng Tập' : 'Dashboard'}
                        </Link>
                        <Link to="/profile" onClick={onToggle} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors">
                            <UserCog className="w-4 h-4 text-gray-500" />
                            Cài đặt Hồ sơ
                        </Link>
                        <Link to="/messages" onClick={onToggle} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors">
                            <MessageSquare className="w-4 h-4 text-gray-500" />
                            Tin nhắn
                        </Link>
                        {(user.user_type === 'trainer' || user.user_type === 'athlete') && (
                            <Link to="/programs" onClick={onToggle} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                Khóa học
                            </Link>
                        )}
                        {user.user_type === 'athlete' && (
                            <Link to="/workouts" onClick={onToggle} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors">
                                <Dumbbell className="w-4 h-4 text-gray-500" />
                                Lịch Tập
                            </Link>
                        )}
                        {user.user_type === 'admin' && (
                            <Link to="/dashboard" onClick={onToggle} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors">
                                <ShieldCheck className="w-4 h-4 text-gray-500" />
                                Admin Panel
                            </Link>
                        )}
                    </div>

                    <div className="border-t border-gray-200 py-1">
                        <button
                            type="button"
                            onClick={onLogout}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Đăng xuất
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
