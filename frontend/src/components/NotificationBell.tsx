import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../types';

/**
 * Sprint 3 — Notification Bell
 * Shows unread badge, dropdown list of notifications.
 * Connects to Redux auth; only renders when logged in.
 */
export default function NotificationBell() {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch on mount + every 60 s (polling fallback; Socket.IO will push realtime)
    useEffect(() => {
        if (!isAuthenticated) return;
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60_000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getMyNotifications();
            setNotifications(data.notifications);
            setUnreadCount(data.unread_count);
        } catch {
            // Silently ignore (user may not be authenticated)
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setOpen(prev => !prev);
    };

    const handleClickNotif = async (notif: Notification) => {
        if (!notif.is_read) {
            await notificationService.markRead(notif.id).catch(() => { });
            setNotifications(prev =>
                prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setOpen(false);
        if (notif.link) navigate(notif.link);
    };

    const handleMarkAll = async () => {
        await notificationService.markAllRead().catch(() => { });
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    if (!isAuthenticated) return null;

    return (
        <div ref={dropdownRef} className="relative">
            {/* Bell button */}
            <button
                onClick={handleOpen}
                className="relative p-2 text-gray-600 hover:text-black transition-colors"
                aria-label="Thông báo"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-[200] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                        <span className="font-black text-sm uppercase tracking-wider">Thông báo</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAll}
                                className="text-xs text-gray-500 hover:text-black transition-colors font-medium"
                            >
                                Đánh dấu tất cả đã đọc
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="py-8 text-center text-gray-500 text-sm">Đang tải...</div>
                        ) : notifications.length === 0 ? (
                            <div className="py-8 text-center text-gray-500 text-sm">
                                <span className="text-3xl block mb-2">🔔</span>
                                Chưa có thông báo nào
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <button
                                    key={notif.id}
                                    onClick={() => handleClickNotif(notif)}
                                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 items-start ${!notif.is_read ? 'bg-blue-50/40' : ''}`}
                                >
                                    {/* Unread dot */}
                                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notif.is_read ? 'bg-blue-500' : 'bg-transparent'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-semibold leading-tight truncate ${!notif.is_read ? 'text-black' : 'text-gray-600'}`}>
                                            {notif.title}
                                        </p>
                                        {notif.body && (
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>
                                        )}
                                        <p className="text-[10px] text-gray-500 mt-1">
                                            {new Date(notif.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-200 text-center">
                            <button
                                onClick={() => setOpen(false)}
                                className="text-xs text-gray-500 hover:text-black transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
