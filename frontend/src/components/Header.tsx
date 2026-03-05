import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store/store';
import NotificationBell from './NotificationBell';

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
                <div className="hidden lg:flex items-center gap-6">
                    <Link to="/gyms" className="text-sm font-black px-4 py-2 bg-black text-white hover:bg-gray-800 transition-all rounded-lg whitespace-nowrap tracking-tight uppercase">Gym Center</Link>
                    <Link to="/coaches" className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap">Coach</Link>
                    <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap">Về chúng tôi</Link>
                    {isAuthenticated && (
                        <>
                            <Link to="/programs" className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap">Khóa học</Link>
                            {user?.user_type === 'athlete' && (
                                <Link to="/workouts" className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap">Lịch tập</Link>
                            )}
                            <Link to="/messages" className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap">Tin nhắn</Link>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Sprint 3: Notification Bell (visible only when logged in) */}
                    <NotificationBell />
                    {isAuthenticated && user ? (
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="hidden lg:flex flex-col items-end">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-black">{user.full_name}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                        {user.user_type === 'trainer' ? 'COACH' : user.user_type === 'athlete' ? 'VĐV' : user.user_type === 'gym_owner' ? 'CHỦ GYM' : 'USER'}
                                    </p>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-gray-200 hidden lg:block"></div>
                            <Link to={user.user_type === 'gym_owner' ? "/gym-owner" : "/dashboard"} className="hidden lg:block btn-secondary text-sm px-3 py-1.5 whitespace-nowrap">
                                {user.user_type === 'gym_owner' ? 'Quản lý Gym' : 'Cá nhân'}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="hidden lg:block text-sm text-gray-500 hover:text-black transition-colors whitespace-nowrap"
                            >
                                Thoát
                            </button>
                        </div>
                    ) : (
                        <div className="hidden lg:flex items-center gap-2">
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
                        className="lg:hidden p-2 text-black focus:outline-none"
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
                <div className="lg:hidden fixed inset-0 top-14 bg-white z-[50] flex flex-col p-6 animate-fade-in">
                    <nav className="flex flex-col gap-6">
                        <Link to="/gyms" onClick={closeMenu} className="text-lg font-bold text-black border-b border-gray-100 pb-2">Gym Center</Link>
                        <Link to="/coaches" onClick={closeMenu} className="text-lg font-bold text-black border-b border-gray-100 pb-2">Coach</Link>
                        <Link to="/about" onClick={closeMenu} className="text-lg font-bold text-black border-b border-gray-100 pb-2">Về GYMERVIET</Link>

                        {isAuthenticated ? (
                            <>
                                <Link to={user?.user_type === 'gym_owner' ? "/gym-owner" : "/dashboard"} onClick={closeMenu} className="text-lg font-bold text-black border-b border-gray-100 pb-2">
                                    {user?.user_type === 'gym_owner' ? 'Quản lý Gym' : 'Dashboard'}
                                </Link>
                                <Link to="/programs" onClick={closeMenu} className="text-lg font-bold text-black border-b border-gray-100 pb-2">Khóa học</Link>
                                {user?.user_type === 'athlete' && (
                                    <Link to="/workouts" onClick={closeMenu} className="text-lg font-bold text-black border-b border-gray-100 pb-2">Lịch tập</Link>
                                )}
                                <Link to="/messages" onClick={closeMenu} className="text-lg font-bold text-black border-b border-gray-100 pb-2">Tin nhắn</Link>
                                <Link to="/profile" onClick={closeMenu} className="text-lg font-bold text-black border-b border-gray-100 pb-2">Hồ sơ</Link>
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
                        GYMERVIET — Hệ sinh thái Gym & Coach số 1 VN
                    </div>
                </div>
            )}
        </header>
    );
}

