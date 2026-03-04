import React, { useEffect, useState } from 'react';
import { gymService } from '../services/gymService';
import type { GymCenter, GymBranch } from '../types';
import { Link } from 'react-router-dom';
import GymTrainerManager from '../components/GymTrainerManager';
import GymBranchEditor from '../components/GymBranchEditor';

const GymOwnerDashboard: React.FC = () => {
    const [gym, setGym] = useState<GymCenter | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'branches' | 'trainers' | 'settings'>('overview');

    // Branch Editor state
    const [editingBranch, setEditingBranch] = useState<GymBranch | null>(null);

    // BUG-005: Stats state
    const [stats, setStats] = useState<{ total_views: number; total_trainers: number; avg_rating: number; total_reviews: number; total_branches: number } | null>(null);

    // BUG-006: Settings state
    const [settingsForm, setSettingsForm] = useState({ name: '', description: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchMyGym();
    }, []);

    const fetchMyGym = async () => {
        try {
            const res = await gymService.getMyGyms();
            if (res.success && res.gyms && res.gyms.length > 0) {
                const myGym = res.gyms[0];
                setGym(myGym);
                setSettingsForm({ name: myGym.name, description: myGym.description || '' });

                // Fetch real stats
                const statsRes = await gymService.getGymStats(myGym.id);
                if (statsRes.success) {
                    setStats(statsRes.stats);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        if (!gym) return;
        setSaving(true);
        try {
            const res = await gymService.updateGymCenter(gym.id, settingsForm);
            if (res.success) {
                setGym(prev => prev ? { ...prev, ...settingsForm } : prev);
                alert('Đã cập nhật thông tin thành công!');
            }
        } catch (error) {
            alert('Lỗi cập nhật cài đặt');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex">
                <div className="w-64 bg-gray-50 border-r border-gray-200"></div>
                <div className="flex-1 p-8"><div className="animate-pulse h-32 bg-gray-100 rounded-xl" /></div>
            </div>
        );
    }

    if (!gym) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Bạn chưa thiết lập thông tin Gym</h2>
                    <Link to="/gym-owner/register" className="btn-primary">Thiết lập ngay</Link>
                </div>
            </div>
        );
    }

    const branches = gym.branches || [];

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-white relative">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="font-black truncate uppercase tracking-tight">{gym.name}</h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Gym Center</p>
                </div>
                <nav className="p-4 space-y-2">
                    <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-3 rounded-lg font-bold text-sm tracking-wider uppercase transition-colors ${activeTab === 'overview' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Tổng quan</button>
                    <button onClick={() => setActiveTab('branches')} className={`w-full text-left px-4 py-3 rounded-lg font-bold text-sm tracking-wider uppercase transition-colors ${activeTab === 'branches' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Chi nhánh</button>
                    <button onClick={() => setActiveTab('trainers')} className={`w-full text-left px-4 py-3 rounded-lg font-bold text-sm tracking-wider uppercase transition-colors ${activeTab === 'trainers' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Coach liên kết</button>
                    <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-4 py-3 rounded-lg font-bold text-sm tracking-wider uppercase transition-colors ${activeTab === 'settings' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Cài đặt</button>
                </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 p-6 md:p-10 overflow-y-auto">
                {activeTab === 'overview' && (
                    <div className="animate-fade-in">
                        <div className="mb-10">
                            <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Thống Kê Tổng Quan</h1>
                            <p className="text-gray-500">Giám sát hoạt động trên hệ thống GYMERVIET</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                            {[
                                { label: 'Tổng lượt xem', val: stats?.total_views ?? gym.view_count },
                                { label: 'Chi nhánh', val: stats?.total_branches ?? branches.length },
                                { label: 'Đánh giá', val: stats?.avg_rating ? `★ ${stats.avg_rating.toFixed(1)}` : 'N/A' },
                                { label: 'HLV liên kết', val: stats?.total_trainers ?? 0 },
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">{item.label}</p>
                                    <p className="text-3xl font-black">{item.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'branches' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Quản lý Chi Nhánh</h1>
                                <p className="text-gray-500">Thêm, sửa thông tin chi tiết từng cơ sở</p>
                            </div>
                            <button className="btn-primary py-2 px-4 shadow-none" onClick={() => alert('Tính năng đang được cập nhật...')}>Thêm chi nhánh mới</button>
                        </div>
                        <div className="grid gap-6">
                            {branches.map(branch => (
                                <div key={branch.id} className="p-6 border border-gray-200 rounded-xl flex items-center justify-between hover:border-black transition-colors cursor-pointer group" onClick={() => setEditingBranch(branch)}>
                                    <div>
                                        <h3 className="font-bold text-lg">{branch.branch_name}</h3>
                                        <p className="text-gray-500 text-sm mt-1">{branch.address}, {branch.district}, {branch.city}</p>
                                    </div>
                                    <button className="text-sm font-bold text-gray-400 group-hover:text-black uppercase tracking-wider">Cập nhật</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'trainers' && (
                    <GymTrainerManager branches={branches} />
                )}

                {activeTab === 'settings' && (
                    <div className="animate-fade-in">
                        <div className="mb-10">
                            <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Hồ sơ Thương hiệu</h1>
                            <p className="text-gray-500">Cập nhật thông tin hệ thống Gym Center</p>
                        </div>
                        <div className="max-w-2xl bg-white border border-gray-200 p-6 rounded-xl space-y-6">
                            <div>
                                <label className="form-label block mb-2">Tên Gym Center</label>
                                <input
                                    type="text"
                                    className="form-input w-full"
                                    value={settingsForm.name}
                                    onChange={(e) => setSettingsForm(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="form-label block mb-2">Giới thiệu</label>
                                <textarea
                                    className="form-input w-full h-32"
                                    value={settingsForm.description}
                                    onChange={(e) => setSettingsForm(prev => ({ ...prev, description: e.target.value }))}
                                ></textarea>
                            </div>
                            <button
                                className="btn-primary w-full py-4 text-sm mt-6"
                                onClick={handleSaveSettings}
                                disabled={saving}
                            >
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Branch Editor Overlay */}
            {editingBranch && (
                <GymBranchEditor
                    branch={editingBranch}
                    onClose={() => setEditingBranch(null)}
                    onUpdate={() => {
                        fetchMyGym();
                        // Also update editingBranch state from fresh gym data if needed
                    }}
                />
            )}
        </div>
    );
};

export default GymOwnerDashboard;
