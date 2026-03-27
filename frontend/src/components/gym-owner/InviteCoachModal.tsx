import type { GymCenter } from '../../types';

interface InviteFormData {
    email: string;
    role: string;
}

interface Props {
    gym: GymCenter;
    form: InviteFormData;
    onChange: (updater: (prev: InviteFormData) => InviteFormData) => void;
    onClose: () => void;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
    isSending: boolean;
}

export default function InviteCoachModal({ gym, form, onChange, onClose, onSuccess, onError, isSending }: Props) {
    const handleSend = async () => {
        if (!form.email.trim()) return;
        const branches = gym.branches ?? [];
        const targetBranchId = branches[0]?.id ?? gym.id;
        try {
            const apiClient = (await import('../../services/api')).default;
            await apiClient.post(`/gym-owner/branches/${targetBranchId}/trainers/invite`, {
                email: form.email.trim(),
                role: form.role,
            });
            onSuccess(`Đã gửi lời mời đến ${form.email}`);
        } catch (err: any) {
            onError(err?.response?.data?.error || 'Không thể gửi lời mời. Vui lòng thử lại.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4">Mời Coach Tham Gia</h3>
                <p className="text-sm text-gray-500 mb-6">Gửi lời mời liên kết đến huấn luyện viên thông qua email.</p>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Email của Coach</label>
                        <input
                            type="email"
                            className="form-input w-full"
                            placeholder="coach@example.com"
                            value={form.email}
                            onChange={e => onChange((prev) => ({ ...prev, email: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Vai trò</label>
                        <select
                            className="form-input w-full"
                            value={form.role}
                            onChange={e => onChange((prev) => ({ ...prev, role: e.target.value }))}
                        >
                            <option value="Coach">Coach (Huấn luyện viên)</option>
                            <option value="Head Coach">Head Coach (HLV Trưởng)</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        className="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!form.email || isSending}
                        onClick={handleSend}
                    >
                        Gửi lời mời
                    </button>
                    <button
                        className="flex-1 py-3 border border-gray-200 rounded-lg font-bold text-sm text-gray-600 hover:border-black transition-colors"
                        onClick={onClose}
                    >
                        Huỷ
                    </button>
                </div>
            </div>
        </div>
    );
}
