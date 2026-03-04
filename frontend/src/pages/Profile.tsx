import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../store/slices/authSlice';
import {
    fetchMyProfile,
    updateProfile,
    clearProfileMessages,
    addExperienceThunk,
    updateExperienceThunk,
    deleteExperienceThunk,
    addGalleryThunk,
    deleteGalleryThunk,
    addFAQThunk,
    updateFAQThunk,
    deleteFAQThunk,
} from '../store/slices/profileSlice';
import type { AppDispatch, RootState } from '../store/store';
import type { User, TrainerExperience, TrainerGallery, TrainerFAQ } from '../types';
import { ImageCropperModal } from '../components/ImageCropperModal';
import { uploadService } from '../services/uploadService';
import CreatableSelect from 'react-select/creatable';

// ── Schemas ────────────────────────────────────────────────────────────────
const profileSchema = z.object({
    full_name: z.string().min(2, 'Tên phải từ 2 ký tự').optional(),
    bio: z.string().max(500, 'Tối đa 500 ký tự').optional().nullable(),
    height_cm: z.number().min(100).max(250).optional().nullable(),
    current_weight_kg: z.number().min(30).max(200).optional().nullable(),
    experience_level: z.enum(['beginner', 'intermediate', 'advanced']).optional().nullable(),
    base_price_monthly: z.number().min(0).optional().nullable(),
    specialties: z.string().optional().nullable(),
});

const trainerProfileSchema = z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Chỉ các chữ cái thường không dấu, số và dấu nối (-), không có dấu nối liên tiếp hoặc ở hai đầu.').optional().nullable(),
    cover_image_url: z.string().url('URL không hợp lệ').optional().nullable().or(z.literal('')),
    headline: z.string().max(200).optional().nullable(),
    bio_short: z.string().max(500).optional().nullable(),
    bio_long: z.string().optional().nullable(),
    years_experience: z.number().min(0).max(60).optional().nullable(),
    clients_trained: z.number().min(0).optional().nullable(),
    success_stories: z.number().min(0).optional().nullable(),
    phone: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    is_accepting_clients: z.boolean().optional(),
    is_profile_public: z.boolean().optional(),
    facebook: z.string().url().optional().nullable().or(z.literal('')),
    instagram: z.string().url().optional().nullable().or(z.literal('')),
    youtube: z.string().url().optional().nullable().or(z.literal('')),
    tiktok: z.string().url().optional().nullable().or(z.literal('')),
    website: z.string().url().optional().nullable().or(z.literal('')),
    certifications_json: z.string().optional().nullable(),
});

type PersonalFormValues = z.infer<typeof profileSchema>;
type TrainerProfileFormValues = z.infer<typeof trainerProfileSchema>;
type ActiveTab = 'personal' | 'coach_profile' | 'experience' | 'gallery' | 'faq';

// ── Experience Form ───────────────────────────────────────────────────────────
function ExperienceTab() {
    const dispatch = useDispatch<AppDispatch>();
    const { experience, successMsg } = useSelector((s: RootState) => s.profile);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        title: '', organization: '', start_date: '', end_date: '',
        is_current: false, description: '', experience_type: 'work' as TrainerExperience['experience_type'],
    });

    const resetForm = () => setForm({
        title: '', organization: '', start_date: '', end_date: '',
        is_current: false, description: '', experience_type: 'work',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...form, end_date: form.is_current ? null : form.end_date || null };
        if (editingId) {
            dispatch(updateExperienceThunk({ id: editingId, data: payload }));
            setEditingId(null);
        } else {
            dispatch(addExperienceThunk(payload as any));
        }
        resetForm();
    };

    const startEdit = (exp: TrainerExperience) => {
        setEditingId(exp.id);
        setForm({
            title: exp.title, organization: exp.organization,
            start_date: exp.start_date?.slice(0, 10) || '',
            end_date: exp.end_date?.slice(0, 10) || '',
            is_current: exp.is_current,
            description: exp.description || '',
            experience_type: exp.experience_type,
        });
    };

    const typeLabels: Record<string, string> = {
        work: 'Công việc', education: 'Học vấn',
        certification: 'Chứng chỉ', achievement: 'Thành tích',
    };

    return (
        <div className="space-y-6">
            {successMsg && (
                <div className="bg-gray-50 border border-black text-black px-4 py-3 rounded-xs text-sm">
                    {successMsg}
                </div>
            )}
            {/* Form */}
            <div className="card">
                <h3 className="card-header">
                    {editingId ? 'Chỉnh sửa kinh nghiệm' : 'Thêm kinh nghiệm'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Chức danh / Tên khoá học</label>
                            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                required className="form-input" />
                        </div>
                        <div>
                            <label className="form-label">Tổ chức / Trường</label>
                            <input value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
                                required className="form-input" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="form-label">Loại</label>
                            <select value={form.experience_type} onChange={e => setForm(f => ({ ...f, experience_type: e.target.value as any }))}
                                className="form-input">
                                <option value="work">Công việc</option>
                                <option value="education">Học vấn</option>
                                <option value="certification">Chứng chỉ</option>
                                <option value="achievement">Thành tích</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Từ ngày</label>
                            <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                                required className="form-input" />
                        </div>
                        <div>
                            <label className="form-label">Đến ngày</label>
                            <input type="date" value={form.end_date} disabled={form.is_current}
                                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                                className="form-input" />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer w-fit">
                        <input type="checkbox" checked={form.is_current}
                            onChange={e => setForm(f => ({ ...f, is_current: e.target.checked, end_date: '' }))}
                            className="rounded-xs border-gray-300 text-black focus:ring-black" />
                        Vẫn đang diễn ra
                    </label>
                    <div>
                        <label className="form-label">Mô tả</label>
                        <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            className="form-input resize-none" />
                    </div>
                    <div className="flex gap-3 pt-2 border-t border-gray-200">
                        <button type="submit" className="btn-primary">
                            {editingId ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => { setEditingId(null); resetForm(); }}
                                className="btn-secondary">
                                Hủy
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* List */}
            {experience.length > 0 && (
                <div className="card">
                    <h3 className="card-header">Danh sách kinh nghiệm ({experience.length})</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="border-b border-gray-200 py-3 px-4 text-sm font-semibold text-black">Chức danh</th>
                                    <th className="border-b border-gray-200 py-3 px-4 text-sm font-semibold text-black">Tổ chức</th>
                                    <th className="border-b border-gray-200 py-3 px-4 text-sm font-semibold text-black">Loại</th>
                                    <th className="border-b border-gray-200 py-3 px-4 text-sm font-semibold text-black">Thời gian</th>
                                    <th className="border-b border-gray-200 py-3 px-4 text-sm font-semibold text-black text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {experience.map(exp => (
                                    <tr key={exp.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-black">
                                            {exp.title}
                                            {exp.is_current && <span className="ml-2 text-xs border border-black px-1.5 py-0.5 rounded-xs">Hiện tại</span>}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">{exp.organization}</td>
                                        <td className="py-3 px-4 text-sm text-gray-700">{typeLabels[exp.experience_type]}</td>
                                        <td className="py-3 px-4 text-sm text-gray-700">
                                            {exp.start_date?.slice(0, 7)} — {exp.is_current ? 'Nay' : exp.end_date?.slice(0, 7) || '?'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-right space-x-3">
                                            <button onClick={() => startEdit(exp)} className="font-medium text-black hover:underline">Sửa</button>
                                            <button onClick={() => dispatch(deleteExperienceThunk(exp.id))} className="font-medium text-gray-500 hover:text-black hover:underline">Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Gallery Form ──────────────────────────────────────────────────────────────
function GalleryTab() {
    const dispatch = useDispatch<AppDispatch>();
    const { gallery, successMsg } = useSelector((s: RootState) => s.profile);
    const [form, setForm] = useState({
        image_url: '', caption: '', image_type: 'workout' as TrainerGallery['image_type'], order_number: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(addGalleryThunk({ ...form, caption: form.caption || null }));
        setForm({ image_url: '', caption: '', image_type: 'workout', order_number: 0 });
    };

    const typeLabels: Record<string, string> = {
        transformation: 'Transformation', workout: 'Buổi tập', event: 'Sự kiện', certificate: 'Chứng chỉ', other: 'Khác',
    };

    return (
        <div className="space-y-6">
            {successMsg && (
                <div className="bg-gray-50 border border-black text-black px-4 py-3 rounded-xs text-sm">
                    {successMsg}
                </div>
            )}

            {/* Form */}
            <div className="card">
                <h3 className="card-header">Thêm ảnh vào gallery</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="form-label">URL ảnh</label>
                        <input type="url" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                            required placeholder="https://..."
                            className="form-input" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Loại ảnh</label>
                            <select value={form.image_type} onChange={e => setForm(f => ({ ...f, image_type: e.target.value as any }))}
                                className="form-input">
                                <option value="workout">Buổi tập</option>
                                <option value="transformation">Transformation</option>
                                <option value="event">Sự kiện</option>
                                <option value="certificate">Chứng chỉ</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Chú thích</label>
                            <input value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
                                placeholder="Mô tả ngắn..."
                                className="form-input" />
                        </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                        <button type="submit" className="btn-primary">
                            Thêm ảnh
                        </button>
                    </div>
                </form>
            </div>

            {/* Grid */}
            {gallery.length > 0 && (
                <div className="card">
                    <h3 className="card-header">Gallery ({gallery.length} ảnh)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {gallery.map(img => (
                            <div key={img.id} className="relative group border border-gray-200 rounded-xs overflow-hidden aspect-square bg-gray-50">
                                <img src={img.image_url} alt={img.caption || 'gallery'}
                                    className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 border border-black m-1">
                                    <div>
                                        <span className="text-xs font-semibold text-black uppercase tracking-wider">{typeLabels[img.image_type]}</span>
                                        {img.caption && <p className="text-sm text-gray-700 mt-1 line-clamp-3">{img.caption}</p>}
                                    </div>
                                    <button onClick={() => dispatch(deleteGalleryThunk(img.id))}
                                        className="text-sm font-medium text-black underline mt-auto self-start">
                                        Xóa ảnh
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── FAQ Form ──────────────────────────────────────────────────────────────────
function FAQTab() {
    const dispatch = useDispatch<AppDispatch>();
    const { faq, successMsg } = useSelector((s: RootState) => s.profile);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [openId, setOpenId] = useState<string | null>(null);
    const [form, setForm] = useState({ question: '', answer: '', order_number: 0 });

    const resetForm = () => setForm({ question: '', answer: '', order_number: 0 });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            dispatch(updateFAQThunk({ id: editingId, data: form }));
            setEditingId(null);
        } else {
            dispatch(addFAQThunk(form));
        }
        resetForm();
    };

    const startEdit = (f: TrainerFAQ) => {
        setEditingId(f.id);
        setForm({ question: f.question, answer: f.answer, order_number: f.order_number });
    };

    return (
        <div className="space-y-6">
            {successMsg && (
                <div className="bg-gray-50 border border-black text-black px-4 py-3 rounded-xs text-sm">
                    {successMsg}
                </div>
            )}

            {/* Form */}
            <div className="card">
                <h3 className="card-header">
                    {editingId ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi thường gặp'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="form-label">Câu hỏi</label>
                        <input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                            required placeholder="VD: Tôi cần tập mấy buổi/tuần?"
                            className="form-input" />
                    </div>
                    <div>
                        <label className="form-label">Câu trả lời</label>
                        <textarea rows={4} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                            required placeholder="Trả lời chi tiết..."
                            className="form-input resize-none" />
                    </div>
                    <div className="flex gap-3 pt-2 border-t border-gray-200">
                        <button type="submit" className="btn-primary">
                            {editingId ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => { setEditingId(null); resetForm(); }}
                                className="btn-secondary">Hủy</button>
                        )}
                    </div>
                </form>
            </div>

            {/* Accordion list */}
            {faq.length > 0 && (
                <div className="card">
                    <h3 className="card-header">Danh sách câu hỏi thường gặp ({faq.length})</h3>
                    <div className="border border-gray-200 rounded-xs divide-y divide-gray-200">
                        {faq.map(item => (
                            <div key={item.id} className="bg-white">
                                <button
                                    onClick={() => setOpenId(openId === item.id ? null : item.id)}
                                    className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                                >
                                    <span className="text-sm text-black font-medium">{item.question}</span>
                                    <span className="text-gray-500 font-mono text-xs">{openId === item.id ? '-' : '+'}</span>
                                </button>
                                {openId === item.id && (
                                    <div className="px-4 pb-4 pt-1 bg-gray-50">
                                        <p className="text-gray-700 text-sm whitespace-pre-line mb-3">{item.answer}</p>
                                        <div className="flex gap-4">
                                            <button onClick={() => startEdit(item)} className="text-sm font-medium text-black hover:underline">Sửa</button>
                                            <button onClick={() => dispatch(deleteFAQThunk(item.id))} className="text-sm font-medium text-gray-500 hover:text-black hover:underline">Xóa</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Profile() {
    const { user } = useSelector((state: RootState) => state.auth);
    const { myProfile, saving, error: profileError, successMsg } = useSelector(
        (state: RootState) => state.profile
    );
    const dispatch = useDispatch<AppDispatch>();
    const [successMsgPersonal, setSuccessMsgPersonal] = useState('');
    const [activeTab, setActiveTab] = useState<ActiveTab>('personal');
    const [certsError, setCertsError] = useState('');

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

    // Upload state
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImageFile(file);
            setIsCropModalOpen(true);
        }
        // Reset input so the same file can be selected again if needed
        if (e.target) e.target.value = '';
    };


    const headlineOptions = [
        { value: 'Fitness Coach', label: 'Fitness Coach' },
        { value: 'Yoga Instructor', label: 'Yoga Instructor' },
        { value: 'Rehab Specialist', label: 'Rehab Specialist' },
        { value: 'Strength & Conditioning Coach', label: 'Strength & Conditioning Coach' },
        { value: 'Pilates Teacher', label: 'Pilates Teacher' },
        { value: 'Bodybuilding Coach', label: 'Bodybuilding Coach' },
    ];

    // ── Personal form ──────────────────────────────────────────────────────────
    const {
        register: regPersonal,
        handleSubmit: handlePersonal,
        formState: { errors: errorsPersonal },
    } = useForm<PersonalFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: user?.full_name || '',
            bio: user?.bio || '',
            height_cm: user?.height_cm || null,
            current_weight_kg: user?.current_weight_kg || null,
            experience_level: (user?.experience_level as any) || 'beginner',
            base_price_monthly: user?.base_price_monthly || null,
            specialties: user?.specialties ? user.specialties.join(', ') : '',
        },
    });

    const mutationPersonal = useMutation({
        mutationFn: userService.updateProfile,
        onSuccess: (updatedUser: User) => {
            dispatch(setUser(updatedUser));
            setSuccessMsgPersonal('Đã cập nhật thông tin thành công.');
            setTimeout(() => setSuccessMsgPersonal(''), 3000);
        },
    });

    const onSubmitPersonal = (data: PersonalFormValues) => {
        const specialtiesArray = data.specialties
            ? data.specialties.split(',').map((s) => s.trim()).filter(Boolean)
            : null;
        mutationPersonal.mutate({ ...data, specialties: specialtiesArray });
    };

    // ── Trainer Profile form ───────────────────────────────────────────────────
    const {
        register: regProfile,
        handleSubmit: handleProfile,
        setValue: setProfileValue,
        watch: watchProfile,
        reset: resetProfileForm,
        formState: { errors: errorsProfile },
    } = useForm<TrainerProfileFormValues>({
        resolver: zodResolver(trainerProfileSchema),
        defaultValues: {
            slug: myProfile?.slug || '',
            cover_image_url: myProfile?.cover_image_url || '',
            headline: myProfile?.headline || '',
            bio_short: myProfile?.bio_short || '',
            bio_long: myProfile?.bio_long || '',
            years_experience: myProfile?.years_experience || null,
            clients_trained: myProfile?.clients_trained || null,
            success_stories: myProfile?.success_stories || null,
            phone: myProfile?.phone || '',
            location: myProfile?.location || '',
            is_accepting_clients: myProfile?.is_accepting_clients ?? true,
            is_profile_public: myProfile?.is_profile_public ?? true,
            facebook: myProfile?.social_links?.facebook || '',
            instagram: myProfile?.social_links?.instagram || '',
            youtube: myProfile?.social_links?.youtube || '',
            tiktok: myProfile?.social_links?.tiktok || '',
            website: myProfile?.social_links?.website || '',
            certifications_json: myProfile?.certifications
                ? JSON.stringify(myProfile.certifications, null, 2)
                : '',
        },
    });

    // BUG-09: Fix form re-population when myProfile data is fetched asynchronously
    useEffect(() => {
        if (myProfile) {
            resetProfileForm({
                slug: myProfile.slug || '',
                cover_image_url: myProfile.cover_image_url || '',
                headline: myProfile.headline || '',
                bio_short: myProfile.bio_short || '',
                bio_long: myProfile.bio_long || '',
                years_experience: myProfile.years_experience || null,
                clients_trained: myProfile.clients_trained || null,
                success_stories: myProfile.success_stories || null,
                phone: myProfile.phone || '',
                location: myProfile.location || '',
                is_accepting_clients: myProfile.is_accepting_clients ?? true,
                is_profile_public: myProfile.is_profile_public ?? true,
                facebook: myProfile.social_links?.facebook || '',
                instagram: myProfile.social_links?.instagram || '',
                youtube: myProfile.social_links?.youtube || '',
                tiktok: myProfile.social_links?.tiktok || '',
                website: myProfile.social_links?.website || '',
                certifications_json: myProfile.certifications
                    ? JSON.stringify(myProfile.certifications, null, 2)
                    : '',
            });
        }
    }, [myProfile, resetProfileForm]);

    const onSubmitProfile = (data: TrainerProfileFormValues) => {
        setCertsError('');
        let certifications = null;
        if (data.certifications_json?.trim()) {
            try {
                certifications = JSON.parse(data.certifications_json);
            } catch {
                setCertsError('JSON chứng chỉ không hợp lệ. Vui lòng kiểm tra lại cấu trúc.');
                return;
            }
        }
        const social_links = {
            facebook: data.facebook || null,
            instagram: data.instagram || null,
            youtube: data.youtube || null,
            tiktok: data.tiktok || null,
            website: data.website || null,
        };
        dispatch(updateProfile({
            slug: data.slug || null,
            cover_image_url: data.cover_image_url || null,
            headline: data.headline || null,
            bio_short: data.bio_short || null,
            bio_long: data.bio_long || null,
            years_experience: data.years_experience,
            clients_trained: data.clients_trained,
            success_stories: data.success_stories,
            phone: data.phone || null,
            location: data.location || null,
            is_accepting_clients: data.is_accepting_clients,
            is_profile_public: data.is_profile_public,
            social_links,
            certifications,
        } as any));
    };

    // Fix the previous mock onChange by using real setValue
    const handleCropCompleteReal = async (croppedBlob: Blob) => {
        setIsUploading(true);
        try {
            const originalName = selectedImageFile?.name || 'cover.jpg';
            const url = await uploadService.uploadImage(croppedBlob, 'covers', originalName);
            setProfileValue('cover_image_url', url, { shouldValidate: true, shouldDirty: true });
        } catch (error) {
            alert('Upload ảnh thất bại! Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
            setSelectedImageFile(null);
        }
    };

    if (!user) return <div className="p-8 text-black">Vui lòng đăng nhập.</div>;

    const proTabs: { key: ActiveTab; label: string }[] = [
        { key: 'personal', label: 'Cá nhân' },
        { key: 'coach_profile', label: user.user_type === 'athlete' ? 'Hồ sơ VĐV (Public)' : 'Hồ sơ Coach (Public)' },
        { key: 'experience', label: user.user_type === 'athlete' ? 'Thành tích/Giải đấu' : 'Kinh nghiệm' },
        { key: 'gallery', label: 'Gallery' },
        { key: 'faq', label: 'FAQ' },
    ];

    const normalTabs: { key: ActiveTab; label: string }[] = [
        { key: 'personal', label: 'Thông tin cá nhân' },
    ];

    const tabs = (user.user_type === 'trainer' || user.user_type === 'athlete') ? proTabs : normalTabs;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 pt-6">
                    <div className="flex justify-between items-baseline mb-6">
                        <h1 className="text-h1">Quản lý Hồ sơ</h1>
                        <div className="flex items-center gap-4">
                            {user.user_type === 'trainer' && myProfile?.is_profile_public && (
                                <Link to={`/trainer/${user.id}`} className="text-sm font-medium text-black hover:underline underline-offset-4" target="_blank">
                                    Xem trang public ↗
                                </Link>
                            )}
                            <Link to="/dashboard" className="text-sm text-gray-600 hover:text-black">Quay lại Dashboard</Link>
                        </div>
                    </div>

                    {/* Tabs Framework */}
                    <div className="flex gap-6 border-b border-gray-200">
                        {tabs.map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`pb-3 text-sm font-medium transition-colors border-b-2 bg-transparent focus:outline-none ${activeTab === tab.key
                                    ? 'border-black text-black'
                                    : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
                                    }`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-4xl w-full mx-auto px-4 py-8">

                {/* ── TAB: PERSONAL ───────────────────────────────────────────── */}
                {activeTab === 'personal' && (
                    <div className="card">
                        <h2 className="card-header">Thông tin chung</h2>

                        {successMsgPersonal && (
                            <div className="mb-6 bg-gray-50 border border-black text-black px-4 py-3 rounded-xs text-sm">
                                {successMsgPersonal}
                            </div>
                        )}
                        {mutationPersonal.isError && (
                            <div className="mb-6 bg-gray-50 border border-gray-400 text-black px-4 py-3 rounded-xs text-sm">
                                Lỗi khi lưu thông tin.
                            </div>
                        )}

                        <form onSubmit={handlePersonal(onSubmitPersonal)} className="space-y-6">
                            <div>
                                <label className="form-label">Họ và tên</label>
                                <input type="text" {...regPersonal('full_name')} className="form-input" />
                                {errorsPersonal.full_name && <p className="form-helper">{errorsPersonal.full_name.message}</p>}
                            </div>

                            <div>
                                <label className="form-label">Giới thiệu bản thân</label>
                                <textarea rows={4} {...regPersonal('bio')} placeholder="Viết một đoạn ngắn giới thiệu về bản thân..."
                                    className="form-input resize-none" />
                            </div>

                            {user.user_type === 'athlete' && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-gray-200 mt-6">
                                    <div>
                                        <label className="form-label">Chiều cao (cm)</label>
                                        <input type="number" {...regPersonal('height_cm', { valueAsNumber: true })} className="form-input" />
                                    </div>
                                    <div>
                                        <label className="form-label">Cân nặng (kg)</label>
                                        <input type="number" step="0.1" {...regPersonal('current_weight_kg', { valueAsNumber: true })} className="form-input" />
                                    </div>
                                    <div>
                                        <label className="form-label">Trình độ</label>
                                        <select {...regPersonal('experience_level')} className="form-input">
                                            <option value="beginner">Mới bắt đầu</option>
                                            <option value="intermediate">Có kinh nghiệm</option>
                                            <option value="advanced">Lão luyện</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                            {user.user_type === 'trainer' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                                    <div>
                                        <label className="form-label">Giá dịch vụ tham khảo (₫/tháng)</label>
                                        <input type="number" {...regPersonal('base_price_monthly', { valueAsNumber: true })} className="form-input" />
                                    </div>
                                    <div>
                                        <label className="form-label">Chuyên môn (cách nhau bởi dấu phẩy)</label>
                                        <input type="text" {...regPersonal('specialties')} placeholder="Yoga, Giảm cân, Tăng cơ..." className="form-input" />
                                    </div>
                                </div>
                            )}
                            <div className="pt-6 border-t border-gray-200 flex justify-end">
                                <button type="submit" disabled={mutationPersonal.isPending} className="btn-primary min-w-[120px]">
                                    {mutationPersonal.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── TAB: COACH PROFILE ───────────────────────────────────────── */}
                {activeTab === 'coach_profile' && (user.user_type === 'trainer' || user.user_type === 'athlete') && (
                    <form onSubmit={handleProfile(onSubmitProfile)} className="space-y-6">
                        {successMsg && (
                            <div className="bg-gray-50 border border-black text-black px-4 py-3 rounded-xs text-sm">
                                {successMsg}
                            </div>
                        )}
                        {profileError && (
                            <div className="bg-gray-50 border border-gray-400 text-gray-800 px-4 py-3 rounded-xs text-sm">
                                Lỗi: {profileError}
                            </div>
                        )}

                        <div className="card">
                            <h2 className="card-header">URL & Hiển thị</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="form-label">Profile URL slug</label>
                                    <div className="flex border border-gray-200 rounded-xs bg-gray-50 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition overflow-hidden">
                                        <span className="px-3 py-2.5 text-gray-500 text-sm border-r border-gray-200 select-none">gymerviet.com/coach/</span>
                                        <input type="text" {...regProfile('slug')} placeholder="ten-coach"
                                            className="flex-1 bg-white outline-none px-3 text-sm text-black w-full" />
                                    </div>
                                    {errorsProfile.slug && <p className="form-helper text-red-600">{errorsProfile.slug.message}</p>}
                                </div>
                                <div>
                                    <label className="form-label">Ảnh bìa (Cover Image)</label>
                                    <div className="flex flex-col gap-3">
                                        {watchProfile('cover_image_url') ? (
                                            <div className="relative w-full aspect-[21/9] bg-gray-100 border border-gray-200 rounded overflow-hidden">
                                                <img src={watchProfile('cover_image_url') || ''} alt="Cover Preview" className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => setProfileValue('cover_image_url', '')} className="absolute top-2 right-2 bg-white/90 text-black px-2 py-1 rounded text-xs font-medium hover:bg-white transition shadow">
                                                    Xóa ảnh
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-full aspect-[21/9] bg-gray-50 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-500">
                                                <span className="text-sm">Chưa có ảnh bìa</span>
                                            </div>
                                        )}
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="btn-secondary w-fit text-sm">
                                            {isUploading ? 'Đang tải lên...' : 'Tải lên từ thiết bị'}
                                        </button>
                                        <input type="hidden" {...regProfile('cover_image_url')} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t border-gray-200">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" {...regProfile('is_profile_public')} className="rounded-xs text-black border-gray-300 focus:ring-black" />
                                    <span className="text-sm font-medium text-black">Cho phép tìm thấy profile public</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" {...regProfile('is_accepting_clients')} className="rounded-xs text-black border-gray-300 focus:ring-black" />
                                    <span className="text-sm font-medium text-black">Trạng thái: Đang nhận học viên mới</span>
                                </label>
                            </div>
                        </div>

                        <div className="card">
                            <h2 className="card-header">Giới thiệu</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="form-label">Headline (Chức danh chính)</label>
                                    <CreatableSelect
                                        isClearable
                                        options={headlineOptions}
                                        value={watchProfile('headline') ? { label: watchProfile('headline'), value: watchProfile('headline') } : null}
                                        onChange={(newValue) => setProfileValue('headline', newValue ? newValue.value : '', { shouldDirty: true })}
                                        placeholder="Chọn hoặc gõ chức danh mới..."
                                        className="text-sm"
                                        classNamePrefix="react-select"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderColor: '#e5e7eb',
                                                borderRadius: '2px', // rounded-xs equivalent roughly
                                                padding: '2px',
                                                boxShadow: 'none',
                                                '&:hover': {
                                                    borderColor: '#000'
                                                }
                                            }),
                                            option: (base, state) => ({
                                                ...base,
                                                backgroundColor: state.isSelected ? '#000' : state.isFocused ? '#f3f4f6' : 'white',
                                                color: state.isSelected ? 'white' : 'black',
                                                '&:active': {
                                                    backgroundColor: '#e5e7eb'
                                                }
                                            })
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Tóm tắt ngắn (1-2 câu)</label>
                                    <textarea rows={2} {...regProfile('bio_short')} placeholder="Hiển thị ở đầu trang..." className="form-input resize-none" />
                                </div>
                                <div>
                                    <label className="form-label">Giới thiệu chi tiết</label>
                                    <textarea rows={6} {...regProfile('bio_long')} placeholder="Câu chuyện, phương pháp, triết lý đào tạo..." className="form-input resize-none" />
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h2 className="card-header">Số liệu nghề nghiệp</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div>
                                    <label className="form-label">Số năm kinh nghiệm</label>
                                    <input type="number" min={0} {...regProfile('years_experience', { valueAsNumber: true })} className="form-input" />
                                </div>
                                <div>
                                    <label className="form-label">Số học viên đã dạy</label>
                                    <input type="number" min={0} {...regProfile('clients_trained', { valueAsNumber: true })} className="form-input" />
                                </div>
                                <div>
                                    <label className="form-label">Câu chuyện thành công</label>
                                    <input type="number" min={0} {...regProfile('success_stories', { valueAsNumber: true })} className="form-input" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                                <div>
                                    <label className="form-label">Địa điểm hoạt động (Tỉnh/Thành)</label>
                                    <input type="text" {...regProfile('location')} placeholder="Hà Nội, TP. Hồ Chí Minh..." className="form-input" />
                                </div>
                                <div>
                                    <label className="form-label">Số điện thoại liên hệ (Tuỳ chọn)</label>
                                    <input type="text" {...regProfile('phone')} placeholder="+84..." className="form-input" />
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h2 className="card-header">Mạng xã hội</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(['facebook', 'instagram', 'youtube', 'tiktok', 'website'] as const).map((sn) => (
                                    <div key={sn}>
                                        <label className="form-label capitalize">{sn}</label>
                                        <input type="url" {...regProfile(sn)} placeholder={`https://${sn}.com/...`} className="form-input" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card">
                            <h2 className="card-header border-none pb-0 mb-2">Chứng chỉ & Bằng cấp</h2>
                            <p className="text-xs text-gray-500 mb-4">
                                Khai báo dưới dạng Array JSON. Cấu trúc yêu cầu: <code className="ml-1 px-1 py-0.5 bg-gray-100 border border-gray-200 rounded">{`[{"name":"...", "issuer":"...", "year": 2024, "url": "..."}]`}</code>
                            </p>
                            <textarea rows={6} {...regProfile('certifications_json')}
                                placeholder='[
  {
    "name": "NASM CPT",
    "issuer": "NASM",
    "year": 2020,
    "url": "https://url.to/cert"
  }
]'
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xs text-sm font-mono text-gray-800 focus:outline-none focus:border-black resize-vertical" />
                            {certsError && <p className="form-helper text-red-600 font-medium">{certsError}</p>}
                        </div>

                        <div className="flex justify-end pt-4 pb-12">
                            <button type="submit" disabled={saving} className="btn-primary min-w-[160px] py-3 text-base">
                                {saving ? 'Đang lưu...' : 'Lưu hồ sơ Public'}
                            </button>
                        </div>
                    </form>
                )}

                {/* ── TAB: EXPERIENCE ─────────────────────────────────────────── */}
                {activeTab === 'experience' && (user.user_type === 'trainer' || user.user_type === 'athlete') && <ExperienceTab />}

                {/* ── TAB: GALLERY ────────────────────────────────────────────── */}
                {activeTab === 'gallery' && (user.user_type === 'trainer' || user.user_type === 'athlete') && <GalleryTab />}

                {/* ── TAB: FAQ ────────────────────────────────────────────────── */}
                {activeTab === 'faq' && (user.user_type === 'trainer' || user.user_type === 'athlete') && <FAQTab />}

                {/* Modals outside form flow */}
                <ImageCropperModal
                    isOpen={isCropModalOpen}
                    onClose={() => {
                        setIsCropModalOpen(false);
                        setSelectedImageFile(null);
                    }}
                    imageFile={selectedImageFile}
                    onCropComplete={handleCropCompleteReal}
                    aspectRatio={21 / 9} // Ultra-wide banner format for cover
                    title="Cắt ảnh bìa (Cover Image)"
                />

            </main>
        </div>
    );
}
