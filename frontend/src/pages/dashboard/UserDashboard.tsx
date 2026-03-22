import React, { useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    CheckCircle2,
    Circle,
    ArrowRight,
    Store,
    User,
    Building2,
    Users,
    MessageSquare,
    Newspaper,
} from 'lucide-react';
import type { RootState } from '../../store/store';
import QuickActionCard from '../../components/dashboard/QuickActionCard';
import { USER_TAB_QUERY_KEY, parseUserTabParam } from './userDashboardNav';

const UserDashboard: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [searchParams, setSearchParams] = useSearchParams();

    const userTab = useMemo(() => parseUserTabParam(searchParams.get(USER_TAB_QUERY_KEY)), [searchParams]);

    const setUserTab = useCallback(
        (tab: 'journey' | 'shortcuts') => {
            if (tab === 'journey') {
                setSearchParams({}, { replace: true });
            } else {
                setSearchParams({ [USER_TAB_QUERY_KEY]: 'shortcuts' }, { replace: true });
            }
        },
        [setSearchParams]
    );

    const getCompleteness = () => {
        let score = 20;
        if (user?.avatar_url) score += 20;
        if (user?.height_cm) score += 20;
        if (user?.current_weight_kg) score += 20;
        if (user?.bio) score += 20;
        return score;
    };

    const completeness = getCompleteness();
    const isProfileComplete = completeness === 100;
    const journeyFirstMobile = userTab !== 'shortcuts';

    const shortcutCards = [
        {
            to: '/profile',
            icon: <User className="h-5 w-5" />,
            title: 'Hồ sơ của bạn',
            desc: 'Cập nhật thông tin và ảnh đại diện',
        },
        {
            to: '/gyms',
            icon: <Building2 className="h-5 w-5" />,
            title: 'Tìm phòng gym',
            desc: 'Khám phá cơ sở phù hợp gần bạn',
        },
        {
            to: '/coaches',
            icon: <Users className="h-5 w-5" />,
            title: 'Huấn luyện viên',
            desc: 'Xem coach trên nền tảng',
        },
        {
            to: '/messages',
            icon: <MessageSquare className="h-5 w-5" />,
            title: 'Tin nhắn',
            desc: 'Trao đổi với người khác',
        },
        {
            to: '/news',
            icon: <Newspaper className="h-5 w-5" />,
            title: 'Tin tức',
            desc: 'Cập nhật từ GYMERVIET',
        },
        {
            to: '/dashboard/marketplace',
            icon: <Store className="h-5 w-5" />,
            title: 'Cửa hàng của bạn',
            desc: 'Quản lý bài đăng marketplace',
        },
    ];

    const journeyBlock = (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8">
                <h2 className="mb-2 text-2xl font-black tracking-tight text-gray-900">Bắt đầu hành trình</h2>
                <p className="text-gray-600">Vài bước đơn giản để dùng GYMERVIET thuận tiện hơn.</p>

                <div
                    className="mt-6 h-2 w-full overflow-hidden rounded-full bg-gray-100"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={completeness}
                    aria-label="Tiến độ hoàn thiện hồ sơ"
                >
                    <div
                        className="h-full bg-gray-900 transition-all duration-700"
                        style={{ width: `${completeness}%` }}
                    />
                </div>
                <p className="mt-2 text-right text-xs font-medium text-gray-500">Tiến độ: {completeness}%</p>
            </div>

            <div className="space-y-4">
                <div className="flex cursor-default items-start gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 opacity-80">
                    <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-600" aria-hidden />
                    <div>
                        <h3 className="font-bold text-gray-500 line-through">Tạo tài khoản</h3>
                        <p className="text-sm text-gray-500">Chào mừng bạn gia nhập cộng đồng.</p>
                    </div>
                </div>

                <div
                    className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                        isProfileComplete
                            ? 'border-gray-200 bg-gray-50 opacity-80'
                            : 'border-gray-900 bg-white shadow-sm'
                    }`}
                >
                    {isProfileComplete ? (
                        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-600" aria-hidden />
                    ) : (
                        <Circle className="mt-0.5 h-6 w-6 shrink-0 text-gray-300" aria-hidden />
                    )}
                    <div className="flex-1">
                        <h3
                            className={`font-bold ${isProfileComplete ? 'text-gray-500 line-through' : 'text-gray-900'}`}
                        >
                            Hoàn thiện hồ sơ
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Thêm chiều cao, cân nặng và ảnh đại diện để xem gợi ý BMI và lộ trình.
                        </p>
                        {!isProfileComplete && (
                            <Link
                                to="/profile"
                                className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-gray-900 hover:underline"
                            >
                                Cập nhật hồ sơ <ArrowRight className="h-4 w-4" aria-hidden />
                            </Link>
                        )}
                    </div>
                </div>

                <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Gợi ý tiếp theo</p>

                <div className="group flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300">
                    <Circle className="mt-0.5 h-6 w-6 shrink-0 text-gray-300 group-hover:text-gray-400" aria-hidden />
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900">Khám phá không gian tập</h3>
                        <p className="mt-1 text-sm text-gray-600">Gym, yoga, pilates phù hợp quanh bạn.</p>
                        <Link
                            to="/gyms"
                            className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-gray-900 hover:underline"
                        >
                            Xem danh sách gym <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                    </div>
                </div>

                <div className="group flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300">
                    <Circle className="mt-0.5 h-6 w-6 shrink-0 text-gray-300 group-hover:text-gray-400" aria-hidden />
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900">Nâng cấp Athlete hoặc Coach</h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Theo dõi tiến độ tập luyện hoặc nhận học viên khi bạn là huấn luyện viên.
                        </p>
                        <Link
                            to="/profile"
                            className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-gray-900 hover:underline"
                        >
                            Tìm hiểu trên hồ sơ <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50/80 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="flex items-center gap-2 font-bold text-gray-900">
                        <Store className="h-5 w-5" aria-hidden /> Bán hàng trên Marketplace
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">Đăng sản phẩm vật lý; listing đầu tiên miễn phí.</p>
                </div>
                <Link
                    to="/dashboard/marketplace"
                    className="inline-flex items-center gap-2 self-start rounded-sm bg-gray-900 px-5 py-3 text-sm font-bold text-white hover:bg-gray-800 sm:self-auto"
                >
                    Quản lý cửa hàng <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
            </div>
        </div>
    );

    const shortcutsBlock = (
        <aside className="xl:sticky xl:top-24" aria-label="Lối tắt">
            <h3 className="text-h3 mb-4 border-b border-gray-200 pb-2">Lối tắt</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-1 xl:gap-4">
                {shortcutCards.map((card) => (
                    <QuickActionCard
                        key={card.to}
                        to={card.to}
                        icon={card.icon}
                        title={card.title}
                        description={card.desc}
                        uppercaseTitle={false}
                    />
                ))}
            </div>
        </aside>
    );

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex gap-2 border-b border-gray-200 pb-3 md:hidden" role="tablist" aria-label="Chế độ xem dashboard">
                <button
                    type="button"
                    role="tab"
                    aria-selected={journeyFirstMobile}
                    onClick={() => setUserTab('journey')}
                    className={`rounded-full px-4 py-2 text-sm font-bold ${
                        journeyFirstMobile ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                >
                    Lộ trình
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={!journeyFirstMobile}
                    onClick={() => setUserTab('shortcuts')}
                    className={`rounded-full px-4 py-2 text-sm font-bold ${
                        !journeyFirstMobile ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                >
                    Lối tắt
                </button>
            </div>

            <div className="flex flex-col gap-8 xl:grid xl:grid-cols-[1fr_minmax(260px,320px)] xl:items-start">
                <div className={journeyFirstMobile ? 'order-1' : 'order-2 xl:order-1'}>{journeyBlock}</div>
                <div className={journeyFirstMobile ? 'order-2' : 'order-1 xl:order-2'}>{shortcutsBlock}</div>
            </div>
        </div>
    );
};

export default UserDashboard;
