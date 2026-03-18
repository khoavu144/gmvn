import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProfile, clearProfileMessages } from '../store/slices/profileSlice';
import type { AppDispatch, RootState } from '../store/store';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, User as UserIcon, Layout, Award, Image as ImageIcon, MessageCircle, Camera, ExternalLink, MapPin, CheckCircle } from 'lucide-react';
import { m as motion, AnimatePresence, LazyMotion } from 'framer-motion';
const loadFramerFeatures = () => import('framer-motion').then(res => res.domAnimation);

import { ProfilePersonalTab } from '../components/profile/ProfilePersonalTab';
import { ProfileCoachTab } from '../components/profile/ProfileCoachTab';
import { ProfileExperienceTab } from '../components/profile/ProfileExperienceTab';
import { ProfileGalleryTab } from '../components/profile/ProfileGalleryTab';
import { ProfileFAQTab } from '../components/profile/ProfileFAQTab';
import { ProfileProgressTab } from '../components/profile/ProfileProgressTab';
// import { EditProfileModal } from '../components/profile/EditProfileModal';

type ActiveTab = 'personal' | 'coach_profile' | 'experience' | 'gallery' | 'faq' | 'progress_photos';

export default function Profile() {
    const { user } = useSelector((state: RootState) => state.auth);
    const { myProfile, saving, error: profileError, successMsg } = useSelector(
        (state: RootState) => state.profile
    );
    const dispatch = useDispatch<AppDispatch>();
    const [activeTab, setActiveTab] = useState<ActiveTab>('personal');
    // const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        if (user?.user_type === 'trainer' || user?.user_type === 'athlete') {
            dispatch(fetchMyProfile());
        }
    }, [user, dispatch]);

    useEffect(() => {
        if (successMsg && (activeTab === 'coach_profile')) {
            const t = setTimeout(() => dispatch(clearProfileMessages()), 3000);
            return () => clearTimeout(t);
        }
    }, [successMsg, dispatch, activeTab]);

    if (!user) return <div className="p-8 text-black">Vui lòng đăng nhập.</div>;

    const proTabs: { key: ActiveTab; label: string; icon: any }[] = user.user_type === 'athlete' ? [
        { key: 'personal', label: 'Cá nhân', icon: UserIcon },
        { key: 'coach_profile', label: 'Hồ sơ VĐV (Public)', icon: Layout },
        { key: 'experience', label: 'Thành tích/Giải đấu', icon: Award },
        { key: 'gallery', label: 'Gallery', icon: ImageIcon },
        { key: 'faq', label: 'FAQ', icon: MessageCircle },
        { key: 'progress_photos', label: 'Quá trình thay đổi', icon: Camera }
    ] : [
        { key: 'personal', label: 'Cá nhân', icon: UserIcon },
        { key: 'coach_profile', label: 'Hồ sơ Coach (Public)', icon: Layout },
        { key: 'experience', label: 'Kinh nghiệm', icon: Award },
        { key: 'gallery', label: 'Gallery', icon: ImageIcon },
        { key: 'faq', label: 'FAQ', icon: MessageCircle },
    ];

    const normalTabs: { key: ActiveTab; label: string; icon: any }[] = [
        { key: 'personal', label: 'Thông tin cá nhân', icon: UserIcon },
    ];

    const tabs = (user.user_type === 'trainer' || user?.user_type === 'athlete') ? proTabs : normalTabs;

    return (
        <LazyMotion features={loadFramerFeatures} strict>
            <Helmet>
                <title>Quản lý Hồ sơ — GYMERVIET</title>
                <meta name="description" content="Quản lý hồ sơ cá nhân, kinh nghiệm, gallery và FAQ trên GYMERVIET." />
                <meta property="og:title" content="Quản lý Hồ sơ — GYMERVIET" />
                <meta property="og:description" content="Quản lý hồ sơ cá nhân, kinh nghiệm, gallery và FAQ trên GYMERVIET." />
            </Helmet>

            <div className="min-h-screen bg-white flex flex-col pb-16">
                {/* ── MODERN GLASSMORTPHISM HEADER ───────────────────────────── */}
                <div className="relative h-[300px] sm:h-[350px] w-full overflow-hidden bg-black">
                    {/* Background Image / Pattern */}
                    {myProfile?.cover_image_url ? (
                        <div className="absolute inset-0">
                            <img
                                src={myProfile.cover_image_url}
                                alt="Cover"
                                className="w-full h-full object-cover scale-105 blur-[2px] opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000"
                                fetchPriority="high"
                                decoding="async"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20"></div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-80">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/40"></div>
                        </div>
                    )}

                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-10">
                            <div className="flex flex-col md:flex-row items-end gap-6 md:gap-8">
                                {/* Avatar with Premium Border */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative group shrink-0"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] overflow-hidden border-[6px] border-white shadow-2xl bg-white">
                                        <img
                                            src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'U')}&background=000&color=fff&size=200`}
                                            alt={user?.full_name}
                                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                            decoding="async"
                                        />
                                    </div>
                                    {((user?.user_type === 'trainer' || user?.user_type === 'athlete') && user?.is_verified) && (
                                        <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1.5 rounded-2xl border-4 border-white shadow-lg" title="Verified Professional">
                                            <CheckCircle className="w-5 h-5 fill-current" />
                                        </div>
                                    )}
                                </motion.div>

                                {/* Profile Text Info */}
                                <div className="flex-1 pb-2">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">{user?.full_name}</h1>
                                            <span className="px-3 py-1 bg-black/5 backdrop-blur-md border border-black/10 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-600">
                                                {user?.user_type === 'trainer' ? 'Certified Coach' : user?.user_type === 'athlete' ? 'Elite Athlete' : 'Member'}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 font-medium text-sm sm:text-lg max-w-2xl leading-relaxed">
                                            {myProfile?.headline || "Chưa thiết lập tiêu đề giới thiệu."}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs sm:text-sm font-semibold text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4 text-red-500" />
                                                <span>{myProfile?.location || 'Chưa cập nhật vị trí'}</span>
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block"></div>
                                            <div className="flex items-center gap-1.5 hover:text-black transition-colors cursor-default">
                                                <Award className="w-4 h-4 text-yellow-500" />
                                                <span>{myProfile?.years_experience || 0} năm kinh nghiệm</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 pb-2 w-full md:w-auto">
                                    {/* TODO: Re-enable when EditProfileModal is implemented */}
                                    {/* <button
                                        onClick={() => setShowEditModal(true)}
                                        className="flex-1 md:flex-none px-6 py-3 bg-black text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2 group"
                                    >
                                        Chỉnh sửa hồ sơ
                                        <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                                    </button> */}

                                    {(user.user_type === 'trainer' || user.user_type === 'athlete') && myProfile?.is_profile_public && (
                                        <a
                                            href={user.user_type === 'athlete'
                                                ? (myProfile.slug ? `/athletes/${myProfile.slug}` : `/athletes/${user.id}`)
                                                : (myProfile.slug ? `/coach/${myProfile.slug}` : `/profile/public/${user.id}`)
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 bg-white border border-gray-200 text-gray-600 rounded-2xl hover:border-black hover:text-black transition-all shadow-sm group"
                                            title="Xem trang công khai"
                                        >
                                            <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Internal Navigation / Breadcrumbs (Modern Styled) */}
                <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-16 z-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
                        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar after:content-[''] after:block after:w-4 after:shrink-0">
                            <Link to="/dashboard" className="shrink-0 p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <ArrowLeft className="w-5 h-5 text-gray-500" />
                            </Link>
                            <div className="h-6 w-px bg-gray-200 shrink-0"></div>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.key
                                        ? 'bg-black text-white shadow-md'
                                        : 'text-gray-500 hover:text-black hover:bg-gray-50'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── 2-COLUMN LAYOUT CONTAINER ──────────────────────────────── */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 w-full">
                    <div className="flex flex-col lg:flex-row gap-8 items-start">

                        {/* LEFT COLUMN: Profile Card Sidebar */}
                        <div className="w-full lg:w-[320px] shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-[120px]">
                            {/* Cover Image Area */}
                            <div className="h-32 bg-gray-900 relative">
                                {myProfile?.cover_image_url ? (
                                    <img
                                        src={myProfile.cover_image_url}
                                        alt="Cover"
                                        className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-800 to-gray-900 gap-1">
                                        <span className="text-xl op-40 font-bold tracking-widest text-white/20">GYMERVIET</span>
                                    </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent"></div>
                            </div>

                            {/* Profile Info */}
                            <div className="relative px-6 pb-6 pt-0 text-center">
                                {/* Avatar */}
                                <div className="relative w-24 h-24 mx-auto -mt-12 mb-4">
                                    <img
                                        src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'U')}&background=000&color=fff&size=150`}
                                        alt={user?.full_name}
                                        className="w-full h-full rounded-2xl object-cover border-4 border-white shadow-md bg-white filter grayscale hover:grayscale-0 transition-all duration-500"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    {((user.user_type === 'trainer' || user.user_type === 'athlete') && user.is_verified) && (
                                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Verified">
                                            <CheckCircle className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>

                                <h1 className="text-xl font-bold text-gray-900">{user?.full_name || 'Người dùng'}</h1>
                                <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-widest">{myProfile?.headline || user?.user_type || 'Chưa thiết lập'}</p>

                                {myProfile?.location && (
                                    <div className="flex justify-center items-center gap-1.5 mt-3 text-sm text-gray-500">
                                        <MapPin className="w-4 h-4" />
                                        <span>{myProfile.location}</span>
                                    </div>
                                )}

                                {/* Quick Stats */}
                                {(user.user_type === 'trainer' || user.user_type === 'athlete') && (
                                    <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-100">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-black">{myProfile?.years_experience || 0}</div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mt-1">Năm K.N</div>
                                        </div>
                                        <div className="w-px h-8 bg-gray-200"></div>
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-black">{myProfile?.clients_trained || 0}</div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mt-1">Học viên</div>
                                        </div>
                                        <div className="w-px h-8 bg-gray-200"></div>
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-black">{myProfile?.success_stories || 0}</div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mt-1">Thành công</div>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Sidebar inside the card */}
                                <div className="mt-8 flex flex-col gap-1 text-left">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm group ${activeTab === tab.key
                                                ? 'bg-black text-white shadow-md'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <tab.icon className={`w-5 h-5 ${activeTab === tab.key ? 'text-white' : 'text-gray-400 group-hover:text-black'}`} />
                                                {tab.label}
                                            </div>
                                            {activeTab === tab.key && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm"></div>}
                                        </button>
                                    ))}
                                </div>

                                {(user.user_type === 'gym_owner') && (
                                    <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl text-left">
                                        <p className="text-sm font-bold text-gray-900">Quản lý phòng tập</p>
                                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                                            Thông tin chi nhánh, huấn luyện viên và hệ thống đánh giá được quản lý tại trang riêng.
                                        </p>
                                        <Link to="/gym-owner/dashboard" className="block w-full py-2.5 mt-4 bg-black text-white text-center text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors rounded-lg">
                                            Vào trang Quản lý Gym
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Tab Content */}
                        <div className="flex-1 min-w-0 pb-20">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {activeTab === 'personal' && <ProfilePersonalTab user={user} onUpdate={() => dispatch(fetchMyProfile())} />}
                                    {activeTab === 'coach_profile' && (user.user_type === 'trainer' || user.user_type === 'athlete') && (
                                        <ProfileCoachTab
                                            myProfile={myProfile}
                                            saving={saving}
                                            error={profileError}
                                            successMsg={successMsg}
                                            publicBasePath={user.user_type === 'athlete' ? '/athletes' : '/coach'}
                                        />
                                    )}
                                    {activeTab === 'experience' && (user.user_type === 'trainer' || user.user_type === 'athlete') && <ProfileExperienceTab />}
                                    {activeTab === 'gallery' && (user.user_type === 'trainer' || user.user_type === 'athlete') && <ProfileGalleryTab />}
                                    {activeTab === 'faq' && (user.user_type === 'trainer' || user.user_type === 'athlete') && <ProfileFAQTab />}
                                    {activeTab === 'progress_photos' && user.user_type === 'athlete' && <ProfileProgressTab />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* TODO: Re-enable when EditProfileModal is implemented */}
            {/* <EditProfileModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                user={user}
                onUpdate={() => {
                    dispatch(fetchMyProfile());
                    // Optionally refresh user data if avatar/name changed
                }}
            {/* <EditProfileModal ... /> */}
        </LazyMotion>
    );
}
