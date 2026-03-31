import type { ReactNode } from 'react';
import { Dumbbell, Users, Newspaper, Image as ImageIcon, ShoppingBag } from 'lucide-react';

export interface NavChild {
    to: string;
    label: string;
    description?: string;
    icon: ReactNode;
}

export interface NavGroup {
    id: string;
    label: string;
    icon: ReactNode;
    children: NavChild[];
}

export const PUBLIC_NAV: NavGroup[] = [
    {
        id: 'explore',
        label: 'Khám Phá',
        icon: <Dumbbell className="w-4 h-4" />,
        children: [
            { to: '/gyms', label: 'Phòng Tập', description: 'Tìm gym center phù hợp gần bạn', icon: <Dumbbell className="w-4 h-4" /> },
            { to: '/coaches', label: 'Huấn Luyện Viên', description: 'Kết nối với coach chuyên nghiệp', icon: <Users className="w-4 h-4" /> },
        ],
    },
    {
        id: 'community',
        label: 'Cộng Đồng',
        icon: <ImageIcon className="w-4 h-4" />,
        children: [
            { to: '/news', label: 'Tin Tức', description: 'Kiến thức và tin tức thể hình mới nhất', icon: <Newspaper className="w-4 h-4" /> },
        ],
    },
    {
        id: 'shop',
        label: 'Cửa Hàng',
        icon: <ShoppingBag className="w-4 h-4" />,
        children: [
            { to: '/marketplace', label: 'Đồ tập & dinh dưỡng', description: 'Thực phẩm bổ sung, phụ kiện và trang phục', icon: <ShoppingBag className="w-4 h-4" /> },
        ],
    },
];
