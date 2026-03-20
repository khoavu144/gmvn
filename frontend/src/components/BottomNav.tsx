// src/components/BottomNav.tsx
// Mobile bottom navigation (Q3) · 5 items max · Lucide icons

import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, Dumbbell, User, MessageSquare, Grid3X3 } from 'lucide-react';
import type { RootState } from '../store/store';
import { cn } from '../lib/utils';

export default function BottomNav() {
    const location = useLocation();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const user = useSelector((state: RootState) => state.auth.user);

    // Public items (always visible)
    const publicItems = [
        { to: '/', icon: Home, label: 'Trang chủ' },
        { to: '/coaches', icon: User, label: 'Coach' },
        { to: '/gyms', icon: Dumbbell, label: 'Gym' },
    ];

    // Auth items
    const authItems = isAuthenticated
        ? [
            { to: '/messages', icon: MessageSquare, label: 'Tin nhắn' },
            {
                to: user?.user_type === 'gym_owner' ? '/gym-owner' : '/dashboard',
                icon: Grid3X3,
                label: 'Cá nhân',
            },
        ]
        : [
            { to: '/login', icon: User, label: 'Đăng nhập' },
        ];

    const items = [...publicItems, ...authItems].slice(0, 5);

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-header h-bottom-nav bg-white/95 backdrop-blur-md border-t border-[color:var(--mk-line)] safe-bottom">
            <div className="flex items-center justify-around h-full max-w-page mx-auto">
                {items.map((item) => {
                    const isActive = location.pathname === item.to;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={cn(
                                'bottom-nav-item',
                                isActive && 'active'
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-[11px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}