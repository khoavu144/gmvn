import { useCallback, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Check } from 'lucide-react';

import apiClient from '../services/api';
import { setCredentials } from '../store/slices/authSlice';
import type { RootState } from '../store/store';
import { fetchUserProfileCatalog } from '../services/userProfileCatalogApi';
import type { CatalogSection } from '../services/userProfileCatalogApi';
import { ProfileCatalogSections, toggleTermInSection } from '../components/profile/ProfileCatalogSections';
import { trackEvent } from '../lib/analytics';
import {
    SKIP_FOR_NOW,
    ONBOARDING_GOALS_TITLE,
    ONBOARDING_GOALS_SUB,
    ONBOARDING_COACH_SPECIALTIES_TITLE,
    ONBOARDING_COACH_SPECIALTIES_SUB,
} from '../content/userProfileGlossary';

type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

const EXPERIENCE_OPTIONS: Array<{ id: ExperienceLevel; title: string; desc: string }> = [
    {
        id: 'beginner',
        title: 'Người mới bắt đầu',
        desc: 'Chưa từng tập nghiêm túc hoặc mới quay lại gần đây.',
    },
    {
        id: 'intermediate',
        title: 'Đã có kinh nghiệm',
        desc: 'Tập đều đặn và đã hiểu các nguyên tắc cơ bản.',
    },
    {
        id: 'advanced',
        title: 'Nâng cao',
        desc: 'Đã có cấu trúc tập rõ ràng và theo đuổi mục tiêu dài hạn.',
    },
];

export default function OnboardingPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, accessToken, refreshToken } = useSelector((state: RootState) => state.auth);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);

    const [height, setHeight] = useState(170);
    const [weight, setWeight] = useState(65);
    const [experience, setExperience] = useState<ExperienceLevel>('beginner');
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

    const panelTitle = useMemo(() => {
        if (isCoach) {
            return step === 1 ? ONBOARDING_COACH_SPECIALTIES_TITLE : 'Giới thiệu bản thân';
        }
        if (step === 1) return 'Chỉ số cơ bản';
        if (step === 2) return ONBOARDING_GOALS_TITLE;
        return 'Mức kinh nghiệm';
    }, [isCoach, step]);

    const panelDescription = useMemo(() => {
        if (isCoach) {
            return step === 1
                ? ONBOARDING_COACH_SPECIALTIES_SUB
                : 'Một đoạn ngắn là đủ để người học hiểu bạn phù hợp với ai.';
        }
        if (step === 1) return 'Một vài dữ kiện nền để gợi ý trải nghiệm phù hợp hơn.';
        if (step === 2) return ONBOARDING_GOALS_SUB;
        return 'Chọn mức gần đúng nhất. Bạn có thể cập nhật lại sau.';
    }, [isCoach, step]);

    const onToggleTerm = useCallback((section: CatalogSection, termId: string) => {
        setSelectedTerms((prev) => toggleTermInSection(section, termId, prev));
    }, []);

    const goToStep = (nextStep: number) => {
        setError('');
        setStep(nextStep);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

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

            const response = await apiClient.post('/auth/complete-onboarding', data);

            if (response.data.success && accessToken) {
                dispatch(
                    setCredentials({
                        user: response.data.data.user,
                        access_token: accessToken,
                        refresh_token: refreshToken as string,
                    }),
                );
            }

            trackEvent('onboarding_complete', {
                user_type: user?.user_type || 'unknown',
                step_count: totalSteps,
                selected_terms: selectedTerms.size,
            });
            navigate('/dashboard');
        } catch (err) {
            const message = axios.isAxiosError(err)
                ? err.response?.data?.error?.message || err.response?.data?.error
                : null;
            setError(message || 'Không thể lưu onboarding lúc này. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleSkipGoals = () => {
        trackEvent('onboarding_skip', {
            step_id: 'goals',
            user_type: user?.user_type || 'unknown',
        });
        goToStep(3);
    };

    if (!user) return null;
    if (user.onboarding_completed) {
        navigate('/dashboard');
        return null;
    }

    return (
        <div className="auth-shell">
            <Helmet>
                <title>Thiết lập hồ sơ — GYMERVIET</title>
                <meta name="description" content="Hoàn thiện thiết lập ban đầu để bắt đầu dùng GYMERVIET với trải nghiệm phù hợp hơn." />
            </Helmet>

            <div className="auth-shell__grid">
                <section className="auth-shell__intro">
                    <p className="page-kicker">Kích hoạt trải nghiệm</p>
                    <h1 className="page-title max-w-xl">
                        {isCoach ? 'Hoàn thiện vài tín hiệu để hồ sơ huấn luyện viên bắt đầu có giá trị ngay.' : 'Thiết lập vài dữ kiện nền để ứng dụng gợi ý lộ trình hợp lý hơn.'}
                    </h1>
                    <p className="page-description max-w-xl">
                        Mục tiêu là đưa bạn vào bảng điều khiển nhanh hơn, với trải nghiệm bớt nhiễu hơn.
                    </p>

                    <div className="auth-shell__summary surface-panel">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <span className="page-kicker">Tiến độ</span>
                                <h2 className="section-title mt-1">Bước {step} / {totalSteps}</h2>
                            </div>
                            <span className="page-pill">{isCoach ? 'Luồng huấn luyện viên' : 'Luồng thành viên'}</span>
                        </div>

                        <div
                            className="mt-5 h-2 w-full overflow-hidden rounded-full bg-gray-100"
                            role="progressbar"
                            aria-valuemin={1}
                            aria-valuemax={totalSteps}
                            aria-valuenow={step}
                            aria-label="Tiến độ thiết lập ban đầu"
                        >
                            <div className="h-full bg-gray-900 transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%` }} />
                        </div>

                        <ul className="auth-shell__points">
                            <li>Có thể bổ sung sâu hơn trong hồ sơ sau.</li>
                            <li>Chỉ hỏi phần ảnh hưởng trực tiếp tới gợi ý và độ tin cậy.</li>
                            <li>Thiết kế để hoàn thành nhanh trên điện thoại.</li>
                        </ul>
                    </div>
                </section>

                <section className="auth-shell__panel surface-panel">
                    <div className="mb-6">
                        <p className="page-kicker">Thiết lập ban đầu</p>
                        <h2 className="page-title text-2xl sm:text-3xl">{panelTitle}</h2>
                        <p className="page-description">{panelDescription}</p>
                    </div>

                    {error ? (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    ) : null}

                    {!isCoach && step === 1 ? (
                        <div className="space-y-8">
                            <div>
                                <label className="mb-3 flex items-center justify-between text-sm font-semibold text-gray-900">
                                    <span>Chiều cao</span>
                                    <span>{height} cm</span>
                                </label>
                                <input
                                    type="range"
                                    min="140"
                                    max="220"
                                    value={height}
                                    onChange={(event) => setHeight(Number(event.target.value))}
                                    className="w-full accent-black"
                                />
                            </div>
                            <div>
                                <label className="mb-3 flex items-center justify-between text-sm font-semibold text-gray-900">
                                    <span>Cân nặng</span>
                                    <span>{weight} kg</span>
                                </label>
                                <input
                                    type="range"
                                    min="30"
                                    max="150"
                                    value={weight}
                                    onChange={(event) => setWeight(Number(event.target.value))}
                                    className="w-full accent-black"
                                />
                            </div>
                            <button type="button" onClick={() => goToStep(2)} className="btn-primary w-full">
                                Tiếp tục
                            </button>
                        </div>
                    ) : null}

                    {!isCoach && step === 2 ? (
                        <div className="space-y-6">
                            {catalogQ.isLoading ? (
                                <p className="text-sm text-gray-500">Đang tải danh sách mục tiêu…</p>
                            ) : catalogQ.isError ? (
                                <p className="text-sm text-red-600">Không tải được gợi ý. Bạn có thể bỏ qua bước này để tiếp tục.</p>
                            ) : (
                                <ProfileCatalogSections
                                    sections={catalogSections}
                                    selected={selectedTerms}
                                    onToggleTerm={onToggleTerm}
                                />
                            )}

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button type="button" onClick={() => goToStep(1)} className="btn-secondary sm:flex-1">
                                    Quay lại
                                </button>
                                <button type="button" onClick={handleSkipGoals} className="btn-secondary sm:flex-1">
                                    {SKIP_FOR_NOW}
                                </button>
                                <button type="button" onClick={() => goToStep(3)} className="btn-primary sm:flex-[1.2]">
                                    Tiếp tục
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {!isCoach && step === 3 ? (
                        <div className="space-y-4">
                            {EXPERIENCE_OPTIONS.map((level) => (
                                <button
                                    key={level.id}
                                    type="button"
                                    onClick={() => setExperience(level.id)}
                                    className={`w-full rounded-xl border p-4 text-left transition-colors ${experience === level.id ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{level.title}</h3>
                                            <p className="mt-1 text-sm leading-6 text-gray-600">{level.desc}</p>
                                        </div>
                                        <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${experience === level.id ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-transparent'}`}>
                                            <Check className="h-4 w-4" />
                                        </span>
                                    </div>
                                </button>
                            ))}

                            <div className="flex flex-col gap-3 pt-3 sm:flex-row">
                                <button type="button" onClick={() => goToStep(2)} className="btn-secondary sm:flex-1">
                                    Quay lại
                                </button>
                                <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary sm:flex-[1.2]">
                                    {loading ? 'Đang hoàn tất…' : 'Hoàn tất thiết lập'}
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {isCoach && step === 1 ? (
                        <div className="space-y-6">
                            {catalogQ.isLoading ? (
                                <p className="text-sm text-gray-500">Đang tải nhóm chuyên môn…</p>
                            ) : catalogQ.isError ? (
                                <p className="text-sm text-red-600">Không tải được danh sách. Vui lòng thử lại hoặc quay lại sau.</p>
                            ) : (
                                <ProfileCatalogSections
                                    sections={catalogSections}
                                    selected={selectedTerms}
                                    onToggleTerm={onToggleTerm}
                                />
                            )}

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => goToStep(2)}
                                    disabled={selectedTerms.size === 0}
                                    className="btn-primary sm:flex-1 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Tiếp tục
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        trackEvent('onboarding_skip', {
                                            step_id: 'coach_specialties',
                                            user_type: user.user_type,
                                        });
                                        goToStep(2);
                                    }}
                                    className="btn-secondary sm:flex-1"
                                >
                                    {SKIP_FOR_NOW}
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {isCoach && step === 2 ? (
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="coach-bio" className="form-label">
                                    Giới thiệu ngắn
                                </label>
                                <textarea
                                    id="coach-bio"
                                    rows={6}
                                    value={bio}
                                    onChange={(event) => setBio(event.target.value)}
                                    placeholder="Ví dụ: Tôi đồng hành với người cần giảm mỡ bền vững và lấy lại kỷ luật tập luyện."
                                    className="form-input resize-none"
                                />
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button type="button" onClick={() => goToStep(1)} className="btn-secondary sm:flex-1">
                                    Quay lại
                                </button>
                                <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary sm:flex-[1.2]">
                                    {loading ? 'Đang hoàn tất…' : 'Hoàn tất onboarding'}
                                </button>
                            </div>
                        </div>
                    ) : null}
                </section>
            </div>
        </div>
    );
}
