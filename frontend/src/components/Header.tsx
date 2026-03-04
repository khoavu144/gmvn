import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store/store';

export default function Header() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );
    const user = useSelector((state: RootState) => state.auth.user);

    const handleLogout = () => {
        dispatch(logout());
        setIsMenuOpen(false);
        navigate('/login');
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-[60]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex justify-between items-center">
                <Link to="/" onClick={closeMenu} className="flex items-center">
                    <img src="/logo.png" alt="GYMERVIET" className="h-8 sm:h-10 object-contain" />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    <Link to="/trainers" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">HLV & PT</Link>
                    {isAuthenticated && (
                        <>
                            <Link to="/programs" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Khóa học</Link>
                            {user?.user_type === 'athlete' && (
                                <Link to="/workouts" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Lịch tập</Link>
                            )}
                            <Link to="/messages" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Tin nhắn</Link>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    {isAuthenticated && user ? (
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-medium text-black line-clamp-1">
                                    {user.full_name}
                                </span>
                                <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                    {user.user_type === 'trainer' ? 'HLV' : user.user_type === 'athlete' ? 'VĐV' : 'USER'}
                                </span>
                            </div>
                            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
                            <Link to="/dashboard" className="hidden sm:block btn-secondary text-sm px-3 py-1.5">
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="hidden md:block text-sm text-gray-500 hover:text-black transition-colors"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Link to="/login" className="btn-tertiary text-sm whitespace-nowrap">
                                Đăng nhập
                            </Link>
                            <Link to="/register" className="btn-primary text-sm whitespace-nowrap">
                                Đăng ký
                            </Link>
                        </div>
                    )}

                    {/* Hamburger Toggle */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden p-2 text-black focus:outline-none"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <span className="text-2xl font-mono">✕</span>
                        ) : (
                            <span className="text-2xl">☰</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 top-14 bg-white z-[50] flex flex-col p-6 animate-fade-in">
                    <nav className="flex flex-col gap-6">
                        <Link to="/trainers" onClick={closeMenu} className="text-lg font-bold text-black border-b border-gray-100 pb-2">Khám phá HLV</Link>

                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" onClick={closeMenu} className="text-lg font-bold text-black border-b border-gray-100 pb-2">Dashboard</Link>
                                <Link to="/programs" onClick={closeMenu} className="text-lg font-bold text-black border-b border-gray-100 pb-2">Khóa học & Giáo án</Link>
                                {user?.user_type === 'athlete' && (
                                    <Link to="/workouts" onClick={closeMenu} className="text-lg font-bold text-black border-b border-gray-100 pb-2">Lịch tập cá nhân</Link>
                                )}
                                <Link to="/messages" onClick={closeMenu} className="text-lg font-bold text-black border-b border-gray-100 pb-2">Tin nhắn</Link>
                                <Link to="/profile" onClick={closeMenu} className="text-lg font-bold text-black border-b border-gray-100 pb-2">Hồ sơ cá nhân</Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-lg font-bold text-gray-500 text-left"
                                >
                                    Đăng xuất
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={closeMenu} className="text-lg font-bold text-black border-b border-gray-100 pb-2">Đăng nhập</Link>
                                <Link to="/register" onClick={closeMenu} className="text-lg font-bold text-black">Đăng ký thành viên</Link>
                            </>
                        )}
                    </nav>

                    <div className="mt-auto pt-10 border-t border-gray-100 italic text-sm text-gray-400">
                        GYMERVIET — Verified Fitness Profile
                    </div>
                </div>
            )}
        </header>
    );
}

