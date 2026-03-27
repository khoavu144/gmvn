import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X, ShoppingBag } from 'lucide-react';

import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store/store';
import { authApi } from '../services/auth';

import NotificationBell from './NotificationBell';
import { cn } from '../lib/utils';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useMobileReducedEffects } from '../hooks/useMobileReducedEffects';
import { useScrollDirection } from '../hooks/useScrollDirection';

import { PUBLIC_NAV } from './header/headerNavConfig';
import { DesktopDropdown } from './header/DesktopDropdown';
import { UserDropdown } from './header/UserDropdown';
import { MobileMenuDrawer } from './header/MobileMenuDrawer';

export default function Header() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileOpenGroup, setMobileOpenGroup] = useState<string | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const reducedEffects = useMobileReducedEffects();
    const isHidden = useScrollDirection();
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    const { isAuthenticated, user, refreshToken } = useSelector((state: RootState) => state.auth);
    useBodyScrollLock('header-mobile-menu', mobileOpen);

    // Close everything when route changes
    useEffect(() => {
        setMobileOpen(false);
        setActiveDropdown(null);
        setUserMenuOpen(false);
        setMobileOpenGroup(null);
    }, [location.pathname]);

    // Mobile menu escape key
    useEffect(() => {
        if (!mobileOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMobileOpen(false);
        };
        document.addEventListener('keydown', handleKey);
        return () => {
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
                reducedEffects ? 'bg-white/98' : 'bg-white/95 backdrop-blur-sm',
                'border-b border-gray-200',
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
                        width={260}
                        height={72}
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
                        className="relative p-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded-full transition-colors"
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
                                className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-3 py-1.5"
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
                        className="lg:hidden p-2 text-gray-600 hover:text-black transition-colors rounded-lg hover:bg-gray-50"
                        aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-menu"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {mobileOpen && (
                <MobileMenuDrawer
                    mobileMenuRef={mobileMenuRef}
                    publicNav={PUBLIC_NAV}
                    mobileOpenGroup={mobileOpenGroup}
                    setMobileOpenGroup={setMobileOpenGroup}
                    setMobileOpen={setMobileOpen}
                    isAuthenticated={isAuthenticated}
                    user={user}
                    handleLogout={handleLogout}
                />
            )}
        </header>
    );
}
