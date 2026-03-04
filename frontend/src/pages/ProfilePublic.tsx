import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicProfile } from '../store/slices/profileSlice';
import type { AppDispatch, RootState } from '../store/store';

export default function ProfilePublic() {
    const { trainerId } = useParams<{ trainerId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const {
        viewedProfile: profile,
        viewedExperience: experience,
        viewedGallery: gallery,
        viewedFaq: faq,
        loading,
        error,
    } = useSelector((state: RootState) => state.profile);

    const [openFaqId, setOpenFaqId] = useState<string | null>(null);

    useEffect(() => {
        if (trainerId) dispatch(fetchPublicProfile(trainerId));
    }, [trainerId, dispatch]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-800 font-medium">Profile chưa được thiết lập.</p>
                <Link to={`/trainers/${trainerId}`} className="btn-primary text-sm">
                    Xem thông tin cơ bản
                </Link>
                <Link to="/trainers" className="text-sm text-gray-500 underline">← Quay lại danh sách</Link>
            </div>
        );
    }

    const trainer = profile.trainer;

    const typeLabels: Record<string, string> = {
        work: 'Công việc', education: 'Học vấn', certification: 'Chứng chỉ', achievement: 'Thành tích',
    };
    const galleryTypeLabels: Record<string, string> = {
        transformation: 'Transformation', workout: 'Buổi tập', event: 'Sự kiện', certificate: 'Chứng chỉ', other: 'Khác',
    };

    return (
        <div className="bg-gray-50 pb-16">
            {/* Sub Header Navigation */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 h-12 flex items-center">
                    <Link to="/trainers" className="text-sm font-medium text-gray-600 hover:text-black">
                        ← Danh sách HLV
                    </Link>
                </div>
            </div>

            {/* ── COVER HEADER ────────────────────────────────────────────── */}
            <div className="w-full bg-gray-200 h-48 sm:h-64 object-cover">
                {profile.cover_image_url ? (
                    <img src={profile.cover_image_url} alt="cover" className="w-full h-full object-cover grayscale opacity-90" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Cover Image</div>
                )}
            </div>

            {/* ── TRAINER INFO CARD ────────────────────────────────────────── */}
            <div className="max-w-4xl mx-auto px-4 -mt-16 sm:-mt-24 relative z-10">
                <div className="card bg-white p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
                    <div className="shrink-0 mx-auto sm:mx-0">
                        <img
                            src={trainer?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(trainer?.full_name || 'T')}&background=000&color=fff&size=160`}
                            alt={trainer?.full_name}
                            className="w-32 h-32 sm:w-40 sm:h-40 rounded-xs object-cover border-4 border-white shadow-sm bg-gray-100 grayscale hover:grayscale-0 transition-all duration-300"
                        />
                    </div>
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                            <h1 className="text-h1">{trainer?.full_name}</h1>
                            <div className="flex gap-2">
                                {trainer?.is_verified && (
                                    <span className="text-[10px] font-bold tracking-wider uppercase border border-black bg-black text-white px-2 py-0.5 rounded-xs">
                                        Verified
                                    </span>
                                )}
                                {profile.is_accepting_clients && (
                                    <span className="text-[10px] font-bold tracking-wider uppercase border border-gray-300 bg-gray-50 text-gray-700 px-2 py-0.5 rounded-xs">
                                        Available
                                    </span>
                                )}
                            </div>
                        </div>
                        {profile.headline && <p className="text-base text-gray-800 font-medium mb-3">{profile.headline}</p>}
                        {profile.location && <p className="text-sm text-gray-500 mb-4 capitalize">{profile.location}</p>}

                        <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 text-sm text-gray-600 border-t border-gray-100 pt-4">
                            {profile.years_experience != null && (
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-black border-b border-gray-200 inline-block mb-1">{profile.years_experience}+</span>
                                    <span className="text-xs uppercase tracking-wider text-gray-500">Năm K.Nghiệm</span>
                                </div>
                            )}
                            {profile.clients_trained != null && (
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-black border-b border-gray-200 inline-block mb-1">{profile.clients_trained}+</span>
                                    <span className="text-xs uppercase tracking-wider text-gray-500">Học Viên</span>
                                </div>
                            )}
                            {profile.success_stories != null && (
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-black border-b border-gray-200 inline-block mb-1">{profile.success_stories}</span>
                                    <span className="text-xs uppercase tracking-wider text-gray-500">Thành Công</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    {/* Left Column (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* ── ABOUT ────────────────────────────────────────────────── */}
                        {(profile.bio_short || profile.bio_long) && (
                            <div className="card">
                                <h2 className="card-header">Giới thiệu</h2>
                                <div className="prose prose-sm max-w-none text-gray-700">
                                    <p className="whitespace-pre-line leading-relaxed">
                                        {profile.bio_long || profile.bio_short}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ── EXPERIENCE (TIMELINE) ─────────────────────────────────── */}
                        {experience && experience.length > 0 && (
                            <div className="card">
                                <h2 className="card-header">Kinh nghiệm & Học vấn</h2>
                                <div className="relative pl-4 border-l border-gray-200 space-y-8 mt-2">
                                    {experience.map((exp) => (
                                        <div key={exp.id} className="relative">
                                            {/* Timeline dot */}
                                            <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full border-2 border-black bg-white" />
                                            <div>
                                                <div className="flex flex-wrap items-baseline gap-2 mb-1">
                                                    <h3 className="text-base font-semibold text-black">{exp.title}</h3>
                                                    {exp.is_current && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 border border-black rounded-xs">
                                                            HIỆN TẠI
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm font-medium text-gray-800">{exp.organization}</div>
                                                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
                                                    {typeLabels[exp.experience_type]} · {exp.start_date?.slice(0, 7)} — {exp.is_current ? 'Nay' : exp.end_date?.slice(0, 7) || '?'}
                                                </div>
                                                {exp.description && (
                                                    <p className="text-sm text-gray-600 mt-3 leading-relaxed bg-gray-50 p-3 rounded-xs border border-gray-100">
                                                        {exp.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── GALLERY ──────────────────────────────────────────────── */}
                        {gallery && gallery.length > 0 && (
                            <div className="card">
                                <h2 className="card-header">Gallery</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                                    {gallery.map((img) => (
                                        <div key={img.id} className="group relative aspect-square bg-gray-100 overflow-hidden">
                                            <img src={img.image_url} alt={img.caption || 'gallery'}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            {(img.caption || img.image_type !== 'other') && (
                                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{galleryTypeLabels[img.image_type]}</span>
                                                    {img.caption && <p className="text-xs text-gray-200 mt-1 line-clamp-2">{img.caption}</p>}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── FAQ ──────────────────────────────────────────────────── */}
                        {faq && faq.length > 0 && (
                            <div className="card">
                                <h2 className="card-header">Câu hỏi thường gặp</h2>
                                <div className="border border-gray-200 rounded-xs divide-y divide-gray-200">
                                    {faq.map((item) => (
                                        <div key={item.id} className="bg-white">
                                            <button
                                                onClick={() => setOpenFaqId(openFaqId === item.id ? null : item.id)}
                                                className="w-full flex justify-between items-center px-4 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                                            >
                                                <span className="text-sm font-medium text-black pr-4">{item.question}</span>
                                                <span className="text-gray-400 font-mono text-xs shrink-0">
                                                    {openFaqId === item.id ? '-' : '+'}
                                                </span>
                                            </button>
                                            {openFaqId === item.id && (
                                                <div className="px-4 pb-4 pt-1 bg-gray-50">
                                                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{item.answer}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column (1/3 width) */}
                    <div className="space-y-6">
                        {/* ── PRICING & ACTION ─────────────────────────────────────── */}
                        <div className="card border-black bg-black text-white">
                            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Đăng ký tập luyện</h2>
                            {trainer?.base_price_monthly ? (
                                <div className="mb-6">
                                    <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Giá từ</div>
                                    <div className="text-3xl font-bold">
                                        {Number(trainer.base_price_monthly).toLocaleString('vi-VN')}₫
                                    </div>
                                    <div className="text-sm text-gray-400">/ tháng</div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 mb-6">Liên hệ trực tiếp để nhận báo giá chi tiết.</p>
                            )}
                            <Link to={`/trainers/${trainerId}`}
                                className="block w-full py-3 bg-white text-black text-center font-bold text-sm uppercase tracking-wider hover:bg-gray-200 transition-colors">
                                Xem các gói tập
                            </Link>
                        </div>

                        {/* ── SPECIALTIES ──────────────────────────────────────────── */}
                        {trainer?.specialties && trainer.specialties.length > 0 && (
                            <div className="card">
                                <h2 className="card-header">Chuyên môn</h2>
                                <div className="flex flex-wrap gap-2">
                                    {trainer.specialties.map((s) => (
                                        <span key={s} className="px-2.5 py-1 bg-gray-100 border border-gray-200 text-gray-800 text-xs font-medium rounded-xs">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── CERTIFICATIONS ───────────────────────────────────────── */}
                        {profile.certifications && profile.certifications.length > 0 && (
                            <div className="card">
                                <h2 className="card-header">Chứng chỉ & Bằng cấp</h2>
                                <div className="space-y-3">
                                    {profile.certifications.map((cert, i) => (
                                        <div key={i} className="py-3 border-b border-gray-100 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-black">{cert.name}</p>
                                                    <p className="text-xs text-gray-600 mt-0.5">{cert.issuer}</p>
                                                </div>
                                                <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 text-gray-600 rounded-xs">{cert.year}</span>
                                            </div>
                                            {cert.url && (
                                                <a href={cert.url} target="_blank" rel="noopener noreferrer"
                                                    className="inline-block mt-2 text-xs font-medium text-black underline underline-offset-2 hover:text-gray-600 transition-colors">
                                                    Xác thực chứng chỉ ↗
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── SOCIAL LINKS ─────────────────────────────────────────── */}
                        {profile.social_links && Object.values(profile.social_links).some(Boolean) && (
                            <div className="card">
                                <h2 className="card-header">Kết nối</h2>
                                <div className="flex flex-col gap-2">
                                    {Object.entries(profile.social_links).map(([platform, url]) => {
                                        if (!url) return null;
                                        return (
                                            <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer"
                                                className="px-4 py-2.5 bg-gray-50 border border-gray-200 hover:border-black text-sm font-medium text-black capitalize transition-colors flex items-center justify-between group rounded-xs cursor-pointer">
                                                {platform}
                                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
