import React, { useEffect, useState } from 'react';
import { gymService } from '../services/gymService';
import { useToast } from './Toast';
import type { GymCenter } from '../types';

const AdminGymApproval: React.FC = () => {
    const { toast, ToastComponent } = useToast();
    const [pendingGyms, setPendingGyms] = useState<GymCenter[]>([]);
    const [loading, setLoading] = useState(true);

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
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!window.confirm('Phê duyệt phòng tập này?')) return;
        try {
            const res = await gymService.approveGym(id);
            if (res.success) {
                toast.success('Đã phê duyệt phòng tập!');
                fetchPending();
            }
        } catch (error) {
            toast.error('Lỗi khi phê duyệt');
        }
    };

    const handleReject = async (id: string) => {
        const reason = window.prompt('Lý do từ chối?');
        if (reason === null) return;
        try {
            const res = await gymService.rejectGym(id);
            if (res.success) {
                toast.success('Đã từ chối phòng tập');
                fetchPending();
            }
        } catch (error) {
            toast.error('Lỗi khi từ chối');
        }
    };

    if (loading) return <div className="animate-pulse space-y-4"><div className="h-24 bg-gray-50 rounded-xl"></div></div>;

    if (pendingGyms.length === 0) {
        return <div className="text-gray-500 italic py-12 text-center border-2 border-dashed border-gray-100 rounded-xl">Không có hồ sơ nào đang chờ duyệt.</div>;
    }

    return (
        <div className="space-y-6">
            {ToastComponent}
            {pendingGyms.map(gym => (
                <div key={gym.id} className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-xl font-black uppercase tracking-tight">{gym.name}</h4>
                                <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 uppercase rounded-sm">Chờ Duyệt</span>
                            </div>
                            <p className="text-gray-500 font-medium text-sm mb-4">{gym.tagline}</p>
                            <p className="text-gray-600 text-sm line-clamp-3 mb-6">{gym.description}</p>

                            <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider text-gray-400">
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
                                className="bg-black text-white py-3 px-6 rounded-xs font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-colors"
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
        </div>
    );
};

export default AdminGymApproval;
