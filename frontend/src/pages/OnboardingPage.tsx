import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import apiClient from '../services/api';
import type { RootState } from '../store/store';
import { Check, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function OnboardingPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, accessToken, refreshToken } = useSelector((state: RootState) => state.auth);

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    
    // Form fields
    const [height, setHeight] = useState(170);
    const [weight, setWeight] = useState(65);
    const [experience, setExperience] = useState('beginner');
    const [bio, setBio] = useState('');
    const [specialties, setSpecialties] = useState<string[]>([]);

    const isCoach = user?.user_type === 'trainer';

    const handleNext = () => setStep(prev => prev + 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const data: any = {};
            if (isCoach) {
                data.bio = bio;
                data.specialties = specialties;
            } else {
                data.height_cm = height;
                data.current_weight_kg = weight;
                data.experience_level = experience;
            }

            const res = await apiClient.post('/auth/complete-onboarding', data);
            
            if (res.data.success) {
                // Update User in Redux
                if (accessToken) {
                    dispatch(setCredentials({
                        user: res.data.data.user,
                        access_token: accessToken,
                        refresh_token: refreshToken as string,
                    }));
                }
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Lỗi khi lưu thông tin:', err);
            alert('Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const toggleSpecialty = (sp: string) => {
        setSpecialties(prev => prev.includes(sp) ? prev.filter(i => i !== sp) : [...prev, sp]);
    };

    // If no user or already completed, don't show the form
    if (!user) return null;
    if (user.onboarding_completed) {
        navigate('/dashboard');
        return null;
    }

    return (
        <div className="flex min-h-screen bg-white">
            <Helmet><title>Thiết lập hồ sơ — GymViet</title></Helmet>
            
            {/* Left side: branding/image */}
            <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <p className="font-bold tracking-[0.2em] text-xs mb-8">GYMERVIET</p>
                    <h1 className="text-4xl font-black uppercase tracking-tight leading-none mb-6">
                        {isCoach ? 'Trở thành Huấn luyện viên hàng đầu' : 'Bắt đầu hành trình biến đổi cơ thể'}
                    </h1>
                    <p className="text-gray-400 max-w-md text-lg">
                        {isCoach 
                            ? 'Thiết lập hồ sơ chuyên nghiệp để bắt đầu nhận học viên và quản lý lớp học của bạn trên nền tảng GymViet.' 
                            : 'Cung cấp một số thông tin cơ bản để chúng tôi có thể cá nhân hóa lộ trình tập luyện tốt nhất dành cho bạn.'}
                    </p>
                </div>
                <div className="relative z-10 opacity-50">
                    <p className="text-sm font-mono tracking-widest uppercase">Bước {step} của {isCoach ? 2 : 3}</p>
                </div>
                {/* Abstract graphic */}
                <div className="absolute -bottom-[20%] -right-[10%] w-[80%] h-[80%] rounded-full border-[40px] border-zinc-900 opacity-50"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full border-[20px] border-zinc-800 opacity-50"></div>
            </div>

            {/* Right side: form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-8">
                    
                    {/* Athlete Flow */}
                    {!isCoach && step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tight text-black mb-2">Chỉ số cơ thể</h2>
                                <p className="text-gray-500 text-sm">Thông tin này giúp tính toán năng lượng (TDEE) và BMI của bạn.</p>
                            </div>
                            <div className="mt-8 space-y-6">
                                <div>
                                    <label className="flex justify-between font-bold text-sm mb-4">
                                        <span>Chiều cao</span>
                                        <span className="text-black">{height} cm</span>
                                    </label>
                                    <input 
                                        type="range" min="140" max="220" 
                                        value={height} onChange={(e) => setHeight(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" 
                                    />
                                </div>
                                <div>
                                    <label className="flex justify-between font-bold text-sm mb-4">
                                        <span>Cân nặng</span>
                                        <span className="text-black">{weight} kg</span>
                                    </label>
                                    <input 
                                        type="range" min="30" max="150" 
                                        value={weight} onChange={(e) => setWeight(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" 
                                    />
                                </div>
                                <button onClick={handleNext} className="btn-primary w-full group flex justify-between items-center mt-8">
                                    Tiếp tục <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    )}

                    {!isCoach && step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tight text-black mb-2">Kinh nghiệm</h2>
                                <p className="text-gray-500 text-sm">Bạn đã từng tập luyện nghiêm túc bao giờ chưa?</p>
                            </div>
                            <div className="mt-8 space-y-4">
                                {[
                                    { id: 'beginner', title: 'Người mới bắt đầu', desc: 'Chưa từng tập hoặc vừa mới bắt đầu' },
                                    { id: 'intermediate', title: 'Đã có kinh nghiệm', desc: 'Tập luyện đều đặn từ 6 tháng đến 2 năm' },
                                    { id: 'advanced', title: 'Nâng cao', desc: 'Tập luyện chuyên nghiệp trên 2 năm' },
                                ].map(lvl => (
                                    <div 
                                        key={lvl.id}
                                        onClick={() => setExperience(lvl.id)}
                                        className={`border-2 p-5 rounded-2xl cursor-pointer transition-all ${experience === lvl.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-black">{lvl.title}</h3>
                                                <p className="text-xs text-gray-500 mt-1">{lvl.desc}</p>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${experience === lvl.id ? 'border-black bg-black text-white' : 'border-gray-300'}`}>
                                                {experience === lvl.id && <Check className="w-4 h-4" />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setStep(1)} className="btn-secondary w-1/3">Quay lại</button>
                                    <button onClick={handleSubmit} disabled={loading} className="btn-primary w-2/3">
                                        {loading ? 'Đang xử lý...' : 'Hoàn tất'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* Coach Flow */}
                    {isCoach && step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tight text-black mb-2">Chuyên môn</h2>
                                <p className="text-gray-500 text-sm">Điểm mạnh huấn luyện của bạn là gì? (Chọn ít nhất 1)</p>
                            </div>
                            <div className="mt-8 grid grid-cols-2 gap-3">
                                {['Tăng cơ', 'Giảm mỡ', 'Powerlifting', 'Yoga', 'Pilates', 'Phục hồi chấn thương', 'Calisthenics', 'Thể lực (Endurance)'].map(sp => {
                                    const selected = specialties.includes(sp);
                                    return (
                                        <div 
                                            key={sp} onClick={() => toggleSpecialty(sp)}
                                            className={`border rounded-xl p-4 cursor-pointer text-center text-sm font-semibold transition-all ${selected ? 'bg-black text-white border-black' : 'bg-white text-black hover:bg-gray-50 border-gray-200'}`}
                                        >
                                            {sp}
                                        </div>
                                    )
                                })}
                            </div>
                            <button 
                                onClick={handleNext} 
                                disabled={specialties.length === 0}
                                className="btn-primary w-full mt-8 flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                Tiếp tục <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}

                    {isCoach && step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tight text-black mb-2">Giới thiệu bản thân</h2>
                                <p className="text-gray-500 text-sm">Thông tin này sẽ xuất hiện trên hồ sơ huấn luyện viên của bạn.</p>
                            </div>
                            <div className="mt-8 space-y-6">
                                <div>
                                    <textarea 
                                        rows={5}
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        placeholder="Ví dụ: Tôi là HLV chuyên về giảm mỡ và phục hồi thể lực sau chấn thương với hơn 5 năm kinh nghiệm..."
                                        className="form-input resize-none"
                                    ></textarea>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setStep(1)} className="btn-secondary w-1/3">Quay lại</button>
                                    <button onClick={handleSubmit} disabled={loading || !bio} className="btn-primary w-2/3 disabled:opacity-50">
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
