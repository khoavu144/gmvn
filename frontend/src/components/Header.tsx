import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Menu, X, User, LogOut,
    Dumbbell, Calendar, MessageSquare, Image as ImageIcon, ChevronRight
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store/store';
import { authApi } from '../services/auth';
import NotificationBell from './NotificationBell';
import { cn } from '../lib/utils';

export default function Header() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [, setIsScrolled] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    const lastScrollY = useRef(0);
    const scrollRaf = useRef<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const { isAuthenticated, user, refreshToken } = useSelector((state: RootState) => state.auth);

    // Scroll behavior: hide on scroll down, show on scroll up
    useEffect(() => {
        lastScrollY.current = window.scrollY;

        const handleScroll = () => {
            if (scrollRaf.current !== null) return;

            scrollRaf.current = requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;

                // Add backdrop when scrolled
                setIsScrolled(currentScrollY > 10);

                // Hide/show header based on scroll direction
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
            if (scrollRaf.current !== null) {
                cancelAnimationFrame(scrollRaf.current);
            }
        };
    }, []);

    // Mobile menu accessibility & body scroll lock
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';

            if (menuRef.current) {
                const focusable = menuRef.current.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
                if (focusable) setTimeout(() => focusable.focus(), 50);
            }

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') closeMenu();
            };
            document.addEventListener('keydown', handleKeyDown);

            return () => {
                document.body.style.overflow = '';
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isMenuOpen]);

    const handleLogout = async () => {
        try {
            await authApi.logout(refreshToken || localStorage.getItem('refresh_token') || undefined);
        } catch {
            // Keep client-side logout resilient even when the session is already invalid.
        } finally {
            dispatch(logout());
            setIsMenuOpen(false);
            navigate('/login');
        }
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-header h-header',
                'bg-white',
                'border-b border-gray-200',
                'transition-transform duration-150',
                isHidden && '-translate-y-full'
            )}
        >
            <div className="max-w-page mx-auto px-4 sm:px-6 h-full flex justify-between items-center">
                {/* Logo */}
                <Link to="/" onClick={closeMenu} className="flex items-center shrink-0">
                    <img
                        src="/logo.png"
                        alt="GYMERVIET"
                        className="h-8 sm:h-9 w-auto object-contain"
                        decoding="async"
                        fetchPriority="high"
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-1">
                    <Link to="/coaches" className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-3 py-2 rounded-sm">
                        Coach
                    </Link>
                    <Link to="/gallery" className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-3 py-2 rounded-sm">
                        Gallery
                    </Link>
                    <Link
                        to="/gyms"
                        className="text-sm font-semibold px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-sm transition-colors"
                    >
                        Gym Center
                    </Link>
                    <Link to="/coaches?type=athlete" className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-3 py-2 rounded-sm">
                        Vận động viên
                    </Link>
                    {isAuthenticated && (
                        <>
                            {(user?.user_type === 'trainer' || user?.user_type === 'athlete') && (
                                <Link to="/programs" className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-3 py-2 rounded-sm">
                                    Khóa học
                                </Link>
                            )}
                            {user?.user_type === 'athlete' && (
                                <Link to="/workouts" className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-3 py-2 rounded-sm">
                                    Lịch tập
                                </Link>
                            )}
                            <Link to="/messages" className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-3 py-2 rounded-sm">
                                Tin nhắn
                            </Link>
                        </>
                    )}
                </nav>

                {/* Right side */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <NotificationBell />

                    {isAuthenticated && user ? (
                        <div className="hidden lg:flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">{user.full_name}</p>
                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                                    {user.user_type === 'trainer' ? 'COACH' : user.user_type === 'athlete' ? 'VĐV' : user.user_type === 'gym_owner' ? 'CHỦ GYM' : 'USER'}
                                </p>
                            </div>
                            <div className="h-6 w-px bg-gray-200" />
                            <Link
                                to={user.user_type === 'gym_owner' ? '/gym-owner' : '/dashboard'}
                                className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                            >
                                {user.user_type === 'gym_owner' ? 'Quản lý Gym' : 'Cá nhân'}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-gray-500 hover:text-black transition-colors flex items-center gap-1"
                            >
                                <LogOut className="w-4 h-4" />
                                Thoát
                            </button>
                        </div>
                    ) : (
                        <div className="hidden lg:flex items-center gap-2">
                            <Link
                                to="/login"
                                className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-3 py-1.5"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/register"
                                className="text-sm font-medium px-4 py-2 bg-black text-white hover:bg-gray-800 rounded transition-colors"
                            >
                                Đăng ký
                            </Link>
                        </div>
                    )}

                    {/* Mobile menu toggle */}
                    <button
                        onClick={toggleMenu}
                        className="lg:hidden p-2 text-gray-700 hover:text-black transition-colors"
                        aria-label="Toggle menu"
                        aria-expanded={isMenuOpen}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div
                    ref={menuRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Mobile navigation"
                    className="lg:hidden fixed inset-0 top-header bg-white z-modal overflow-y-auto"
                >
                    <nav className="p-4 space-y-1">
                        <MobileNavItem to="/coaches" onClick={closeMenu}>
                            <User className="w-5 h-5" />
                            Coach
                        </MobileNavItem>
                        <MobileNavItem to="/gallery" onClick={closeMenu}>
                            <ImageIcon className="w-5 h-5" />
                            Gallery
                        </MobileNavItem>
                        <MobileNavItem to="/gyms" onClick={closeMenu} highlight>
                            <Dumbbell className="w-5 h-5" />
                            Gym Center
                        </MobileNavItem>
                        <MobileNavItem to="/coaches?type=athlete" onClick={closeMenu}>
                            <User className="w-5 h-5" />
                            Vận động viên
                        </MobileNavItem>

                        {isAuthenticated ? (
                            <>
                                <div className="h-px bg-gray-200 my-3" />
                                <MobileNavItem to={user?.user_type === 'gym_owner' ? '/gym-owner' : '/dashboard'} onClick={closeMenu}>
                                    {user?.user_type === 'gym_owner' ? 'Quản lý Gym' : 'Dashboard'}
                                </MobileNavItem>
                                {(user?.user_type === 'trainer' || user?.user_type === 'athlete') && (
                                    <MobileNavItem to="/programs" onClick={closeMenu}>
                                        Khóa học
                                    </MobileNavItem>
                                )}
                                {user?.user_type === 'athlete' && (
                                    <MobileNavItem to="/workouts" onClick={closeMenu}>
                                        <Calendar className="w-5 h-5" />
                                        Lịch tập
                                    </MobileNavItem>
                                )}
                                <MobileNavItem to="/messages" onClick={closeMenu}>
                                    <MessageSquare className="w-5 h-5" />
                                    Tin nhắn
                                </MobileNavItem>
                                <MobileNavItem to="/profile" onClick={closeMenu}>
                                    Hồ sơ
                                </MobileNavItem>
                                <div className="h-px bg-gray-200 my-3" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-between px-4 py-3 text-red-600 font-medium"
                                >
                                    <span className="flex items-center gap-3">
                                        <LogOut className="w-5 h-5" />
                                        Đăng xuất
                                    </span>
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="h-px bg-gray-200 my-3" />
                                <MobileNavItem to="/login" onClick={closeMenu}>
                                    Đăng nhập
                                </MobileNavItem>
                                <MobileNavItem to="/register" onClick={closeMenu} highlight>
                                    Đăng ký thành viên
                                </MobileNavItem>
                            </>
                        )}
                    </nav>

                    <div className="p-4 border-t border-gray-200">
                        <p className="text-xs text-gray-400 italic">
                            GYMERVIET — Hệ sinh thái Gym & Coach số 1 VN
                        </p>
                    </div>
                </div>
            )}
        </header>
    );
}

// Mobile nav item component
function MobileNavItem({
    to,
    onClick,
    highlight,
    children,
}: {
    to: string;
    onClick: () => void;
    highlight?: boolean;
    children: React.ReactNode;
}) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className={cn(
                'flex items-center justify-between px-4 py-3 rounded-lg transition-colors',
                highlight
                    ? 'bg-black text-white font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
            )}
        >
            <span className="flex items-center gap-3">{children}</span>
            <ChevronRight className="w-4 h-4 opacity-50" />
        </Link>
    );
}