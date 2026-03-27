import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, LayoutDashboard, MessageSquare, UserCog, Dumbbell, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { NavGroup } from './headerNavConfig';

function MobileAccordion({ group, isOpen, onToggle, onClose }: {
    group: NavGroup;
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
}) {
    return (
        <div className="border-b border-gray-200 last:border-0">
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold text-gray-900"
                aria-expanded={isOpen}
            >
                <span className="flex items-center gap-2.5">
                    <span className="text-gray-500">{group.icon}</span>
                    {group.label}
                </span>
                <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform duration-200', isOpen && 'rotate-180')} />
            </button>

            {isOpen && (
                <div className="pb-2 space-y-0.5 bg-gray-50/60">
                    {group.children.map((child) => (
                        <Link
                            key={child.to}
                            to={child.to}
                            onClick={onClose}
                            className="flex items-center justify-between px-4 py-3 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors ml-6 border-l border-gray-200 pl-6"
                        >
                            <span className="flex items-center gap-2.5">
                                <span className="text-gray-500">{child.icon}</span>
                                {child.label}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

interface MobileMenuDrawerProps {
    mobileMenuRef: React.RefObject<HTMLDivElement | null>;
    publicNav: NavGroup[];
    mobileOpenGroup: string | null;
    setMobileOpenGroup: React.Dispatch<React.SetStateAction<string | null>>;
    setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isAuthenticated: boolean;
    user: { user_type: string } | null;
    handleLogout: () => void;
}

export function MobileMenuDrawer({
    mobileMenuRef,
    publicNav,
    mobileOpenGroup,
    setMobileOpenGroup,
    setMobileOpen,
    isAuthenticated,
    user,
    handleLogout
}: MobileMenuDrawerProps) {
    return (
        <div
            id="mobile-menu"
            ref={mobileMenuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng"
            className="lg:hidden fixed inset-0 top-header z-modal bg-white overflow-y-auto"
        >
            {/* Public nav groups (Accordion) */}
            <div className="mt-2">
                {publicNav.map((group) => (
                    <MobileAccordion
                        key={group.id}
                        group={group}
                        isOpen={mobileOpenGroup === group.id}
                        onToggle={() => setMobileOpenGroup((v) => (v === group.id ? null : group.id))}
                        onClose={() => setMobileOpen(false)}
                    />
                ))}
            </div>

            {/* Authenticated quick links */}
            {isAuthenticated && user ? (
                <div className="mt-2 border-t border-gray-200 pt-3">
                    <div className="px-4 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Của Tôi</p>
                    </div>
                    <Link to={user.user_type === 'gym_owner' ? '/gym-owner' : '/dashboard'} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                        <LayoutDashboard className="w-4 h-4 text-gray-500" />
                        {user.user_type === 'gym_owner' ? 'Quản lý Gym' : 'Dashboard'}
                        <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                    </Link>
                    <Link to="/messages" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        Tin nhắn
                        <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                    </Link>
                    <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                        <UserCog className="w-4 h-4 text-gray-500" />
                        Hồ sơ cá nhân
                        <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                    </Link>
                    {user.user_type === 'athlete' && (
                        <Link to="/workouts" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                            <Dumbbell className="w-4 h-4 text-gray-500" />
                            Lịch Tập
                            <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                        </Link>
                    )}
                    <div className="mt-2 px-4 pb-4 border-t border-gray-200 pt-3">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 py-2.5 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Đăng xuất
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mt-2 border-t border-gray-200 p-4 space-y-3">
                    <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex w-full items-center justify-center rounded-lg border border-gray-200 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                        Đăng nhập
                    </Link>
                    <Link
                        to="/register"
                        onClick={() => setMobileOpen(false)}
                        className="flex w-full items-center justify-center rounded-lg bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
                    >
                        Đăng ký miễn phí
                    </Link>
                </div>
            )}

            <div className="px-4 py-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">GYMERVIET — Hệ sinh thái Thể thao Số 1 Việt Nam</p>
            </div>
        </div>
    );
}
