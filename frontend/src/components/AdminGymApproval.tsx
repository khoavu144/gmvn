import React, { useEffect, useState } from 'react';
import { logger } from '../lib/logger';
import { gymService } from '../services/gymService';
import { useToast } from './Toast';
import { ConfirmModal } from './ConfirmModal';
import type { GymCenter } from '../types';
import { AdminLoadingBlock, adminEmptyStateClassName } from './admin/adminPanelPrimitives';

const AdminGymApproval: React.FC = () => {
    const { toast, ToastComponent } = useToast();
    const [pendingGyms, setPendingGyms] = useState<GymCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; gymId?: string }>({ isOpen: false });

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            setLoading(true);
            const res = await gymService.getPendingGyms();
            if (res.success) {
                setPendingGyms(res.gyms || []);
            }
        } catch (error) {
            logger.error(error);
        } finally {
            setLoading(false);
        }
    };

    const execApprove = async () => {
        if (!confirmConfig.gymId) return;
        try {
            const res = await gymService.approveGym(confirmConfig.gymId);
            if (res.success) {
                toast.success('Đã phê duyệt phòng tập!');
                fetchPending();
            }
        } catch {
            toast.error('Lỗi khi phê duyệt');
        } finally {
            setConfirmConfig({ isOpen: false });
        }
    };

    const handleApprove = (id: string) => {
        setConfirmConfig({ isOpen: true, gymId: id });
    };

    // Reject modal state
    const [rejectConfig, setRejectConfig] = useState<{ isOpen: boolean; gymId?: string; reason: string }>({ isOpen: false, reason: '' });

    const handleReject = (id: string) => {
        setRejectConfig({ isOpen: true, gymId: id, reason: '' });
    };

    const execReject = async () => {
        if (!rejectConfig.gymId) return;
        try {
            const res = await gymService.rejectGym(rejectConfig.gymId);
            if (res.success) {
                toast.success('Đã từ chối phòng tập');
                fetchPending();
            }
        } catch {
            toast.error('Lỗi khi từ chối');
        } finally {
            setRejectConfig({ isOpen: false, reason: '' });
        }
    };

    if (loading) return <AdminLoadingBlock />;

    if (pendingGyms.length === 0) {
        return (
            <div className={adminEmptyStateClassName}>
                <p className="font-medium text-gray-800">Không có hồ sơ đang chờ duyệt</p>
                <p className="mt-1 text-xs text-gray-500">Khi có gym owner gửi duyệt, danh sách sẽ hiện ở đây.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {ToastComponent}
            {pendingGyms.map(gym => (
                <div key={gym.id} className="bg-white border-2 border-black p-6 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-xl font-black uppercase tracking-tight">{gym.name}</h4>
                                <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 uppercase rounded-sm">Chờ Duyệt</span>
                            </div>
                            <p className="text-gray-500 font-medium text-sm mb-4">{gym.tagline}</p>
                            <p className="text-gray-600 text-sm line-clamp-3 mb-6">{gym.description}</p>

                            <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                <div>
                                    <span className="block mb-1">Chủ sở hữu</span>
                                    <span className="text-black">{gym.owner?.full_name} ({gym.owner?.email})</span>
                                </div>
                                <div>
                                    <span className="block mb-1">Ngày đăng ký</span>
                                    <span className="text-black">{new Date(gym.created_at).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="md:w-48 flex flex-col gap-2">
                            <button
                                onClick={() => handleApprove(gym.id)}
                                className="bg-black text-white py-3 px-6 rounded-xs font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-colors"
                            >
                                Phê duyệt
                            </button>
                            <button
                                onClick={() => handleReject(gym.id)}
                                className="border border-red-600 text-red-600 py-3 px-6 rounded-xs font-bold uppercase tracking-widest text-xs hover:bg-red-50 transition-colors"
                            >
                                Từ chối
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                title="Xác nhận phê duyệt"
                description="Bạn có chắc chắn muốn xuất bản phòng tập này lên hệ thống? Hành động này sẽ thông báo cho chủ phòng tập."
                confirmText="Phê duyệt"
                onConfirm={execApprove}
                onCancel={() => setConfirmConfig({ isOpen: false })}
            />

            {/* Reject reason modal */}
            {rejectConfig.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                        <h3 className="text-lg font-black uppercase tracking-tight">Từ chối phòng tập</h3>
                        <p className="text-sm text-gray-600">Vui lòng nhập lý do từ chối để thông báo cho chủ phòng tập.</p>
                        <textarea
                            value={rejectConfig.reason}
                            onChange={e => setRejectConfig(prev => ({ ...prev, reason: e.target.value }))}
                            className="form-input w-full h-24 resize-none"
                            placeholder="Lý do từ chối..."
                            autoFocus
                        />
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setRejectConfig({ isOpen: false, reason: '' })} className="btn-secondary px-5 py-2 text-sm">Huỷ</button>
                            <button onClick={execReject} className="bg-red-600 text-white px-5 py-2 rounded-sm text-sm font-bold hover:bg-red-700 transition-colors">Xác nhận từ chối</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGymApproval;
