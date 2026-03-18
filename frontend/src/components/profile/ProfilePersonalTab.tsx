import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { userService } from '../../services/userService';
import { setUser } from '../../store/slices/authSlice';
import type { User } from '../../types';

const profileSchema = z.object({
    full_name: z.string().min(2, 'Tên phải từ 2 ký tự').optional(),
    bio: z.string().max(500, 'Tối đa 500 ký tự').optional().nullable(),
    height_cm: z.number().min(100).max(250).optional().nullable(),
    current_weight_kg: z.number().min(30).max(200).optional().nullable(),
    experience_level: z.enum(['beginner', 'intermediate', 'advanced']).optional().nullable(),
    base_price_monthly: z.number().min(0).optional().nullable(),
    specialties: z.string().optional().nullable(),
});

type PersonalFormValues = z.infer<typeof profileSchema>;

interface Props {
    user: User;
    onUpdate?: () => void;
}

export function ProfilePersonalTab({ user, onUpdate }: Props) {
    const dispatch = useDispatch();
    const [successMsgPersonal, setSuccessMsgPersonal] = useState('');

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
            if (onUpdate) onUpdate();
        },
    });

    const onSubmitPersonal = (data: PersonalFormValues) => {
        const specialtiesArray = data.specialties
            ? data.specialties.split(',').map((s) => s.trim()).filter(Boolean)
            : null;
        mutationPersonal.mutate({ ...data, specialties: specialtiesArray });
    };

    return (
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
    );
}
