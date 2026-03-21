import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Menu, X, LogOut, ChevronDown, ChevronRight,
    Dumbbell, Users, ShoppingBag, Newspaper, Image as ImageIcon,
    LayoutDashboard, MessageSquare, Calendar, User, UserCog,
    ShieldCheck
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store/store';
import { authApi } from '../services/auth';
import NotificationBell from './NotificationBell';
import { cn } from '../lib/utils';

// ─── Nav Structure ───────────────────────────────────────────────────────────

interface NavChild {
    to: string;
    label: string;
    description?: string;
    icon: React.ReactNode;
}

interface NavGroup {
    id: string;
    label: string;
    icon: React.ReactNode;
    children: NavChild[];
}

const PUBLIC_NAV: NavGroup[] = [
    {
        id: 'explore',
        label: 'Khám Phá',
        icon: <Dumbbell className="w-4 h-4" />,
        children: [
            { to: '/gyms', label: 'Phòng Tập', description: 'Tìm gym center phù hợp gần bạn', icon: <Dumbbell className="w-4 h-4" /> },
            { to: '/coaches', label: 'Huấn Luyện Viên', description: 'Kết nối với coach chuyên nghiệp', icon: <Users className="w-4 h-4" /> },
            { to: '/coaches?type=athlete', label: 'Vận Động Viên', description: 'Hồ sơ VĐV đang hoạt động', icon: <User className="w-4 h-4" /> },
        ],
    },
    {
        id: 'community',
        label: 'Cộng Đồng',
        icon: <ImageIcon className="w-4 h-4" />,
        children: [
            { to: '/news', label: 'Tin Tức', description: 'Kiến thức và tin tức thể hình mới nhất', icon: <Newspaper className="w-4 h-4" /> },
            { to: '/gallery', label: 'Community Gallery', description: 'Khoảnh khắc từ cộng đồng tập luyện', icon: <ImageIcon className="w-4 h-4" /> },
        ],
    },
    {
        id: 'shop',
        label: 'Cửa Hàng',
        icon: <ShoppingBag className="w-4 h-4" />,
        children: [
            { to: '/marketplace', label: 'Marketplace', description: 'Thực phẩm bổ sung, phụ kiện, trang phục thể thao', icon: <ShoppingBag className="w-4 h-4" /> },
        ],
    },
];

// ─── Dropdown (Desktop) ───────────────────────────────────────────────────────

function DesktopDropdown({ group, isActive, onToggle }: {
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

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => onToggle(isActive ? null : group.id)}
                className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                        ? 'text-black bg-[color:var(--mk-paper)]'
                        : 'text-[color:var(--mk-text-soft)] hover:text-black hover:bg-[color:var(--mk-paper)]'
                )}
                aria-expanded={isActive}
                aria-haspopup="true"
            >
                {group.label}
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', isActive && 'rotate-180')} />
            </button>

            {isActive && (
                <div className="absolute left-0 top-full mt-2 min-w-[16rem] rounded-lg border border-[color:var(--mk-line)] bg-white shadow-xl shadow-black/5 ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {group.children.map((child) => (
                        <Link
                            key={child.to}
                            to={child.to}
                            onClick={() => onToggle(null)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-[color:var(--mk-paper)] transition-colors group"
                        >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--mk-paper)] text-[color:var(--mk-text-soft)] group-hover:bg-black/5 transition-colors">
                                {child.icon}
                            </span>
                            <div className="text-sm font-semibold text-[color:var(--mk-text)]">{child.label}</div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Accordion Item (Mobile) ─────────────────────────────────────────────────

function MobileAccordion({ group, isOpen, onToggle, onClose }: {
    group: NavGroup;
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
}) {
    return (
        <div className="border-b border-[color:var(--mk-line)] last:border-0">
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold text-[color:var(--mk-text)]"
                aria-expanded={isOpen}
            >
                <span className="flex items-center gap-2.5">
                    <span className="text-[color:var(--mk-muted)]">{group.icon}</span>
                    {group.label}
                </span>
                <ChevronDown className={cn('w-4 h-4 text-[color:var(--mk-muted)] transition-transform duration-200', isOpen && 'rotate-180')} />
            </button>

            {isOpen && (
                <div className="pb-2 space-y-0.5 bg-[color:var(--mk-paper)]/60">
                    {group.children.map((child) => (
                        <Link
                            key={child.to}
                            to={child.to}
                            onClick={onClose}
                            className="flex items-center justify-between px-4 py-3 text-sm text-[color:var(--mk-text-soft)] hover:text-black hover:bg-[color:var(--mk-paper)] transition-colors ml-6 border-l border-[color:var(--mk-line)] pl-6"
                        >
                            <span className="flex items-center gap-2.5">
                                <span className="text-[color:var(--mk-muted)]">{child.icon}</span>
                                {child.label}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-[color:var(--mk-muted)]" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── User Menu (Desktop) ─────────────────────────────────────────────────────

function UserDropdown({ user, onLogout, isActive, onToggle }: {
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
                    'flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-colors text-sm',
                    isActive
                        ? 'border-[color:var(--mk-line)] bg-[color:var(--mk-paper)]'
                        : 'border-transparent hover:border-[color:var(--mk-line)] hover:bg-[color:var(--mk-paper)]'
                )}
                aria-expanded={isActive}
            >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white text-xs font-bold shrink-0">
                    {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden xl:block">
                    <div className="font-semibold text-[color:var(--mk-text)] leading-tight max-w-[120px] truncate">{user.full_name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-[color:var(--mk-muted)] leading-tight">
                        {roleLabel[user.user_type] || user.user_type}
                    </div>
                </div>
                <ChevronDown className={cn('w-3.5 h-3.5 text-[color:var(--mk-muted)] transition-transform duration-200', isActive && 'rotate-180')} />
            </button>

            {isActive && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-[color:var(--mk-line)] bg-white shadow-xl shadow-black/5 ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-[color:var(--mk-line)]">
                        <div className="text-sm font-semibold text-[color:var(--mk-text)] truncate">{user.full_name}</div>
                        <div className="text-[11px] text-[color:var(--mk-muted)] mt-0.5">{roleLabel[user.user_type] || user.user_type}</div>
                    </div>

                    <div className="py-1">
                        <Link to={dashboardLink} onClick={onToggle} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[color:var(--mk-text-soft)] hover:bg-[color:var(--mk-paper)] hover:text-black transition-colors">
                            <LayoutDashboard className="w-4 h-4 text-[color:var(--mk-muted)]" />
                            {user.user_type === 'gym_owner' ? 'Quản lý Phòng Tập' : 'Dashboard'}
                        </Link>
                        <Link to="/profile" onClick={onToggle} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[color:var(--mk-text-soft)] hover:bg-[color:var(--mk-paper)] hover:text-black transition-colors">
                            <UserCog className="w-4 h-4 text-[color:var(--mk-muted)]" />
                            Cài đặt Hồ sơ
                        </Link>
                        <Link to="/messages" onClick={onToggle} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[color:var(--mk-text-soft)] hover:bg-[color:var(--mk-paper)] hover:text-black transition-colors">
                            <MessageSquare className="w-4 h-4 text-[color:var(--mk-muted)]" />
                            Tin nhắn
                        </Link>
                        {(user.user_type === 'trainer' || user.user_type === 'athlete') && (
                            <Link to="/programs" onClick={onToggle} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[color:var(--mk-text-soft)] hover:bg-[color:var(--mk-paper)] hover:text-black transition-colors">
                                <Calendar className="w-4 h-4 text-[color:var(--mk-muted)]" />
                                Khóa học
                            </Link>
                        )}
                        {user.user_type === 'athlete' && (
                            <Link to="/workouts" onClick={onToggle} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[color:var(--mk-text-soft)] hover:bg-[color:var(--mk-paper)] hover:text-black transition-colors">
                                <Dumbbell className="w-4 h-4 text-[color:var(--mk-muted)]" />
                                Lịch Tập
                            </Link>
                        )}
                        {user.user_type === 'admin' && (
                            <Link to="/dashboard" onClick={onToggle} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[color:var(--mk-text-soft)] hover:bg-[color:var(--mk-paper)] hover:text-black transition-colors">
                                <ShieldCheck className="w-4 h-4 text-[color:var(--mk-muted)]" />
                                Admin Panel
                            </Link>
                        )}
                    </div>

                    <div className="border-t border-[color:var(--mk-line)] py-1">
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

// ─── Main Header ─────────────────────────────────────────────────────────────

export default function Header() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileOpenGroup, setMobileOpenGroup] = useState<string | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    const lastScrollY = useRef(0);
    const scrollRaf = useRef<number | null>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    const { isAuthenticated, user, refreshToken } = useSelector((state: RootState) => state.auth);

    // Close everything when route changes
    useEffect(() => {
        setMobileOpen(false);
        setActiveDropdown(null);
        setUserMenuOpen(false);
        setMobileOpenGroup(null);
    }, [location.pathname]);

    // Scroll hide/show
    useEffect(() => {
        lastScrollY.current = window.scrollY;
        const handleScroll = () => {
            if (scrollRaf.current !== null) return;
            scrollRaf.current = requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                    setIsHidden(true);
                } else if (currentScrollY < lastScrollY.current) {
                    setIsHidden(false);
                }
                lastScrollY.current = currentScrollY;
                scrollRaf.current = null;
            });
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollRaf.current !== null) cancelAnimationFrame(scrollRaf.current);
        };
    }, []);

    // Mobile menu body scroll lock + Escape key
    useEffect(() => {
        if (!mobileOpen) return;
        document.body.style.overflow = 'hidden';
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMobileOpen(false);
        };
        document.addEventListener('keydown', handleKey);
        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKey);
        };
    }, [mobileOpen]);

    const handleLogout = useCallback(async () => {
        try {
            await authApi.logout(refreshToken || localStorage.getItem('refresh_token') || undefined);
        } catch { /* silent */ } finally {
            dispatch(logout());
            setMobileOpen(false);
            navigate('/login');
        }
    }, [dispatch, navigate, refreshToken]);

    const handleDropdownToggle = useCallback((id: string | null) => {
        setActiveDropdown((prev) => (prev === id ? null : id));
        setUserMenuOpen(false);
    }, []);

    const handleUserMenuToggle = useCallback(() => {
        setUserMenuOpen((prev) => !prev);
        setActiveDropdown(null);
    }, []);

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-header h-header',
                'bg-white/95 backdrop-blur-sm',
                'border-b border-[color:var(--mk-line)]',
                'transition-transform duration-150',
                isHidden && '-translate-y-full'
            )}
        >
            <div className="max-w-page mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">

                {/* Logo */}
                <Link to="/" className="flex items-center shrink-0" aria-label="GYMERVIET - Trang chủ">
                    <img
                        src="/logo.png"
                        alt="GYMERVIET"
                        className="h-8 sm:h-9 w-auto object-contain"
                        decoding="async"
                        fetchPriority="high"
                    />
                </Link>

                {/* Desktop Nav — Mega Menu Groups */}
                <nav className="hidden lg:flex items-center gap-1" aria-label="Điều hướng chính">
                    {PUBLIC_NAV.map((group) => (
                        <DesktopDropdown
                            key={group.id}
                            group={group}
                            isActive={activeDropdown === group.id}
                            onToggle={handleDropdownToggle}
                        />
                    ))}
                </nav>

                {/* Right side */}
                <div className="flex items-center gap-1 sm:gap-2">
                    <Link
                        to="/cart"
                        className="relative p-2 text-[color:var(--mk-text-soft)] hover:text-black hover:bg-[color:var(--mk-paper)] rounded-full transition-colors"
                        aria-label="Giỏ hàng"
                    >
                        <ShoppingBag className="w-5 h-5" />
                    </Link>
                    <NotificationBell />

                    {isAuthenticated && user ? (
                        <UserDropdown
                            user={user}
                            onLogout={handleLogout}
                            isActive={userMenuOpen}
                            onToggle={handleUserMenuToggle}
                        />
                    ) : (
                        <div className="hidden lg:flex items-center gap-2">
                            <Link
                                to="/login"
                                className="text-sm font-medium text-[color:var(--mk-text-soft)] hover:text-black transition-colors px-3 py-1.5"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/register"
                                className="text-sm font-semibold px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                Đăng ký
                            </Link>
                        </div>
                    )}

                    {/* Mobile toggle */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen((v) => !v)}
                        className="lg:hidden p-2 text-[color:var(--mk-text-soft)] hover:text-black transition-colors rounded-lg hover:bg-[color:var(--mk-paper)]"
                        aria-label="Mở menu"
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-menu"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {mobileOpen && (
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
                        {PUBLIC_NAV.map((group) => (
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
                        <div className="mt-2 border-t border-[color:var(--mk-line)] pt-3">
                            <div className="px-4 py-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--mk-muted)]">Của Tôi</p>
                            </div>
                            <Link to={user.user_type === 'gym_owner' ? '/gym-owner' : '/dashboard'} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[color:var(--mk-text)] hover:bg-[color:var(--mk-paper)] transition-colors">
                                <LayoutDashboard className="w-4 h-4 text-[color:var(--mk-muted)]" />
                                {user.user_type === 'gym_owner' ? 'Quản lý Gym' : 'Dashboard'}
                                <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                            </Link>
                            <Link to="/messages" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[color:var(--mk-text)] hover:bg-[color:var(--mk-paper)] transition-colors">
                                <MessageSquare className="w-4 h-4 text-[color:var(--mk-muted)]" />
                                Tin nhắn
                                <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                            </Link>
                            <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[color:var(--mk-text)] hover:bg-[color:var(--mk-paper)] transition-colors">
                                <UserCog className="w-4 h-4 text-[color:var(--mk-muted)]" />
                                Hồ sơ cá nhân
                                <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                            </Link>
                            {user.user_type === 'athlete' && (
                                <Link to="/workouts" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[color:var(--mk-text)] hover:bg-[color:var(--mk-paper)] transition-colors">
                                    <Dumbbell className="w-4 h-4 text-[color:var(--mk-muted)]" />
                                    Lịch Tập
                                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                                </Link>
                            )}
                            <div className="mt-2 px-4 pb-4 border-t border-[color:var(--mk-line)] pt-3">
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
                        <div className="mt-2 border-t border-[color:var(--mk-line)] p-4 space-y-3">
                            <Link
                                to="/login"
                                onClick={() => setMobileOpen(false)}
                                className="flex w-full items-center justify-center rounded-lg border border-[color:var(--mk-line)] py-3 text-sm font-semibold text-[color:var(--mk-text)] hover:bg-[color:var(--mk-paper)] transition-colors"
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

                    <div className="px-4 py-6 border-t border-[color:var(--mk-line)]">
                        <p className="text-xs text-[color:var(--mk-muted)]">GYMERVIET — Hệ sinh thái Thể thao Số 1 Việt Nam</p>
                    </div>
                </div>
            )}
        </header>
    );
}