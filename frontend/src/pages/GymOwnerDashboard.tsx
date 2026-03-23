import { useState, useEffect, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { logger } from '../lib/logger';
import { useToast } from '../components/Toast';
import { gymService } from '../services/gymService';
import type { GymCenter, GymBranch } from '../types';
import { Link } from 'react-router-dom';
import { Menu, X, Upload, Star, Search, Link as LinkIcon, Users, Building2, CalendarDays, ArrowRight, Trash2, Settings, Store } from 'lucide-react';
import GymBranchEditor from '../components/GymBranchEditor';

const LazyBarChart = lazy(() => import('recharts').then((m) => ({ default: m.BarChart })));
const LazyBar = lazy(() => import('recharts').then((m) => ({ default: m.Bar })));
const LazyXAxis = lazy(() => import('recharts').then((m) => ({ default: m.XAxis })));
const LazyYAxis = lazy(() => import('recharts').then((m) => ({ default: m.YAxis })));
const LazyTooltip = lazy(() => import('recharts').then((m) => ({ default: m.Tooltip })));
const LazyResponsiveContainer = lazy(() => import('recharts').then((m) => ({ default: m.ResponsiveContainer })));
const LazyRadialBarChart = lazy(() => import('recharts').then((m) => ({ default: m.RadialBarChart })));
const LazyRadialBar = lazy(() => import('recharts').then((m) => ({ default: m.RadialBar })));

const ChartFallback = () => <div className="h-full w-full animate-pulse rounded-lg bg-gray-50" />;

const GymOwnerDashboard: React.FC = () => {
    const { toast, ToastComponent } = useToast();
    const [gym, setGym] = useState<GymCenter | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'branches' | 'trainers' | 'settings'>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Branch Editor state
    const [editingBranch, setEditingBranch] = useState<GymBranch | null>(null);

    // NEW: Form tạo chi nhánh mới
    const [showNewBranchForm, setShowNewBranchForm] = useState(false);
    const [newBranchForm, setNewBranchForm] = useState({ branch_name: '', address: '', city: '', district: '', phone: '', description: '' });
    const [creatingBranch, setCreatingBranch] = useState(false);

    // BUG-005: Stats state
    const [stats, setStats] = useState<{ total_views: number; total_trainers: number; avg_rating: number; total_reviews: number; total_branches: number; rating_distribution?: Record<number, number> } | null>(null);

    // Invite Coach state
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteForm, setInviteForm] = useState({ email: '', role: 'Coach' });

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
            toast.error('Vui lòng nhập tên chi nhánh và địa chỉ');
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
        } catch {
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
                setGym((prev: GymCenter | null) => prev ? { ...prev, ...settingsForm } : prev);
                toast.success('Đã cập nhật thông tin thành công!');
            }
        } catch {
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
                <div className="flex-1 p-8"><div className="animate-pulse h-32 bg-gray-50 rounded-lg" /></div>
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
            <Helmet>
                <title>Gym Owner Dashboard — GYMERVIET</title>
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
            {/* Mobile Header Toggle */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-30">
                <div className="font-black uppercase tracking-tight truncate flex-1 mr-4">{gym.name}</div>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 border border-black text-black rounded-sm hover:bg-black hover:text-white transition-colors">
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-50 border-r border-gray-200 flex-shrink-0 transform transition-transform duration-300 md:relative md:w-64 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white md:bg-gray-50">
                    <div className="min-w-0 pr-4">
                        <h2 className="font-black truncate uppercase tracking-tight" title={gym.name}>{gym.name}</h2>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Gym Center</p>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-gray-500 hover:text-black hover:bg-gray-50 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <nav className="p-4 space-y-2">
                    <button onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm tracking-wider uppercase transition-colors ${activeTab === 'overview' ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <CalendarDays className="w-4 h-4" /> Tổng quan
                    </button>
                    <button onClick={() => { setActiveTab('branches'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm tracking-wider uppercase transition-colors ${activeTab === 'branches' ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <Building2 className="w-4 h-4" /> Chi nhánh
                    </button>
                    <button onClick={() => { setActiveTab('trainers'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm tracking-wider uppercase transition-colors ${activeTab === 'trainers' ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <Users className="w-4 h-4" /> Coach liên kết
                    </button>
                    <button onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm tracking-wider uppercase transition-colors ${activeTab === 'settings' ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <Settings className="w-4 h-4" /> Cài đặt
                    </button>
                    <Link
                        to="/dashboard/marketplace"
                        onClick={() => setIsSidebarOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm tracking-wider uppercase transition-colors text-gray-600 hover:bg-gray-100"
                    >
                        <Store className="w-4 h-4" /> Marketplace seller
                    </Link>
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
                                { label: 'Đánh giá', val: stats?.avg_rating != null ? `★ ${Number(stats.avg_rating).toFixed(1)}` : 'N/A' },
                                { label: 'HLV liên kết', val: stats?.total_trainers ?? 0 },
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">{item.label}</p>
                                    <p className="text-3xl font-black">{item.val}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                            <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm h-80 col-span-1 lg:col-span-2 flex flex-col">
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

                            <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm h-80 col-span-1 flex flex-col">
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

                        {/* Recent Reviews (Mocked) */}
                        <div className="mt-12">
                            <h2 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Đánh giá gần đây</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="p-5 rounded-lg border border-gray-200 bg-white shadow-sm hover:border-black transition-colors cursor-pointer group flex flex-col min-h-[160px]">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, idx) => <Star key={idx} className={`w-3 h-3 ${idx === 4 && i === 3 ? 'text-gray-300' : 'text-yellow-400 fill-yellow-400'}`} />)}
                                            </div>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{i} ngày trước</span>
                                        </div>
                                        <p className="text-sm text-gray-600 italic line-clamp-3 mb-4 flex-1">"Phòng tập sạch sẽ, cơ sở vật chất tuyệt vời. Rất đáng tiền đăng ký gói năm ở đây!"</p>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-t border-gray-200 pt-3 flex items-center justify-between mt-auto">
                                            <span>Hội viên ẩn danh</span>
                                            <span className="text-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Xem <ArrowRight className="w-3 h-3 inline" /></span>
                                        </div>
                                    </div>
                                ))}
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
                            <div className="mb-8 p-6 border-2 border-black rounded-lg bg-gray-50 animate-fade-in">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-black uppercase tracking-tight">Thêm Chi Nhánh Mới</h2>
                                    <button onClick={() => setShowNewBranchForm(false)} className="text-gray-500 hover:text-black text-2xl font-black transition-colors">×</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tên chi nhánh <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            className="form-input w-full"
                                            placeholder="VD: GYMERVIET - Quận 3"
                                            value={newBranchForm.branch_name}
                                            onChange={e => setNewBranchForm((p: typeof newBranchForm) => ({ ...p, branch_name: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Số điện thoại</label>
                                        <input
                                            type="text"
                                            className="form-input w-full"
                                            placeholder="0987 654 321"
                                            value={newBranchForm.phone}
                                            onChange={e => setNewBranchForm((p: typeof newBranchForm) => ({ ...p, phone: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Địa chỉ <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            className="form-input w-full"
                                            placeholder="Số nhà, tên đường..."
                                            value={newBranchForm.address}
                                            onChange={e => setNewBranchForm((p: typeof newBranchForm) => ({ ...p, address: e.target.value }))}
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
                                                onChange={e => setNewBranchForm((p: typeof newBranchForm) => ({ ...p, district: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Thành phố</label>
                                            <input
                                                type="text"
                                                className="form-input w-full"
                                                placeholder="TP HCM"
                                                value={newBranchForm.city}
                                                onChange={e => setNewBranchForm((p: typeof newBranchForm) => ({ ...p, city: e.target.value }))}
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
                                        onChange={e => setNewBranchForm((p: typeof newBranchForm) => ({ ...p, description: e.target.value }))}
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
                                        className="px-8 py-3 border border-gray-200 rounded-lg font-bold text-sm text-gray-600 hover:border-black transition-colors"
                                        onClick={() => setShowNewBranchForm(false)}
                                    >
                                        Huỷ
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-6">
                            {branches.map((branch: GymBranch) => (
                                <div key={branch.id} className="p-6 border border-gray-200 rounded-lg flex items-center justify-between hover:border-black transition-colors cursor-pointer group" onClick={() => setEditingBranch(branch)}>
                                    <div>
                                        <h3 className="font-bold text-lg">{branch.branch_name}</h3>
                                        <p className="text-gray-500 text-sm mt-1">{branch.address}, {branch.district}, {branch.city}</p>
                                    </div>
                                    <button className="text-sm font-bold text-gray-500 group-hover:text-black uppercase tracking-wider">Cập nhật</button>
                                </div>
                            ))}
                            {branches.length === 0 && (
                                <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-lg">
                                    <p className="text-gray-500 font-bold uppercase text-sm">Chưa có chi nhánh nào</p>
                                    <button className="mt-4 btn-primary py-2 px-6" onClick={() => setShowNewBranchForm(true)}>Thêm chi nhánh đầu tiên</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'trainers' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Quản lý Coach liên kết</h1>
                                <p className="text-gray-500">Mời Coach tham gia chi nhánh và cấp quyền quản lý hội viên</p>
                            </div>
                            <button 
                                className="btn-primary py-2 px-4 shadow-none flex items-center gap-2"
                                onClick={() => setShowInviteModal(true)}
                            >
                                <LinkIcon className="w-4 h-4" /> Mời Coach Mới
                            </button>
                        </div>

                        {/* Search and Filter */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input type="text" placeholder="Tìm kiếm tên, sđt Coach..." className="form-input pl-10 w-full" />
                            </div>
                            <select className="form-input w-full sm:w-48">
                                <option>Tất cả chi nhánh</option>
                                {branches.map((b: GymBranch) => <option key={b.id}>{b.branch_name}</option>)}
                            </select>
                        </div>

                        <div className="grid gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-4 border border-gray-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between hover:border-black transition-colors bg-white group">
                                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center font-black text-gray-500 uppercase">C{i}</div>
                                        <div>
                                            <h3 className="font-bold text-base flex items-center gap-2">Coach Nguyễn Văn A {i === 1 && <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm">Premium</span>}</h3>
                                            <p className="text-gray-500 text-xs mt-1">Chuyên môn: Thể hình, Giảm mỡ • 091234567{i}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end gap-6 text-sm">
                                        <div className="text-left md:text-right">
                                            <span className="block text-[10px] text-gray-500 uppercase font-bold tracking-widest">Chi nhánh chính</span>
                                            <span className="font-semibold text-black">Gymerviet Quận {i}</span>
                                        </div>
                                        <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:text-black hover:border-black transition-colors" title="Xóa liên kết">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="animate-fade-in">
                        <div className="mb-10">
                            <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Hồ sơ Thương hiệu</h1>
                            <p className="text-gray-500">Cập nhật thông tin hệ thống Gym Center và bộ nhận diện</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6 bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                                <h3 className="text-lg font-black uppercase tracking-tight border-b border-gray-200 pb-3">Thông tin cơ bản</h3>
                                <div>
                                    <label className="form-label block mb-2 font-bold text-xs uppercase text-gray-500 tracking-widest">Tên Gym Center *</label>
                                    <input
                                        type="text"
                                        className="form-input w-full"
                                        value={settingsForm.name}
                                        onChange={(e) => setSettingsForm((prev: typeof settingsForm) => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="form-label block mb-2 font-bold text-xs uppercase text-gray-500 tracking-widest">Giới thiệu tổng quan</label>
                                    <textarea
                                        className="form-input w-full h-32"
                                        value={settingsForm.description}
                                        onChange={(e) => setSettingsForm((prev: typeof settingsForm) => ({ ...prev, description: e.target.value }))}
                                        placeholder="Mô tả về quy mô, các tiện ích và định hướng của hệ thống phòng tập..."
                                    ></textarea>
                                </div>

                                <h3 className="text-lg font-black uppercase tracking-tight border-b border-gray-200 pb-3 mt-8">Liên kết MXH</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label block mb-2 font-bold text-xs uppercase text-gray-500 tracking-widest">Fanpage Facebook</label>
                                        <input type="text" className="form-input w-full placeholder-gray-300" placeholder="https://facebook.com/..." />
                                    </div>
                                    <div>
                                        <label className="form-label block mb-2 font-bold text-xs uppercase text-gray-500 tracking-widest">Website / Tiktok</label>
                                        <input type="text" className="form-input w-full placeholder-gray-300" placeholder="https://..." />
                                    </div>
                                </div>

                                <button
                                    className="btn-primary w-full py-4 text-sm mt-8 shadow-none border border-black hover:bg-black hover:text-white"
                                    onClick={handleSaveSettings}
                                    disabled={saving}
                                >
                                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>

                            <div className="col-span-1 space-y-6">
                                <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm text-center">
                                    <h3 className="text-sm font-black uppercase tracking-tight mb-4">Logo Phòng Tập</h3>
                                    <div className="w-32 h-32 mx-auto bg-gray-50 rounded-full border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-500 hover:bg-white hover:border-black hover:text-black cursor-pointer transition-colors mb-4 group">
                                        <Upload className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-center px-4 leading-tight">Tải ảnh lên<br />(Tối đa 2MB)</span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
                                    <h3 className="text-sm font-black uppercase tracking-tight mb-2">Public Profile</h3>
                                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">Hồ sơ sẽ hiển thị tới công chúng sau khi được admin GYMERVIET phê duyệt.</p>
                                    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Trạng thái</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-green-700 bg-green-100 px-2 py-1 rounded-sm">Đang hoạt động</span>
                                    </div>
                                </div>
                            </div>
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

            {/* Invite Coach Overlay */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setShowInviteModal(false)}>
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
                                    value={inviteForm.email}
                                    onChange={e => setInviteForm((prev: typeof inviteForm) => ({ ...prev, email: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Vai trò</label>
                                <select 
                                    className="form-input w-full"
                                    value={inviteForm.role}
                                    onChange={e => setInviteForm((prev: typeof inviteForm) => ({ ...prev, role: e.target.value }))}
                                >
                                    <option value="Coach">Coach (Huấn luyện viên)</option>
                                    <option value="Head Coach">Head Coach (HLV Trưởng)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                className="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!inviteForm.email || creatingBranch}
                                onClick={async () => {
                                    if (!inviteForm.email.trim() || !gym) return;
                                    // Use first branch if gym has branches, else use gym id as fallback
                                    const branches = gym.branches ?? [];
                                    const targetBranchId = branches[0]?.id ?? gym.id;
                                    try {
                                        const apiClient = (await import('../services/api')).default;
                                        await apiClient.post(`/gym-owner/branches/${targetBranchId}/trainers/invite`, {
                                            email: inviteForm.email.trim(),
                                            role: inviteForm.role,
                                        });
                                        toast.success(`Đã gửi lời mời đến ${inviteForm.email}`);
                                        setShowInviteModal(false);
                                        setInviteForm({ email: '', role: 'Coach' });
                                    } catch (err: any) {
                                        toast.error(err?.response?.data?.error || 'Không thể gửi lời mời. Vui lòng thử lại.');
                                    }
                                }}
                            >
                                Gửi lời mời
                            </button>
                            <button className="flex-1 py-3 border border-gray-200 rounded-lg font-bold text-sm text-gray-600 hover:border-black transition-colors" onClick={() => setShowInviteModal(false)}>
                                Huỷ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GymOwnerDashboard;
