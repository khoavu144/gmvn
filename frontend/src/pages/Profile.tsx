import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProfile, clearProfileMessages } from '../store/slices/profileSlice';
import type { AppDispatch, RootState } from '../store/store';
import { Helmet } from 'react-helmet-async';

import { ProfilePersonalTab } from './ProfilePersonalTab';
import { ProfileCoachTab } from './ProfileCoachTab';
import { ProfileExperienceTab } from './ProfileExperienceTab';
import { ProfileGalleryTab } from './ProfileGalleryTab';
import { ProfileFAQTab } from './ProfileFAQTab';
import { ProfileProgressTab } from './ProfileProgressTab';

type ActiveTab = 'personal' | 'coach_profile' | 'experience' | 'gallery' | 'faq' | 'progress_photos';

export default function Profile() {
    const { user } = useSelector((state: RootState) => state.auth);
    const { myProfile, saving, error: profileError, successMsg } = useSelector(
        (state: RootState) => state.profile
    );
    const dispatch = useDispatch<AppDispatch>();
    const [activeTab, setActiveTab] = useState<ActiveTab>('personal');

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

    const proTabs: { key: ActiveTab; label: string }[] = user.user_type === 'athlete' ? [
        { key: 'personal', label: 'Cá nhân' },
        { key: 'coach_profile', label: 'Hồ sơ VĐV (Public)' },
        { key: 'experience', label: 'Thành tích/Giải đấu' },
        { key: 'gallery', label: 'Gallery' },
        { key: 'faq', label: 'FAQ' },
        { key: 'progress_photos', label: 'Quá trình thay đổi' }
    ] : [
        { key: 'personal', label: 'Cá nhân' },
        { key: 'coach_profile', label: 'Hồ sơ Coach (Public)' },
        { key: 'experience', label: 'Kinh nghiệm' },
        { key: 'gallery', label: 'Gallery' },
        { key: 'faq', label: 'FAQ' },
    ];

    const normalTabs: { key: ActiveTab; label: string }[] = [
        { key: 'personal', label: 'Thông tin cá nhân' },
    ];

    const tabs = (user.user_type === 'trainer' || user?.user_type === 'athlete') ? proTabs : normalTabs;

    return (
        <>
            <Helmet>
                <title>Quản lý Hồ sơ — GYMERVIET</title>
                <meta name="description" content="Quản lý hồ sơ cá nhân, kinh nghiệm, gallery và FAQ trên GYMERVIET." />
                <meta property="og:title" content="Quản lý Hồ sơ — GYMERVIET" />
                <meta property="og:description" content="Quản lý hồ sơ cá nhân, kinh nghiệm, gallery và FAQ trên GYMERVIET." />
            </Helmet>

            <div className="min-h-screen bg-gray-50 flex flex-col pb-16">
                {/* ── SUB-HEADER NAVIGATION ─────────────────────────────────── */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-1.5">
                                <span>←</span> Quay lại Dashboard
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            {(user.user_type === 'trainer' || user.user_type === 'athlete') && myProfile?.is_profile_public && (
                                <Link
                                    to={`/profile/${user.id}?view=public`}
                                    className="text-xs font-bold tracking-wider uppercase border border-black bg-black text-white px-3 py-1 rounded-xs hover:bg-gray-800 transition-colors"
                                    target="_blank"
                                >
                                    Xem trang public ↗
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── COVER HEADER ────────────────────────────────────────────── */}
                <div className="w-full bg-gray-200 h-40 sm:h-56 relative group overflow-hidden">
                    {myProfile?.cover_image_url ? (
                        <img
                            src={myProfile.cover_image_url}
                            alt="cover"
                            className="w-full h-full object-cover grayscale opacity-90 transition-all duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200 gap-2">
                            <span className="text-2xl op-40">GYMERVIET</span>
                            <span className="text-[10px] uppercase tracking-widest opacity-60">Professional Profile</span>
                        </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
                </div>

                {/* ── HERO INFO CARD ────────────────────────────────────────── */}
                <div className="max-w-4xl mx-auto px-4 -mt-12 sm:-mt-16 relative z-10 w-full">
                    <div className="bg-white p-6 rounded-xs border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                        <div className="shrink-0 mx-auto sm:mx-0">
                            <img
                                src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'U')}&background=000&color=fff&size=120`}
                                alt={user?.full_name}
                                className="w-24 h-24 sm:w-28 sm:h-28 rounded-xs object-cover border-4 border-white shadow-sm bg-gray-100 grayscale hover:grayscale-0 transition-all duration-300"
                            />
                        </div>
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row items-center gap-3 mb-1">
                                <h1 className="text-h2 font-bold text-black">{user?.full_name}</h1>
                                <div className="flex gap-2">
                                    {(user.user_type === 'trainer' || user.user_type === 'athlete') && user.is_verified && (
                                        <span className="text-[10px] font-bold tracking-wider uppercase border border-black bg-black text-white px-2 py-0.5 rounded-xs">
                                            Verified
                                        </span>
                                    )}
                                    <span className={`text-[10px] font-bold tracking-wider uppercase border px-2 py-0.5 rounded-xs ${user.user_type === 'trainer' ? 'border-blue-200 bg-blue-50 text-blue-700' : user.user_type === 'athlete' ? 'border-orange-200 bg-orange-50 text-orange-700' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
                                        {user.user_type}
                                    </span>
                                </div>
                            </div>
                            {myProfile?.headline && <p className="text-sm text-gray-800 font-medium mb-2">{myProfile.headline}</p>}
                            {myProfile?.location && <p className="text-xs text-gray-500 capitalize flex items-center justify-center sm:justify-start gap-1">
                                <span className="opacity-70">📍</span> {myProfile.location}
                            </p>}

                            {/* Stats */}
                            {(user.user_type === 'trainer' || user.user_type === 'athlete') && (
                                <div className="flex flex-wrap justify-center sm:justify-start gap-6 text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
                                    {myProfile?.years_experience != null && (
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold text-black border-b border-gray-200 inline-block">{myProfile.years_experience}+</span>
                                            <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">Năm K.Nghiệm</span>
                                        </div>
                                    )}
                                    {myProfile?.clients_trained != null && (
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold text-black border-b border-gray-200 inline-block">{myProfile.clients_trained}+</span>
                                            <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">Học Viên</span>
                                        </div>
                                    )}
                                    {myProfile?.success_stories != null && (
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold text-black border-b border-gray-200 inline-block">{myProfile.success_stories}</span>
                                            <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">Thành Công</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── TABS NAVIGATION ────────────────────────────────────────── */}
                <div className="max-w-4xl mx-auto px-4 mt-8 w-full">
                    <div className="flex gap-6 border-b border-gray-200 overflow-x-auto whitespace-nowrap scrollbar-hide">
                        {tabs.map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`pb-3 text-sm font-bold transition-colors border-b-2 bg-transparent focus:outline-none uppercase tracking-widest ${activeTab === tab.key
                                    ? 'border-black text-black'
                                    : 'border-transparent text-gray-400 hover:text-black hover:border-gray-200'
                                    }`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── TAB CONTENT ────────────────────────────────────────────── */}
                <main className="max-w-4xl w-full mx-auto px-4 py-8">
                    {activeTab === 'personal' && <ProfilePersonalTab user={user} onUpdate={() => dispatch(fetchMyProfile())} />}

                    {activeTab === 'coach_profile' && (user.user_type === 'trainer' || user.user_type === 'athlete') && (
                        <ProfileCoachTab myProfile={myProfile} saving={saving} error={profileError} successMsg={successMsg} />
                    )}

                    {activeTab === 'experience' && (user.user_type === 'trainer' || user.user_type === 'athlete') && <ProfileExperienceTab />}

                    {activeTab === 'gallery' && (user.user_type === 'trainer' || user.user_type === 'athlete') && <ProfileGalleryTab />}

                    {activeTab === 'faq' && (user.user_type === 'trainer' || user.user_type === 'athlete') && <ProfileFAQTab />}

                    {activeTab === 'progress_photos' && user.user_type === 'athlete' && <ProfileProgressTab />}
                </main>
            </div>
        </>
    );
}
