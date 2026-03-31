import { Link } from 'react-router-dom';
import { X, Users, Building2, CalendarDays, Settings, Store } from 'lucide-react';
import type { GymCenter } from '../../types';

type ActiveTab = 'overview' | 'branches' | 'trainers' | 'settings';

interface Props {
    gym: GymCenter;
    activeTab: ActiveTab;
    isSidebarOpen: boolean;
    onTabChange: (tab: ActiveTab) => void;
    onClose: () => void;
}

export default function DashboardSidebar({ gym, activeTab, isSidebarOpen, onTabChange, onClose }: Props) {
    const handleTabClick = (tab: ActiveTab) => {
        onTabChange(tab);
        onClose();
    };

    const navItems: { tab: ActiveTab; icon: React.ReactNode; label: string }[] = [
        { tab: 'overview', icon: <CalendarDays className="w-4 h-4" />, label: 'Tổng quan' },
        { tab: 'branches', icon: <Building2 className="w-4 h-4" />, label: 'Chi nhánh' },
        { tab: 'trainers', icon: <Users className="w-4 h-4" />, label: 'Huấn luyện viên liên kết' },
        { tab: 'settings', icon: <Settings className="w-4 h-4" />, label: 'Cài đặt' },
    ];

    return (
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-50 border-r border-gray-200 flex-shrink-0 transform transition-transform duration-300 md:relative md:w-64 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white md:bg-gray-50">
                <div className="min-w-0 pr-4">
                    <h2 className="font-black truncate uppercase tracking-tight" title={gym.name}>{gym.name}</h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Phòng tập</p>
                </div>
                <button onClick={onClose} className="md:hidden p-2 text-gray-500 hover:text-black hover:bg-gray-50 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <nav className="p-4 space-y-2">
                {navItems.map(({ tab, icon, label }) => (
                    <button
                        key={tab}
                        onClick={() => handleTabClick(tab)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm tracking-wider uppercase transition-colors ${activeTab === tab ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        {icon} {label}
                    </button>
                ))}
                <Link
                    to="/dashboard/marketplace"
                    onClick={onClose}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm tracking-wider uppercase transition-colors text-gray-600 hover:bg-gray-100"
                >
                    <Store className="w-4 h-4" /> Gian hàng marketplace
                </Link>
            </nav>
        </div>
    );
}
