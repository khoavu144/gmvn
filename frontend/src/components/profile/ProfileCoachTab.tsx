import { useToast } from '../../components/Toast';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { updateProfile } from '../../store/slices/profileSlice';
import type { AppDispatch } from '../../store/store';
import { uploadService } from '../../services/uploadService';
import type { TrainerProfile } from '../../types';
import CreatableSelect from 'react-select/creatable';
import { VIETNAM_PROVINCES } from '../../utils/provinces';
import { ImageCropperModal } from '../../components/ImageCropperModal';

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
    profile_template: z.enum(['card', 'hero']).optional(),
    theme_color: z.enum(['light', 'dark']).optional(),
    facebook: z.string().url().optional().nullable().or(z.literal('')),
    instagram: z.string().url().optional().nullable().or(z.literal('')),
    youtube: z.string().url().optional().nullable().or(z.literal('')),
    tiktok: z.string().url().optional().nullable().or(z.literal('')),
    website: z.string().url().optional().nullable().or(z.literal('')),
    certifications_json: z.string().optional().nullable(),
});

type TrainerProfileFormValues = z.infer<typeof trainerProfileSchema>;

interface Props {
    myProfile: TrainerProfile | null;
    saving: boolean;
    error: string | null;
    successMsg: string | null;
    publicBasePath?: '/coach' | '/athletes';
}

const headlineOptions = [
    { value: 'Huấn luyện viên thể hình', label: 'Huấn luyện viên thể hình' },
    { value: 'Huấn luyện viên yoga', label: 'Huấn luyện viên yoga' },
    { value: 'Chuyên gia phục hồi', label: 'Chuyên gia phục hồi' },
    { value: 'Huấn luyện viên sức mạnh & thể lực', label: 'Huấn luyện viên sức mạnh & thể lực' },
    { value: 'Giảng viên pilates', label: 'Giảng viên pilates' },
    { value: 'Huấn luyện viên hình thể', label: 'Huấn luyện viên hình thể' },
];

export function ProfileCoachTab({ myProfile, saving, error: profileError, successMsg, publicBasePath = '/coach' }: Props) {
    const { toast, ToastComponent } = useToast();
    const dispatch = useDispatch<AppDispatch>();
    const [certsError, setCertsError] = useState('');
    const profilePathLabel = publicBasePath === '/athletes' ? 'gymerviet.com/athlete/' : 'gymerviet.com/coach/';

    // Upload state
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            profile_template: myProfile?.profile_template || 'card',
            theme_color: (myProfile?.theme_color as 'light' | 'dark') || 'light',
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
                profile_template: myProfile.profile_template || 'card',
                theme_color: (myProfile.theme_color as 'light' | 'dark') || 'light',
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImageFile(file);
            setIsCropModalOpen(true);
        }
        if (e.target) e.target.value = '';
    };

    const handleCropCompleteReal = async (croppedBlob: Blob) => {
        setIsUploading(true);
        try {
            const originalName = selectedImageFile?.name || 'cover.jpg';
            const url = await uploadService.uploadImage(croppedBlob, 'covers', originalName);
            setProfileValue('cover_image_url', url, { shouldValidate: true, shouldDirty: true });
        } catch {
            toast.error('Tải ảnh thất bại! Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
            setSelectedImageFile(null);
        }
    };

    const onSubmitProfile = (data: TrainerProfileFormValues) => {
        setCertsError('');
        let certifications = null;
        if (data.certifications_json?.trim()) {
            try {
                certifications = JSON.parse(data.certifications_json);
            } catch {
                setCertsError('Danh sách chứng chỉ không hợp lệ. Vui lòng kiểm tra lại trước khi lưu.');
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
            profile_template: data.profile_template || 'card',
            theme_color: data.theme_color || 'light',
            social_links,
            certifications,
        } as any));
    };

    return (
        <>
            {ToastComponent}
            <form onSubmit={handleProfile(onSubmitProfile)} className="space-y-6">
                {successMsg && (
                    <div className="bg-gray-50 border border-black text-black px-4 py-3 rounded-xs text-sm">
                        {successMsg}
                    </div>
                )}
                {profileError && (
                    <div className="bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xs text-sm">
                        Lỗi: {profileError}
                    </div>
                )}

                <div className="card">
                    <h2 className="card-header">URL & Hiển thị</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label htmlFor="coach-slug" className="form-label">Đường dẫn hồ sơ</label>
                            <div className="flex border border-gray-200 rounded-xs bg-gray-50 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition overflow-hidden">
                                <span className="px-3 py-2.5 text-gray-500 text-sm border-r border-gray-200 select-none">{profilePathLabel}</span>
                                <input id="coach-slug" type="text" {...regProfile('slug')} placeholder="ten-user"
                                    className="flex-1 bg-white outline-none px-3 text-sm text-black w-full" />
                            </div>
                            {errorsProfile.slug && <p className="form-helper text-red-600">{errorsProfile.slug.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="coach-cover-upload" className="form-label">Ảnh bìa hồ sơ</label>
                            <div className="flex flex-col gap-3">
                                {watchProfile('cover_image_url') ? (
                                    <div className="relative w-full aspect-[21/9] bg-gray-50 border border-gray-200 rounded overflow-hidden">
                                        <img src={watchProfile('cover_image_url') || ''} alt="Xem trước ảnh bìa" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => setProfileValue('cover_image_url', '')} className="absolute top-2 right-2 bg-white/90 text-black px-2 py-1 rounded text-xs font-medium hover:bg-white transition shadow">
                                            Xóa ảnh
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full aspect-[21/9] bg-gray-50 border-2 border-dashed border-gray-200 rounded flex flex-col items-center justify-center text-gray-500">
                                        <span className="text-sm">Chưa có ảnh bìa</span>
                                    </div>
                                )}
                                <input id="coach-cover-upload" type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="btn-secondary w-fit text-sm">
                                    {isUploading ? 'Đang tải lên...' : 'Tải lên từ thiết bị'}
                                </button>
                                <input type="hidden" {...regProfile('cover_image_url')} />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t border-gray-200">
                        <label htmlFor="coach-is-public" className="flex items-center gap-2 cursor-pointer">
                            <input id="coach-is-public" type="checkbox" {...regProfile('is_profile_public')} className="rounded-xs text-black border-gray-200 focus:ring-black" />
                            <span className="text-sm font-medium text-black">Hiển thị hồ sơ công khai</span>
                        </label>
                        <label htmlFor="coach-accepting-clients" className="flex items-center gap-2 cursor-pointer">
                            <input id="coach-accepting-clients" type="checkbox" {...regProfile('is_accepting_clients')} className="rounded-xs text-black border-gray-200 focus:ring-black" />
                            <span className="text-sm font-medium text-black">Đang nhận học viên mới</span>
                        </label>
                    </div>

                    {/* Template & Theme Settings */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-200 mt-4">
                        <div>
                            <label htmlFor="coach-profile-template-card" className="form-label">Bố cục hồ sơ công khai</label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                {[
                                    { value: 'card', label: 'Dạng thẻ cuộn', desc: 'Điều hướng ghim, thanh kỹ năng và bảng giá' },
                                    { value: 'hero', label: 'Bố cục nổi bật', desc: 'Phần mở đầu lớn và các mục nội dung toàn chiều rộng' },
                                ].map(opt => (
                                    <label key={opt.value} className="cursor-pointer">
                                        <input id={`coach-profile-template-${opt.value}`} type="radio" value={opt.value} {...regProfile('profile_template')} className="sr-only" />
                                        <div className={`p-3 border text-left transition-colors ${watchProfile('profile_template') === opt.value ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-200'}`}>
                                            <p className="text-xs font-bold">{opt.label}</p>
                                            <p className={`text-[10px] mt-0.5 ${watchProfile('profile_template') === opt.value ? 'text-gray-500' : 'text-gray-500'}`}>{opt.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="coach-theme-color-light" className="form-label">Chế độ màu hồ sơ</label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                {[
                                    { value: 'light', label: 'Sáng', desc: 'Nền sáng, chữ đậm' },
                                    { value: 'dark', label: 'Tối', desc: 'Nền tối, chữ sáng' },
                                ].map(opt => (
                                    <label key={opt.value} className="cursor-pointer">
                                        <input id={`coach-theme-color-${opt.value}`} type="radio" value={opt.value} {...regProfile('theme_color')} className="sr-only" />
                                        <div className={`p-3 border text-left transition-colors ${watchProfile('theme_color') === opt.value ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-200'}`}>
                                            <p className="text-xs font-bold">{opt.label}</p>
                                            <p className={`text-[10px] mt-0.5 ${watchProfile('theme_color') === opt.value ? 'text-gray-500' : 'text-gray-500'}`}>{opt.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Preview Link */}
                    {watchProfile('slug') && (
                        <div className="pt-4 border-t border-gray-200 mt-4 flex items-center gap-3">
                            <span className="text-xs text-gray-500">Liên kết hồ sơ của bạn:</span>
                            <a
                                href={`${publicBasePath}/${watchProfile('slug')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-black underline underline-offset-2 hover:text-gray-600 transition-colors"
                            >
                                {publicBasePath}/{watchProfile('slug')} ↗
                            </a>
                        </div>
                    )}
                </div>

                <div className="card">
                    <h2 className="card-header">Giới thiệu</h2>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="coach-headline-select" className="form-label">Chức danh chính</label>
                            <CreatableSelect
                                isClearable
                                options={headlineOptions}
                                value={watchProfile('headline') ? { label: watchProfile('headline'), value: watchProfile('headline') } : null}
                                onChange={(newValue) => setProfileValue('headline', newValue ? newValue.value : '', { shouldDirty: true })}
                                placeholder="Chọn hoặc nhập chức danh..."
                                className="text-sm"
                                classNamePrefix="react-select"
                                inputId="coach-headline-select"
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
                            <label htmlFor="coach-bio-short" className="form-label">Tóm tắt ngắn (1-2 câu)</label>
                            <textarea id="coach-bio-short" rows={2} {...regProfile('bio_short')} placeholder="Hiển thị ở đầu trang..." className="form-input resize-none" />
                        </div>
                        <div>
                            <label htmlFor="coach-bio-long" className="form-label">Giới thiệu chi tiết</label>
                            <textarea id="coach-bio-long" rows={6} {...regProfile('bio_long')} placeholder="Câu chuyện, phương pháp, triết lý đào tạo..." className="form-input resize-none" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h2 className="card-header">Số liệu nghề nghiệp</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label htmlFor="coach-years-experience" className="form-label">Số năm kinh nghiệm</label>
                            <input id="coach-years-experience" type="number" min={0} {...regProfile('years_experience', { valueAsNumber: true })} className="form-input" />
                        </div>
                        <div>
                            <label htmlFor="coach-clients-trained" className="form-label">Số học viên đã dạy</label>
                            <input id="coach-clients-trained" type="number" min={0} {...regProfile('clients_trained', { valueAsNumber: true })} className="form-input" />
                        </div>
                        <div>
                            <label htmlFor="coach-success-stories" className="form-label">Câu chuyện thành công</label>
                            <input id="coach-success-stories" type="number" min={0} {...regProfile('success_stories', { valueAsNumber: true })} className="form-input" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                        <div>
                            <label htmlFor="coach-location" className="form-label">Địa điểm hoạt động (Tỉnh/Thành)</label>
                            <select id="coach-location" {...regProfile('location')} className="form-input">
                                <option value="">-- Chọn tỉnh/thành --</option>
                                {VIETNAM_PROVINCES.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="coach-phone" className="form-label">Số điện thoại liên hệ (Tuỳ chọn)</label>
                            <input id="coach-phone" type="text" {...regProfile('phone')} placeholder="+84..." className="form-input" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h2 className="card-header">Mạng xã hội</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(['facebook', 'instagram', 'youtube', 'tiktok', 'website'] as const).map((sn) => (
                            <div key={sn}>
                                <label htmlFor={`coach-social-${sn}`} className="form-label capitalize">{sn}</label>
                                <input id={`coach-social-${sn}`} type="url" {...regProfile(sn)} placeholder={`https://${sn}.com/...`} className="form-input" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h2 className="card-header border-none pb-0 mb-2">Chứng chỉ & Bằng cấp</h2>
                    <p className="text-xs text-gray-500 mb-4">
                        Tải lên hình ảnh chứng chỉ của bạn. Những ảnh này sẽ được lưu và hiển thị trên hồ sơ công khai.
                    </p>
                    <input type="hidden" {...regProfile('certifications_json')} />
                    {certsError && <p className="form-helper text-red-600 font-medium mb-2">{certsError}</p>}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(() => {
                            let certsArr: any[] = [];
                            try {
                                const val = watchProfile('certifications_json');
                                if (val) certsArr = JSON.parse(val);
                                if (!Array.isArray(certsArr)) certsArr = [];
                            } catch {
                                certsArr = [];
                            }
                            return certsArr.map((cert, index) => (
                                <div key={index} className="relative group border border-gray-200 rounded-sm overflow-hidden aspect-video bg-gray-50">
                                    <img src={cert.url} alt={cert.name || 'Chứng chỉ'} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newArr = [...certsArr];
                                            newArr.splice(index, 1);
                                            setProfileValue('certifications_json', JSON.stringify(newArr), { shouldDirty: true });
                                        }}
                                        className="absolute top-2 right-2 bg-white/90 text-black px-2 py-1 rounded text-xs font-medium hover:bg-white transition shadow opacity-0 group-hover:opacity-100">
                                        Xóa
                                    </button>
                                </div>
                            ));
                        })()}

                        <label className={`border-2 border-dashed border-gray-200 rounded-sm aspect-video flex flex-col items-center justify-center text-gray-500 hover:border-black hover:text-black transition ${isUploading ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}>
                            <span className="text-2xl mb-1">+</span>
                            <span className="text-xs font-medium text-center px-2">
                                {isUploading ? 'Đang tải...' : 'Tải lên ảnh mới'}
                            </span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                disabled={isUploading}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                        setIsUploading(true);
                                        const url = await uploadService.uploadImage(file, 'certificates', file.name);
                                        let currArr: any[] = [];
                                        try {
                                            const val = watchProfile('certifications_json');
                                            if (val) currArr = JSON.parse(val);
                                            if (!Array.isArray(currArr)) currArr = [];
                                        } catch {
                                            currArr = [];
                                        }
                                        currArr.push({ name: 'Chứng chỉ', issuer: 'Upload', year: new Date().getFullYear(), url });
                                        setProfileValue('certifications_json', JSON.stringify(currArr), { shouldDirty: true });
                                    } catch {
                                        toast.error('Lỗi tải ảnh. Vui lòng thử lại');
                                    } finally {
                                        setIsUploading(false);
                                        if (e.target) e.target.value = '';
                                    }
                                }}
                            />
                        </label>
                    </div>
                </div>

                <div className="flex justify-end pt-4 pb-12">
                    <button type="submit" disabled={saving} className="btn-primary min-w-[160px] py-3 text-base">
                        {saving ? 'Đang lưu...' : 'Lưu hồ sơ công khai'}
                    </button>
                </div>
            </form>

            <ImageCropperModal
                isOpen={isCropModalOpen}
                onClose={() => {
                    setIsCropModalOpen(false);
                    setSelectedImageFile(null);
                }}
                imageFile={selectedImageFile}
                onCropComplete={handleCropCompleteReal}
                aspectRatio={21 / 9} // Ultra-wide banner format for cover
                title="Cắt ảnh bìa hồ sơ"
            />
        </>
    );
}
