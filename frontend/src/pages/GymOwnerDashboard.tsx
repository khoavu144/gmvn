import React, { Suspense, lazy, useEffect, useState } from 'react';
import { logger } from '../lib/logger';
import { useToast } from '../components/Toast';
import { gymService } from '../services/gymService';
import type { GymCenter, GymBranch } from '../types';
import { Link } from 'react-router-dom';
import GymBranchEditor from '../components/GymBranchEditor';

const LazyBarChart = lazy(() => import('recharts').then((m) => ({ default: m.BarChart })));
const LazyBar = lazy(() => import('recharts').then((m) => ({ default: m.Bar })));
const LazyXAxis = lazy(() => import('recharts').then((m) => ({ default: m.XAxis })));
const LazyYAxis = lazy(() => import('recharts').then((m) => ({ default: m.YAxis })));
const LazyTooltip = lazy(() => import('recharts').then((m) => ({ default: m.Tooltip })));
const LazyResponsiveContainer = lazy(() => import('recharts').then((m) => ({ default: m.ResponsiveContainer })));
const LazyRadialBarChart = lazy(() => import('recharts').then((m) => ({ default: m.RadialBarChart })));
const LazyRadialBar = lazy(() => import('recharts').then((m) => ({ default: m.RadialBar })));

const ChartFallback = () => <div className="h-full w-full animate-pulse rounded-lg bg-gray-100" />;

const GymOwnerDashboard: React.FC = () => {
    const { toast, ToastComponent } = useToast();
    const [gym, setGym] = useState<GymCenter | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'branches' | 'trainers' | 'settings'>('overview');

    // Branch Editor state
    const [editingBranch, setEditingBranch] = useState<GymBranch | null>(null);

    // NEW: Form tạo chi nhánh mới
    const [showNewBranchForm, setShowNewBranchForm] = useState(false);
    const [newBranchForm, setNewBranchForm] = useState({ branch_name: '', address: '', city: '', district: '', phone: '', description: '' });
    const [creatingBranch, setCreatingBranch] = useState(false);

    // BUG-005: Stats state
    const [stats, setStats] = useState<{ total_views: number; total_trainers: number; avg_rating: number; total_reviews: number; total_branches: number; rating_distribution?: Record<number, number> } | null>(null);

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
            logger.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBranch = async () => {
        if (!newBranchForm.branch_name || !newBranchForm.address) {
            toast.success('Vui lòng nhập tên chi nhánh và địa chỉ');
            return;
        }
        setCreatingBranch(true);
        try {
            const res = await gymService.createBranch(newBranchForm);
            if (res.success) {
                toast.success(`✅ Đã tạo chi nhánh "${newBranchForm.branch_name}" thành công!`);
                setShowNewBranchForm(false);
                setNewBranchForm({ branch_name: '', address: '', city: '', district: '', phone: '', description: '' });
                fetchMyGym(); // reload fresh data
            }
        } catch (error) {
            toast.error('Lỗi tạo chi nhánh. Thử lại nhé!');
        } finally {
            setCreatingBranch(false);
        }
    };

    const handleSaveSettings = async () => {
        if (!gym) return;
        setSaving(true);
        try {
            const res = await gymService.updateGymCenter(gym.id, settingsForm);
            if (res.success) {
                setGym(prev => prev ? { ...prev, ...settingsForm } : prev);
                toast.success('Đã cập nhật thông tin thành công!');
            }
        } catch (error) {
            toast.error('Lỗi cập nhật cài đặt');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex">
            {ToastComponent}
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

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                            <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm h-80 col-span-1 lg:col-span-2 flex flex-col">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-6">Phân bổ đánh giá</p>
                                <div className="flex-1 min-h-0">
                                    <Suspense fallback={<ChartFallback />}>
                                        <LazyResponsiveContainer width="100%" height="100%">
                                            <LazyBarChart data={
                                                [
                                                    { rating: '1★', count: stats?.rating_distribution?.[1] || 0 },
                                                    { rating: '2★', count: stats?.rating_distribution?.[2] || 0 },
                                                    { rating: '3★', count: stats?.rating_distribution?.[3] || 0 },
                                                    { rating: '4★', count: stats?.rating_distribution?.[4] || 0 },
                                                    { rating: '5★', count: stats?.rating_distribution?.[5] || 0 },
                                                ]
                                            } margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <LazyXAxis dataKey="rating" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                                <LazyYAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                                                <LazyTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <LazyBar dataKey="count" fill="#000000" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                            </LazyBarChart>
                                        </LazyResponsiveContainer>
                                    </Suspense>
                                </div>
                            </div>

                            <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm h-80 col-span-1 flex flex-col">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Tỷ lệ lấp đầy HLV</p>
                                <div className="flex-1 min-h-0 relative">
                                    <Suspense fallback={<ChartFallback />}>
                                        <LazyResponsiveContainer width="100%" height="100%">
                                            <LazyRadialBarChart
                                                cx="50%" cy="50%"
                                                innerRadius="70%" outerRadius="100%"
                                                barSize={24}
                                                data={[
                                                    { name: 'Đã lấp đầy', value: Math.min(100, Math.round(((stats?.total_trainers || 0) / (Math.max(1, branches.length) * 5)) * 100)) || 0, fill: '#000000' }
                                                ]}
                                                startAngle={90} endAngle={-270}
                                            >
                                                <LazyRadialBar background={{ fill: '#f3f4f6' }} dataKey="value" cornerRadius={12} />
                                            </LazyRadialBarChart>
                                        </LazyResponsiveContainer>
                                    </Suspense>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-center">
                                            <span className="text-3xl font-black block">
                                                {Math.min(100, Math.round(((stats?.total_trainers || 0) / (Math.max(1, branches.length) * 5)) * 100)) || 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                            <button
                                className="btn-primary py-2 px-4 shadow-none"
                                onClick={() => setShowNewBranchForm(true)}
                            >
                                + Thêm chi nhánh mới
                            </button>
                        </div>

                        {/* ─── NEW BRANCH FORM ─── */}
                        {showNewBranchForm && (
                            <div className="mb-8 p-6 border-2 border-black rounded-xl bg-gray-50 animate-fade-in">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-black uppercase tracking-tight">Thêm Chi Nhánh Mới</h2>
                                    <button onClick={() => setShowNewBranchForm(false)} className="text-gray-400 hover:text-black text-2xl font-black transition-colors">×</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tên chi nhánh <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            className="form-input w-full"
                                            placeholder="VD: GYMERVIET - Quận 3"
                                            value={newBranchForm.branch_name}
                                            onChange={e => setNewBranchForm(p => ({ ...p, branch_name: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Số điện thoại</label>
                                        <input
                                            type="text"
                                            className="form-input w-full"
                                            placeholder="0987 654 321"
                                            value={newBranchForm.phone}
                                            onChange={e => setNewBranchForm(p => ({ ...p, phone: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Địa chỉ <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            className="form-input w-full"
                                            placeholder="Số nhà, tên đường..."
                                            value={newBranchForm.address}
                                            onChange={e => setNewBranchForm(p => ({ ...p, address: e.target.value }))}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Quận/Huyện</label>
                                            <input
                                                type="text"
                                                className="form-input w-full"
                                                placeholder="Quận 3"
                                                value={newBranchForm.district}
                                                onChange={e => setNewBranchForm(p => ({ ...p, district: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Thành phố</label>
                                            <input
                                                type="text"
                                                className="form-input w-full"
                                                placeholder="TP HCM"
                                                value={newBranchForm.city}
                                                onChange={e => setNewBranchForm(p => ({ ...p, city: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Giới thiệu ngắn</label>
                                    <textarea
                                        className="form-input w-full h-20"
                                        placeholder="Đặc điểm nổi bật của chi nhánh này..."
                                        value={newBranchForm.description}
                                        onChange={e => setNewBranchForm(p => ({ ...p, description: e.target.value }))}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        className="btn-primary px-8 py-3"
                                        onClick={handleCreateBranch}
                                        disabled={creatingBranch}
                                    >
                                        {creatingBranch ? 'Đang tạo...' : 'Tạo chi nhánh'}
                                    </button>
                                    <button
                                        className="px-8 py-3 border border-gray-300 rounded-lg font-bold text-sm text-gray-600 hover:border-black transition-colors"
                                        onClick={() => setShowNewBranchForm(false)}
                                    >
                                        Huỷ
                                    </button>
                                </div>
                            </div>
                        )}

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
                            {branches.length === 0 && (
                                <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
                                    <p className="text-gray-400 font-bold uppercase text-sm">Chưa có chi nhánh nào</p>
                                    <button className="mt-4 btn-primary py-2 px-6" onClick={() => setShowNewBranchForm(true)}>Thêm chi nhánh đầu tiên</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'trainers' && (
                    <div className="bg-white p-10 text-center rounded-xl border border-gray-200">
                        <h2 className="text-2xl font-bold mb-2">Quản lý Coach liên kết</h2>
                        <p className="text-gray-500 mb-6">Tính năng quản lý Coach hiện được quản lý trực tiếp tại từng chi nhánh phòng tập.</p>
                        <button className="btn-primary" onClick={() => setActiveTab('branches')}>Truy cập Quản lý Chi nhánh</button>
                    </div>
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
                    }}
                />
            )}
        </div>
    );
};

export default GymOwnerDashboard;
