import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { uploadService } from '../services/uploadService';
import type { ProgressPhoto } from '../types';

export function ProfileProgressTab() {
    const queryClient = useQueryClient();
    const [isUploading, setIsUploading] = useState(false);
    const [form, setForm] = useState({
        caption: '',
        taken_at: new Date().toISOString().split('T')[0],
        weight_kg: ''
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: photos, isLoading } = useQuery<ProgressPhoto[]>({
        queryKey: ['progressPhotos'],
        queryFn: async () => {
            const res = await api.get('/profiles/progress-photos');
            return res.data;
        }
    });

    const addMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await api.post('/profiles/progress-photos', payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['progressPhotos'] });
            setForm({
                caption: '',
                taken_at: new Date().toISOString().split('T')[0],
                weight_kg: ''
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/profiles/progress-photos/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['progressPhotos'] });
        }
    });

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadService.uploadImage(file, 'progress', file.name);
            addMutation.mutate({
                image_url: url,
                caption: form.caption || null,
                taken_at: form.taken_at || null,
                weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null
            });
        } catch (error) {
            alert('Upload ảnh thất bại');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="card">
                <h3 className="card-header">Thêm ảnh Before/After</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Ngày chụp</label>
                            <input
                                type="date"
                                className="form-input"
                                value={form.taken_at}
                                onChange={e => setForm(f => ({ ...f, taken_at: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="form-label">Cân nặng lúc chụp (kg - không bắt buộc)</label>
                            <input
                                type="number"
                                step="0.1"
                                className="form-input"
                                placeholder="Ví dụ: 70.5"
                                value={form.weight_kg}
                                onChange={e => setForm(f => ({ ...f, weight_kg: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="form-label">Ghi chú (Tùy chọn)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Mô tả sự thay đổi..."
                            value={form.caption}
                            onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
                        />
                    </div>
                    <div className="pt-2">
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading || addMutation.isPending}
                            className="btn-primary"
                        >
                            {isUploading || addMutation.isPending ? 'Đang tải lên...' : 'Chọn ảnh và Tải lên'}
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="text-gray-500">Đang tải ảnh...</div>
            ) : photos && photos.length > 0 ? (
                <div className="card">
                    <h3 className="card-header">Lịch sử thay đổi ({photos.length} ảnh)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {photos.map(p => (
                            <div key={p.id} className="relative group border border-gray-200 rounded-xs overflow-hidden aspect-[3/4] bg-gray-50">
                                <img src={p.image_url} alt={p.caption || 'progress'} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 border border-black m-1">
                                    <div>
                                        <span className="text-xs font-semibold text-black uppercase tracking-wider">
                                            {p.taken_at ? new Date(p.taken_at).toLocaleDateString('vi-VN') : 'Không rõ ngày'}
                                        </span>
                                        {p.weight_kg && <p className="text-sm text-gray-800 mt-1 font-medium">{p.weight_kg} kg</p>}
                                        {p.caption && <p className="text-sm text-gray-700 mt-1 line-clamp-3">{p.caption}</p>}
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (confirm('Bạn có chắc chắn muốn xóa ảnh này?')) {
                                                deleteMutation.mutate(p.id);
                                            }
                                        }}
                                        className="text-sm font-medium text-black underline mt-auto self-start"
                                    >
                                        Xóa ảnh
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-gray-500 italic">Chưa có ảnh nào. Hãy tải lên để theo dõi sự phát triển của bạn!</div>
            )}
        </div>
    );
}
