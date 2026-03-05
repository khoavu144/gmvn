import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { gymService } from '../services/gymService';
import type { GymCenter, GymBranch, GymGallery } from '../types';
import GymReviewForm from '../components/GymReviewForm';
import GymReviewList from '../components/GymReviewList';
import ShareButton from '../components/ShareButton';

const DAY_VI: Record<string, string> = {
    mon: 'Thứ 2', tue: 'Thứ 3', wed: 'Thứ 4',
    thu: 'Thứ 5', fri: 'Thứ 6', sat: 'Thứ 7', sun: 'CN',
};

const GymDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    // ─── ALL HOOKS AT THE TOP (Rules of Hooks) ───────────────────────────
    const [gym, setGym] = useState<GymCenter | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
    const [branchDetail, setBranchDetail] = useState<GymBranch | null>(null);
    const [loadingBranch, setLoadingBranch] = useState(false);
    const [canReview, setCanReview] = useState(false);
    const [lightboxImg, setLightboxImg] = useState<GymGallery | null>(null);
    // ─────────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (id) fetchGym();
    }, [id]);

    useEffect(() => {
        if (id && activeBranchId) {
            fetchBranchDetail(id, activeBranchId);
        }
    }, [id, activeBranchId]);

    useEffect(() => {
        if (id) fetchReviewEligibility();
    }, [id]);

    const fetchGym = async () => {
        try {
            setLoading(true);
            const res = await gymService.getGymCenterById(id!);
            if (res.success && res.gym) {
                setGym(res.gym);
                if (res.gym.branches && res.gym.branches.length > 0) {
                    setActiveBranchId(res.gym.branches[0].id);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBranchDetail = async (gymId: string, branchId: string) => {
        try {
            setLoadingBranch(true);
            const res = await gymService.getBranchDetail(gymId, branchId);
            if (res.success && res.branch) {
                setBranchDetail(res.branch);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingBranch(false);
        }
    };

    const fetchReviewEligibility = async () => {
        try {
            const res = await gymService.checkReviewEligibility(id!);
            setCanReview(res.success && res.canReview);
        } catch {
            setCanReview(false);
        }
    };

    // ─── EARLY RETURNS (after all hooks) ─────────────────────────────────
    if (loading) {
        return <div className="min-h-screen pt-24 pb-16 flex justify-center"><div className="animate-pulse w-1/2 h-64 bg-gray-100 rounded-xl"></div></div>;
    }

    if (!gym) {
        return <div className="min-h-screen pt-24 text-center font-bold text-xl">Không tìm thấy Gym</div>;
    }
    // ─────────────────────────────────────────────────────────────────────

    const branches = gym.branches || [];
    const gallery = branchDetail?.gallery || [];

    return (
        <div className="bg-white min-h-screen pt-24 pb-16">
            {/* Sprint 2: Dynamic SEO title & meta */}
            <Helmet>
                <title>{gym.name} — GYMERVIET Gym</title>
                <meta name="description" content={gym.description?.slice(0, 155) ?? `${gym.name} — hệ thống phòng tập xác thực trên GYMERVIET.`} />
                <meta property="og:title" content={`${gym.name} — GYMERVIET`} />
                <meta property="og:description" content={gym.description?.slice(0, 155) ?? ''} />
                {gym.logo_url && <meta property="og:image" content={gym.logo_url} />}
            </Helmet>
            {/* Lightbox */}
            {lightboxImg && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setLightboxImg(null)}
                >
                    <button
                        className="absolute top-4 right-6 text-white text-4xl font-black hover:text-gray-300 transition-colors"
                        onClick={() => setLightboxImg(null)}
                    >
                        ×
                    </button>
                    <img
                        src={lightboxImg.image_url}
                        alt={lightboxImg.caption || 'Gallery'}
                        className="max-h-[90vh] max-w-full object-contain rounded-lg"
                        onClick={e => e.stopPropagation()}
                    />
                    {lightboxImg.caption && (
                        <p className="absolute bottom-6 text-white text-sm font-medium text-center px-4">
                            {lightboxImg.caption}
                        </p>
                    )}
                </div>
            )}

            {/* Header Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-8 border-b-2 border-black">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200 flex-shrink-0">
                            {gym.logo_url ? (
                                <img src={gym.logo_url} alt={gym.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-black text-gray-400">GV</span>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-black uppercase tracking-tight text-gray-900">{gym.name}</h1>
                                {gym.is_verified && (
                                    <span className="bg-black text-white text-xs font-bold px-2 py-1 uppercase tracking-widest rounded-sm">Verified</span>
                                )}
                            </div>
                            <p className="text-gray-500 font-medium">{gym.tagline}</p>
                        </div>
                    </div>
                    {/* Sprint 2: Share button */}
                    <ShareButton
                        title={`${gym.name} — GYMERVIET`}
                        text={gym.description ?? undefined}
                        label="Chia sẻ Gym"
                    />
                </div>

                <div className="mt-8 text-gray-800 text-lg leading-relaxed max-w-3xl">
                    {gym.description || 'Chưa có thông tin giới thiệu.'}
                </div>
            </div>

            {/* Branches Tabs */}
            {branches.length > 0 && (
                <div className="bg-gray-50 border-y border-gray-200 sticky top-16 z-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex overflow-x-auto hide-scrollbar gap-8">
                            {branches.map(b => (
                                <button
                                    key={b.id}
                                    onClick={() => setActiveBranchId(b.id)}
                                    className={`py-4 px-2 whitespace-nowrap font-bold text-sm uppercase tracking-wider transition-colors border-b-4 ${activeBranchId === b.id
                                        ? 'border-black text-black'
                                        : 'border-transparent text-gray-400 hover:text-gray-800'
                                        }`}
                                >
                                    {b.branch_name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Branch Details */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loadingBranch ? (
                    <div className="animate-pulse h-[400px] bg-gray-100 rounded-xl"></div>
                ) : branchDetail ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                        {/* Left Col: Gallery, Amenities, Pricing */}
                        <div className="lg:col-span-2 space-y-12">

                            {/* Gallery — show up to 4, with lightbox */}
                            {gallery.length > 0 ? (
                                <div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {gallery.slice(0, 4).map((img, idx) => (
                                            <div
                                                key={img.id}
                                                className={`relative cursor-pointer group overflow-hidden rounded-xl bg-gray-100 ${idx === 0 ? 'col-span-2 aspect-video' : 'aspect-video'}`}
                                                onClick={() => setLightboxImg(img)}
                                            >
                                                <img
                                                    src={img.image_url}
                                                    alt={img.caption || 'Gallery'}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                {/* "Xem tất cả" overlay on last visible item */}
                                                {idx === 3 && gallery.length > 4 && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                        <span className="text-white font-black text-lg">+{gallery.length - 4} ảnh</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="aspect-video bg-gray-100 rounded-xl col-span-2"></div>
                                </div>
                            )}

                            <section>
                                <h3 className="text-2xl font-black uppercase mb-6 pb-2 border-b border-gray-200">Tiện ích & Dịch vụ</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {(branchDetail.amenities || []).map(am => (
                                        <div key={am.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <span className={`w-2 h-2 rounded-full ${am.is_available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            <span className={`font-semibold text-sm ${am.is_available ? 'text-gray-900' : 'text-gray-400 line-through'}`}>{am.name}</span>
                                        </div>
                                    ))}
                                    {(!branchDetail.amenities || branchDetail.amenities.length === 0) && (
                                        <span className="text-gray-400 text-sm">Đang cập nhật...</span>
                                    )}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-2xl font-black uppercase mb-6 pb-2 border-b border-gray-200">Bảng giá</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {(branchDetail.pricing || []).map(plan => (
                                        <div key={plan.id} className={`p-6 rounded-xl border-2 ${plan.is_highlighted ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-900'}`}>
                                            <h4 className="text-sm font-bold uppercase tracking-widest mb-1">{plan.plan_name}</h4>
                                            <div className="text-3xl font-black mb-4">
                                                {plan.price.toLocaleString()}đ <span className={`text-base font-normal ${plan.is_highlighted ? 'text-gray-400' : 'text-gray-500'}`}>/ {plan.billing_cycle}</span>
                                            </div>
                                            {plan.description && <p className={`text-sm ${plan.is_highlighted ? 'text-gray-300' : 'text-gray-600'}`}>{plan.description}</p>}
                                        </div>
                                    ))}
                                    {(!branchDetail.pricing || branchDetail.pricing.length === 0) && (
                                        <span className="text-gray-400 text-sm">Đang cập nhật...</span>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Right Col: Address & Contact */}
                        <div className="space-y-8">
                            <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Thông tin Cơ sở</h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Địa chỉ</label>
                                        <p className="font-medium text-gray-900">{branchDetail.address}</p>
                                        {(branchDetail.district || branchDetail.city) && (
                                            <p className="text-sm text-gray-500">{branchDetail.district ? `${branchDetail.district}, ` : ''}{branchDetail.city}</p>
                                        )}
                                    </div>

                                    {branchDetail.phone && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Hotline</label>
                                            <p className="font-medium text-gray-900">{branchDetail.phone}</p>
                                        </div>
                                    )}

                                    {/* ─── Opening Hours (đã fix: không dùng JSON.stringify) ─── */}
                                    {branchDetail.opening_hours && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Giờ mở cửa</label>
                                            <div className="space-y-2">
                                                {Object.entries(branchDetail.opening_hours).map(([day, hours]) => {
                                                    if (!hours) return null;
                                                    const h = hours as { open: string; close: string; is_closed?: boolean };
                                                    return (
                                                        <div key={day} className="flex justify-between items-center text-sm">
                                                            <span className="font-semibold text-gray-700 w-16">{DAY_VI[day] ?? day}</span>
                                                            {h.is_closed ? (
                                                                <span className="text-red-500 font-medium">Đóng cửa</span>
                                                            ) : (
                                                                <span className="text-gray-900 font-medium">{h.open} – {h.close}</span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500 font-bold">Vui lòng chọn cơ sở</div>
                )}

                {/* Review Section */}
                <div className="mt-16 pt-16 border-t border-gray-100">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2">
                            <h3 className="text-2xl font-black uppercase mb-8">Đánh giá từ cộng đồng</h3>
                            <GymReviewList gymId={id!} />
                        </div>
                        <div className="lg:col-span-1">
                            {activeBranchId && (
                                <div className="sticky top-24">
                                    {canReview ? (
                                        <GymReviewForm
                                            gymId={id!}
                                            branchId={activeBranchId}
                                            onSuccess={() => window.location.reload()}
                                        />
                                    ) : (
                                        <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
                                            <p className="text-sm text-gray-500 font-medium">Bạn cần có gói tập (Subscription) với HLV tại đây để gửi đánh giá xác thực.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GymDetailPage;
