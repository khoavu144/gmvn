import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { setCredentials } from '../store/slices/authSlice';
import apiClient from '../services/api';
import { fetchUserProfileCatalog } from '../services/userProfileCatalogApi';
import type { CatalogSection } from '../services/userProfileCatalogApi';
import { ProfileCatalogSections, toggleTermInSection } from '../components/profile/ProfileCatalogSections';
import type { RootState } from '../store/store';
import { Check, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import {
    SKIP_FOR_NOW,
    ONBOARDING_GOALS_TITLE,
    ONBOARDING_GOALS_SUB,
    ONBOARDING_COACH_SPECIALTIES_TITLE,
    ONBOARDING_COACH_SPECIALTIES_SUB,
} from '../content/userProfileGlossary';

export default function OnboardingPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, accessToken, refreshToken } = useSelector((state: RootState) => state.auth);

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const [height, setHeight] = useState(170);
    const [weight, setWeight] = useState(65);
    const [experience, setExperience] = useState('beginner');
    const [bio, setBio] = useState('');
    const [selectedTerms, setSelectedTerms] = useState<Set<string>>(new Set());

    const isCoach = user?.user_type === 'trainer';
    const totalSteps = isCoach ? 2 : 3;

    const catalogQ = useQuery({
        queryKey: ['user-profile-catalog-onboarding'],
        queryFn: fetchUserProfileCatalog,
        enabled: Boolean(user && !user.onboarding_completed),
    });

    const catalogSections: CatalogSection[] = catalogQ.data?.sections ?? [];

    const onToggleTerm = useCallback((section: CatalogSection, termId: string) => {
        setSelectedTerms((prev) => toggleTermInSection(section, termId, prev));
    }, []);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const data: Record<string, unknown> = {};
            if (isCoach) {
                data.bio = bio.trim() || undefined;
                data.term_ids = [...selectedTerms];
            } else {
                data.height_cm = height;
                data.current_weight_kg = weight;
                data.experience_level = experience;
                data.term_ids = [...selectedTerms];
            }

            const res = await apiClient.post('/auth/complete-onboarding', data);

            if (res.data.success) {
                if (accessToken) {
                    dispatch(
                        setCredentials({
                            user: res.data.data.user,
                            access_token: accessToken,
                            refresh_token: refreshToken as string,
                        }),
                    );
                }
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Lỗi khi lưu thông tin:', err);
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.error?.message
                : null;
            alert(msg || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;
    if (user.onboarding_completed) {
        navigate('/dashboard');
        return null;
    }

    const catalogLoading = catalogQ.isLoading && (step > 1 || isCoach);

    return (
        <div className="flex min-h-screen bg-white">
            <Helmet>
                <title>Thiết lập hồ sơ — GymViet</title>
            </Helmet>

            <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <p className="font-bold tracking-[0.2em] text-xs mb-8">GYMERVIET</p>
                    <h1 className="text-4xl font-black uppercase tracking-tight leading-none mb-6">
                        {isCoach
                            ? 'Trở thành Huấn luyện viên hàng đầu'
                            : 'Bắt đầu hành trình biến đổi cơ thể'}
                    </h1>
                    <p className="text-gray-500 max-w-md text-lg">
                        {isCoach
                            ? 'Hoàn tất hồ sơ để nhận học viên và quản lý lịch trên GYMERVIET.'
                            : 'Cho chúng tôi vài thông tin cơ bản để gợi ý lộ trình tập phù hợp với bạn.'}
                    </p>
                </div>
                <div className="relative z-10 opacity-50">
                    <p className="text-sm font-mono tracking-widest uppercase">
                        Bước {step} của {totalSteps}
                    </p>
                </div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[80%] h-[80%] rounded-full border-[40px] border-gray-900 opacity-50"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full border-[20px] border-gray-800 opacity-50"></div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-8">
                    {!isCoach && step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tight text-black mb-2">
                                    Chỉ số cơ thể
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    Dùng để ước lượng năng lượng (TDEE) và BMI.
                                </p>
                            </div>
                            <div className="mt-8 space-y-6">
                                <div>
                                    <label className="flex justify-between font-bold text-sm mb-4">
                                        <span>Chiều cao</span>
                                        <span className="text-black">{height} cm</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="140"
                                        max="220"
                                        value={height}
                                        onChange={(e) => setHeight(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                                    />
                                </div>
                                <div>
                                    <label className="flex justify-between font-bold text-sm mb-4">
                                        <span>Cân nặng</span>
                                        <span className="text-black">{weight} kg</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="30"
                                        max="150"
                                        value={weight}
                                        onChange={(e) => setWeight(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                                    />
                                </div>
                                <button
                                    onClick={() => setStep(2)}
                                    className="btn-primary w-full group flex justify-between items-center mt-8"
                                >
                                    Tiếp tục <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    )}

                    {!isCoach && step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tight text-black mb-2">
                                    {ONBOARDING_GOALS_TITLE}
                                </h2>
                                <p className="text-gray-500 text-sm">{ONBOARDING_GOALS_SUB}</p>
                            </div>
                            <div className="mt-8">
                                {catalogLoading ? (
                                    <p className="text-sm text-gray-500">Đang tải danh sách…</p>
                                ) : catalogQ.isError ? (
                                    <p className="text-sm text-red-600">Không tải được gợi ý. Thử tải lại trang.</p>
                                ) : (
                                    <ProfileCatalogSections
                                        sections={catalogSections}
                                        selected={selectedTerms}
                                        onToggleTerm={onToggleTerm}
                                    />
                                )}
                            </div>
                            <div className="flex flex-col gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    className="btn-secondary w-full"
                                >
                                    {SKIP_FOR_NOW}
                                </button>
                                <div className="flex gap-4">
                                    <button onClick={() => setStep(1)} className="btn-secondary w-1/3">
                                        Quay lại
                                    </button>
                                    <button onClick={() => setStep(3)} className="btn-primary w-2/3">
                                        Tiếp tục
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isCoach && step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tight text-black mb-2">
                                    Kinh nghiệm
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    Bạn đã từng tập luyện nghiêm túc bao giờ chưa?
                                </p>
                            </div>
                            <div className="mt-8 space-y-4">
                                {[
                                    {
                                        id: 'beginner',
                                        title: 'Người mới bắt đầu',
                                        desc: 'Chưa từng tập hoặc vừa mới bắt đầu',
                                    },
                                    {
                                        id: 'intermediate',
                                        title: 'Đã có kinh nghiệm',
                                        desc: 'Tập luyện đều đặn từ 6 tháng đến 2 năm',
                                    },
                                    {
                                        id: 'advanced',
                                        title: 'Nâng cao',
                                        desc: 'Tập luyện chuyên nghiệp trên 2 năm',
                                    },
                                ].map((lvl) => (
                                    <div
                                        key={lvl.id}
                                        onClick={() => setExperience(lvl.id)}
                                        className={`border-2 p-5 rounded-lg cursor-pointer transition-all ${experience === lvl.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-200'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-black">{lvl.title}</h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {lvl.desc}
                                                </p>
                                            </div>
                                            <div
                                                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${experience === lvl.id ? 'border-black bg-black text-white' : 'border-gray-200'}`}
                                            >
                                                {experience === lvl.id && <Check className="w-4 h-4" />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setStep(2)} className="btn-secondary w-1/3">
                                        Quay lại
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="btn-primary w-2/3"
                                    >
                                        {loading ? 'Đang xử lý...' : 'Hoàn tất'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isCoach && step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tight text-black mb-2">
                                    {ONBOARDING_COACH_SPECIALTIES_TITLE}
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    {ONBOARDING_COACH_SPECIALTIES_SUB}
                                </p>
                            </div>
                            <div className="mt-8">
                                {catalogQ.isLoading ? (
                                    <p className="text-sm text-gray-500">Đang tải danh sách…</p>
                                ) : catalogQ.isError ? (
                                    <p className="text-sm text-red-600">Không tải được gợi ý. Thử tải lại trang.</p>
                                ) : (
                                    <ProfileCatalogSections
                                        sections={catalogSections}
                                        selected={selectedTerms}
                                        onToggleTerm={onToggleTerm}
                                    />
                                )}
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                disabled={catalogSections.length === 0 || selectedTerms.size === 0}
                                className="btn-primary w-full mt-8 flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                Tiếp tục{' '}
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}

                    {isCoach && step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tight text-black mb-2">
                                    Giới thiệu bản thân
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    Có thể bổ sung sau trong mục Hồ sơ — không bắt buộc để hoàn tất bước này.
                                </p>
                            </div>
                            <div className="mt-8 space-y-6">
                                <div>
                                    <textarea
                                        rows={5}
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Ví dụ: Tôi là HLV chuyên về giảm mỡ và phục hồi thể lực…"
                                        className="form-input resize-none"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setStep(1)} className="btn-secondary w-1/3">
                                        Quay lại
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="btn-primary w-2/3"
                                    >
                                        {loading ? 'Đang xử lý...' : 'Hoàn tất'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
