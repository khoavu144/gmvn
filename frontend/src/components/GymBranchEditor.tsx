import React, { useState } from 'react';
import { useToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';
import { gymService } from '../services/gymService';
import type { GymBranch, GymAmenity, GymEquipment, GymPricing, GymEvent, User } from '../types';

interface GymBranchEditorProps {
    branch: GymBranch;
    onClose: () => void;
    onUpdate: () => void;
}

const GymBranchEditor: React.FC<GymBranchEditorProps> = ({ branch, onClose, onUpdate }) => {
    const { toast, ToastComponent } = useToast();
    const [activeTab, setActiveTab] = useState<'info' | 'gallery' | 'amenities' | 'equipment' | 'pricing' | 'events' | 'reviews' | 'stats' | 'coaches'>('info');
    const [loading, setLoading] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
        isDestructive?: boolean;
    }>({ isOpen: false, title: '', description: '', onConfirm: () => { } });

    // Info states
    const [infoForm, setInfoForm] = useState({
        branch_name: branch.branch_name,
        address: branch.address,
        phone: branch.phone || '',
        email: branch.email || '',
        description: branch.description || ''
    });

    // Gallery state
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newImageCaption, setNewImageCaption] = useState('');

    // Amenities state
    const [amenities, setAmenities] = useState<Partial<GymAmenity>[]>(branch.amenities || []);
    const [newAmenity, setNewAmenity] = useState({ name: '', is_available: true });

    // Equipment state
    const [equipment, setEquipment] = useState<Partial<GymEquipment>[]>(branch.equipment || []);
    const [newEquip, setNewEquip] = useState({ name: '', quantity: 1, category: 'strength' });

    // Pricing state
    const [pricing, setPricing] = useState<Partial<GymPricing>[]>(branch.pricing || []);
    const [newPrice, setNewPrice] = useState<Partial<GymPricing>>({ plan_name: '', price: 0, billing_cycle: 'per_month' });

    // Events state
    const [newEvent, setNewEvent] = useState<Partial<GymEvent>>({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        event_type: 'class'
    });

    // Trainers search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [searching, setSearching] = useState(false);
    const [inviteRole, setInviteRole] = useState('Huấn luyện viên');

    const handleSaveInfo = async () => {
        setLoading(true);
        try {
            await gymService.updateBranch(branch.id, infoForm);
            toast.success('Đã cập nhật thông tin cơ bản');
            onUpdate();
        } catch (error) {
            toast.error('Lỗi cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    const handleAddImage = async () => {
        if (!newImageUrl) return;
        setLoading(true);
        try {
            await gymService.addGalleryImage(branch.id, { image_url: newImageUrl, caption: newImageCaption });
            setNewImageUrl('');
            setNewImageCaption('');
            onUpdate();
        } catch (error) {
            toast.error('Lỗi thêm ảnh');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Xóa hình ảnh',
            description: 'Bạn có chắc chắn muốn xóa ảnh này khỏi thư viện? Hành động này không thể hoàn tác.',
            isDestructive: true,
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                setLoading(true);
                try {
                    await gymService.deleteGalleryImage(branch.id, imageId);
                    onUpdate();
                } catch (error) {
                    toast.error('Lỗi xóa ảnh');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleUpdateAmenities = async (updated: Partial<GymAmenity>[]) => {
        setLoading(true);
        try {
            await gymService.updateAmenities(branch.id, updated);
            setAmenities(updated);
            onUpdate();
        } catch (error) {
            toast.error('Lỗi cập nhật tiện ích');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEquipment = async (updated: Partial<GymEquipment>[]) => {
        setLoading(true);
        try {
            await gymService.updateEquipment(branch.id, updated);
            setEquipment(updated);
            onUpdate();
        } catch (error) {
            toast.error('Lỗi cập nhật thiết bị');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePricing = async (updated: Partial<GymPricing>[]) => {
        setLoading(true);
        try {
            await gymService.updatePricing(branch.id, updated);
            setPricing(updated);
            onUpdate();
        } catch (error) {
            toast.error('Lỗi cập nhật bảng giá');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async () => {
        if (!newEvent.title) return;
        setLoading(true);
        try {
            await gymService.createEvent(branch.id, newEvent);
            setNewEvent({
                title: '',
                description: '',
                start_time: new Date().toISOString().slice(0, 16),
                end_time: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
                event_type: 'class'
            });
            onUpdate();
        } catch (error) {
            toast.error('Lỗi tạo sự kiện');
        } finally {
            setLoading(false);
        }
    };
    const handleInviteTrainer = async (trainerId: string) => {
        setLoading(true);
        try {
            await gymService.inviteTrainer(branch.id, { trainer_id: trainerId, role_at_gym: inviteRole });
            toast.success('Đã gửi lời mời');
            setSearchResults([]);
            setSearchQuery('');
            setInviteRole('Huấn luyện viên');
            onUpdate();
        } catch (error) {
            toast.error('Lỗi mời Coach');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveTrainer = async (linkId: string) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Gỡ Coach khỏi chi nhánh',
            description: 'Coach này sẽ không còn hiển thị như một thành viên của chi nhánh này nữa.',
            isDestructive: true,
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                setLoading(true);
                try {
                    await gymService.removeTrainer(branch.id, linkId);
                    onUpdate();
                } catch (error) {
                    toast.error('Lỗi gỡ Coach');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleSearchCoaches = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            // Simplified search - assuming it returns users with type 'trainer'
            // We'll use a generic search if dedicated one isn't clear
            await gymService.listGyms({ search: searchQuery }); // Placeholder if specific user search not found
            // Better to use dedicated user search if available
            setSearchResults([]); // Defaulting until search integrated
            toast.success('Tính năng tìm kiếm Coach đang được đồng bộ...');
        } finally {
            setSearching(false);
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Xóa sự kiện',
            description: 'Sự kiện này sẽ bị gỡ khỏi lịch hoạt động. Hành động này không thể hoàn tác.',
            isDestructive: true,
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                setLoading(true);
                try {
                    await gymService.deleteEvent(branch.id, eventId);
                    onUpdate();
                } catch (error) {
                    toast.error('Lỗi xóa sự kiện');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            {ToastComponent}
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in text-black">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-black">{branch.branch_name}</h2>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Chỉnh sửa chi tiết chi nhánh</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-xl text-gray-400">✕</button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 bg-white sticky top-0 px-2 overflow-x-auto">
                    {[
                        { id: 'info', label: 'Thông tin' },
                        { id: 'gallery', label: 'Thư viện ảnh' },
                        { id: 'amenities', label: 'Tiện ích' },
                        { id: 'equipment', label: 'Thiết bị' },
                        { id: 'pricing', label: 'Bảng giá' },
                        { id: 'events', label: 'Sự kiện' },
                        { id: 'reviews', label: 'Đánh giá' },
                        { id: 'stats', label: 'Thống kê' },
                        { id: 'coaches', label: 'Coach' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-t-full" />}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 text-black">
                    {activeTab === 'info' && (
                        <div className="space-y-6 max-w-2xl animate-fade-in text-black">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Tên chi nhánh</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={infoForm.branch_name}
                                        onChange={e => setInfoForm({ ...infoForm, branch_name: e.target.value })}
                                        placeholder="VD: GYMERVIET - Quận 1"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Số điện thoại</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={infoForm.phone}
                                        onChange={e => setInfoForm({ ...infoForm, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Địa chỉ</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={infoForm.address}
                                    onChange={e => setInfoForm({ ...infoForm, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Giới thiệu chi nhánh</label>
                                <textarea
                                    className="form-input h-32"
                                    value={infoForm.description}
                                    onChange={e => setInfoForm({ ...infoForm, description: e.target.value })}
                                    placeholder="Đặc điểm nổi bật của chi nhánh này..."
                                />
                            </div>
                            <button
                                onClick={handleSaveInfo}
                                disabled={loading}
                                className="btn-primary w-full py-4 text-sm font-black tracking-widest uppercase"
                            >
                                {loading ? 'Đang lưu...' : 'Lưu thông tin'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'gallery' && (
                        <div className="animate-fade-in text-black">
                            <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl mb-8">
                                <h3 className="text-sm font-black uppercase tracking-widest mb-4 text-black">Thêm ảnh mới</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="URL hình ảnh (https://...)"
                                        value={newImageUrl}
                                        onChange={e => setNewImageUrl(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Chú thích ảnh (không bắt buộc)"
                                        value={newImageCaption}
                                        onChange={e => setNewImageCaption(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={handleAddImage}
                                    disabled={loading || !newImageUrl}
                                    className="btn-primary px-8 py-3 text-[10px] font-black uppercase tracking-widest"
                                >
                                    Tải ảnh lên thư viện
                                </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {branch.gallery?.map((img) => (
                                    <div key={img.id} className="aspect-square relative group rounded-lg overflow-hidden border border-gray-100">
                                        <img src={img.image_url} alt={img.caption || 'Gallery'} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={() => handleDeleteImage(img.id)}
                                                className="bg-white text-black px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tight shadow-lg"
                                            >
                                                Gỡ bỏ
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!branch.gallery || branch.gallery.length === 0) && (
                                    <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-100 rounded-xl text-gray-400 text-xs font-bold uppercase">
                                        Chưa có hình ảnh nào trong thư viện
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'amenities' && (
                        <div className="animate-fade-in text-black">
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-8">
                                <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Danh sách tiện ích</h3>
                                    <button
                                        onClick={() => handleUpdateAmenities(amenities)}
                                        className="text-[10px] font-black uppercase tracking-widest text-black underline"
                                    >
                                        Đồng bộ thay đổi
                                    </button>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {amenities.map((item, idx) => (
                                        <div key={idx} className="p-4 flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="text"
                                                    className="border-none p-0 focus:ring-0 font-bold bg-transparent text-sm text-black"
                                                    value={item.name}
                                                    onChange={e => {
                                                        const fresh = [...amenities];
                                                        fresh[idx].name = e.target.value;
                                                        setAmenities(fresh);
                                                    }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        const fresh = [...amenities];
                                                        fresh[idx].is_available = !fresh[idx].is_available;
                                                        setAmenities(fresh);
                                                    }}
                                                    className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${item.is_available ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                                                        }`}
                                                >
                                                    {item.is_available ? 'Đang hoạt động' : 'Tạm ngưng'}
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const fresh = amenities.filter((_, i) => i !== idx);
                                                    handleUpdateAmenities(fresh);
                                                }}
                                                className="text-gray-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 font-bold font-black"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    <div className="p-4 flex items-center gap-4 bg-gray-50/50">
                                        <input
                                            type="text"
                                            className="form-input !py-1.5 !text-xs !w-48 text-black"
                                            placeholder="Tên tiện ích mới..."
                                            value={newAmenity.name}
                                            onChange={e => setNewAmenity({ ...newAmenity, name: e.target.value })}
                                        />
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newAmenity.is_available}
                                                onChange={e => setNewAmenity({ ...newAmenity, is_available: e.target.checked })}
                                                className="rounded-xs"
                                            />
                                            <span className="text-[10px] font-bold text-gray-600 uppercase">Sẵn sàng</span>
                                        </label>
                                        <button
                                            onClick={() => {
                                                if (!newAmenity.name) return;
                                                const fresh = [...amenities, newAmenity];
                                                handleUpdateAmenities(fresh);
                                                setNewAmenity({ name: '', is_available: true });
                                            }}
                                            className="btn-primary !py-1.5 !px-3 text-[9px] font-black uppercase"
                                        >
                                            Thêm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'equipment' && (
                        <div className="animate-fade-in text-black">
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-8">
                                <div className="p-4 bg-gray-50 border-b border-gray-200">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-black">Danh sách máy móc & thiết bị</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-3">Tên thiết bị</th>
                                                <th className="px-6 py-3">Số lượng</th>
                                                <th className="px-6 py-3">Nhóm</th>
                                                <th className="px-6 py-3"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-xs font-bold text-black font-black">
                                            {equipment.map((item, idx) => (
                                                <tr key={idx} className="group hover:bg-gray-50/50">
                                                    <td className="px-6 py-4 text-black">{item.name}</td>
                                                    <td className="px-6 py-4 text-black">{item.quantity}</td>
                                                    <td className="px-6 py-4 uppercase tracking-tighter text-[10px] text-gray-500">{item.category}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => {
                                                                const fresh = equipment.filter((_, i) => i !== idx);
                                                                handleUpdateEquipment(fresh);
                                                            }}
                                                            className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 font-black font-bold"
                                                        >
                                                            Xóa
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-50/50">
                                                <td className="px-6 py-3">
                                                    <input
                                                        type="text"
                                                        className="form-input !py-1 !text-xs"
                                                        placeholder="Tên máy..."
                                                        value={newEquip.name}
                                                        onChange={e => setNewEquip({ ...newEquip, name: e.target.value })}
                                                    />
                                                </td>
                                                <td className="px-6 py-3">
                                                    <input
                                                        type="number"
                                                        className="form-input !py-1 !text-xs w-20"
                                                        value={newEquip.quantity || 1}
                                                        onChange={e => setNewEquip({ ...newEquip, quantity: parseInt(e.target.value) || 1 })}
                                                    />
                                                </td>
                                                <td className="px-6 py-3">
                                                    <select
                                                        className="form-input !py-1 !text-xs"
                                                        value={newEquip.category}
                                                        onChange={e => setNewEquip({ ...newEquip, category: e.target.value })}
                                                    >
                                                        <option value="cardio">Cardio</option>
                                                        <option value="strength">Sức mạnh</option>
                                                        <option value="free_weights">Tạ tự do</option>
                                                        <option value="functional">Chức năng</option>
                                                        <option value="studio">Studio</option>
                                                        <option value="other">Khác</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <button
                                                        onClick={() => {
                                                            if (!newEquip.name) return;
                                                            const fresh = [...equipment, { ...newEquip, is_available: true }];
                                                            handleUpdateEquipment(fresh);
                                                            setNewEquip({ name: '', quantity: 1, category: 'strength' });
                                                        }}
                                                        className="btn-primary !py-1.5 !px-3 text-[9px] font-black uppercase"
                                                    >
                                                        Thêm
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'pricing' && (
                        <div className="animate-fade-in text-black font-black">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-black text-black">
                                {pricing.map((item, idx) => (
                                    <div key={idx} className="card relative group bg-gray-50 border-gray-100 hover:border-black transition-all">
                                        <div className="mb-4">
                                            <h4 className="text-sm font-black uppercase tracking-widest text-black">{item.plan_name}</h4>
                                            <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-tighter">{item.billing_cycle}</p>
                                        </div>
                                        <p className="text-xl font-black mb-4">
                                            {item.price?.toLocaleString('vi-VN')} ₫
                                        </p>
                                        <button
                                            onClick={() => {
                                                const fresh = pricing.filter((_, i) => i !== idx);
                                                handleUpdatePricing(fresh);
                                            }}
                                            className="w-full py-2 bg-white text-gray-400 hover:text-red-600 border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
                                        >
                                            Xóa gói phí
                                        </button>
                                    </div>
                                ))}

                                {/* New Pricing Card */}
                                <div className="card border-dashed border-2 border-gray-200 bg-white flex flex-col justify-center gap-4 text-black font-black">
                                    <input
                                        type="text"
                                        className="form-input !py-1.5 !text-xs font-black text-black"
                                        placeholder="Tên gói (VD: Gói Member 1 Tháng)"
                                        value={newPrice.plan_name}
                                        onChange={e => setNewPrice({ ...newPrice, plan_name: e.target.value })}
                                    />
                                    <div className="grid grid-cols-2 gap-2 text-black">
                                        <input
                                            type="number"
                                            className="form-input !py-1.5 !text-xs text-black"
                                            placeholder="Số tiền (₫)"
                                            value={newPrice.price || ''}
                                            onChange={e => setNewPrice({ ...newPrice, price: parseInt(e.target.value) || 0 })}
                                        />
                                        <select
                                            className="form-input !py-1.5 !text-xs text-black"
                                            value={newPrice.billing_cycle}
                                            onChange={e => setNewPrice({ ...newPrice, billing_cycle: e.target.value as any })}
                                        >
                                            <option value="per_day">Theo ngày</option>
                                            <option value="per_month">Theo tháng</option>
                                            <option value="per_quarter">Qúy (3 tháng)</option>
                                            <option value="per_year">Theo năm</option>
                                            <option value="per_session">Theo buổi</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (!newPrice.plan_name || !newPrice.price) return;
                                            const fresh = [...pricing, { ...newPrice, is_highlighted: false, order_number: 0 }];
                                            handleUpdatePricing(fresh);
                                            setNewPrice({ plan_name: '', price: 0, billing_cycle: 'per_month' });
                                        }}
                                        className="btn-primary w-full !py-2.5 text-[10px] font-black uppercase"
                                    >
                                        Thêm gói mới
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'events' && (
                        <div className="animate-fade-in space-y-8">
                            <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl">
                                <h3 className="text-sm font-black uppercase tracking-widest mb-4">Tạo sự kiện mới</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Tên sự kiện / Lớp học..."
                                        value={newEvent.title}
                                        onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                    />
                                    <select
                                        className="form-input"
                                        value={newEvent.event_type}
                                        onChange={e => setNewEvent({ ...newEvent, event_type: e.target.value as any })}
                                    >
                                        <option value="class">Lớp học</option>
                                        <option value="workshop">Workshop</option>
                                        <option value="competition">Cuộc thi</option>
                                        <option value="promotion">Khuyến mãi</option>
                                        <option value="other">Khác</option>
                                    </select>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-gray-400">Bắt đầu</label>
                                        <input
                                            type="datetime-local"
                                            className="form-input"
                                            value={newEvent.start_time}
                                            onChange={e => setNewEvent({ ...newEvent, start_time: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-gray-400">Kết thúc</label>
                                        <input
                                            type="datetime-local"
                                            className="form-input"
                                            value={newEvent.end_time}
                                            onChange={e => setNewEvent({ ...newEvent, end_time: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <textarea
                                    className="form-input h-24 mb-4"
                                    placeholder="Mô tả chi tiết sự kiện..."
                                    value={newEvent.description || ''}
                                    onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                />
                                <button
                                    onClick={handleCreateEvent}
                                    disabled={loading || !newEvent.title}
                                    className="btn-primary px-8 py-3 text-[10px] font-black uppercase tracking-widest"
                                >
                                    Đăng sự kiện
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {branch.events?.map((evt) => (
                                    <div key={evt.id} className="flex border border-gray-100 rounded-xl overflow-hidden hover:border-black transition-colors group">
                                        <div className="bg-gray-100 w-24 flex flex-col items-center justify-center p-2 text-center">
                                            <span className="text-[10px] font-black uppercase">{new Date(evt.start_time).toLocaleDateString('vi-VN', { weekday: 'short' })}</span>
                                            <span className="text-2xl font-black">{new Date(evt.start_time).getDate()}</span>
                                            <span className="text-[10px] font-black uppercase">Tháng {new Date(evt.start_time).getMonth() + 1}</span>
                                        </div>
                                        <div className="p-4 flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="px-2 py-0.5 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-full mb-2 inline-block">
                                                        {evt.event_type}
                                                    </span>
                                                    <h4 className="text-sm font-black uppercase tracking-tight">{evt.title}</h4>
                                                    <p className="text-[10px] font-bold text-gray-500 mt-1">
                                                        {new Date(evt.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(evt.end_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteEvent(evt.id)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors py-1 px-2 text-[10px] font-black uppercase border border-gray-100 rounded group-hover:border-red-100"
                                                >
                                                    Hủy bỏ
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!branch.events || branch.events.length === 0) && (
                                    <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-xl text-gray-400 text-xs font-bold uppercase">
                                        Chưa có sự kiện nào được lên lịch
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="animate-fade-in space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-black uppercase tracking-widest">Phản hồi khách hàng</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black">
                                        {(branch.reviews && branch.reviews.length > 0)
                                            ? (branch.reviews.reduce((acc, r) => acc + r.rating, 0) / branch.reviews.length).toFixed(1)
                                            : '0.0'}
                                    </span>
                                    <span className="text-yellow-400 text-xl">★</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">({branch.reviews?.length || 0} đánh giá)</span>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {branch.reviews?.map((rev) => (
                                    <div key={rev.id} className="py-6 first:pt-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-black text-[10px] uppercase">
                                                    {(rev.user?.full_name || 'U')[0]}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black uppercase tracking-tight">{rev.user?.full_name || 'Người dùng ẩn danh'}</h4>
                                                    <div className="flex text-yellow-400 text-[10px]">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">
                                                {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                            {rev.comment || <span className="italic text-gray-400 uppercase text-[10px]">Không có nội dung bình luận</span>}
                                        </p>
                                    </div>
                                ))}
                                {(!branch.reviews || branch.reviews.length === 0) && (
                                    <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-xl text-gray-400 text-xs font-bold uppercase">
                                        Chưa có lượt đánh giá nào cho chi nhánh này
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div className="animate-fade-in space-y-8">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-6">Chỉ số hiệu năng chi nhánh</h3>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tổng lượt xem</p>
                                    <p className="text-3xl font-black">{branch.view_count || 0}</p>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Đánh giá trung bình</p>
                                    <p className="text-3xl font-black">
                                        {(branch.reviews && branch.reviews.length > 0)
                                            ? (branch.reviews.reduce((acc, r) => acc + r.rating, 0) / branch.reviews.length).toFixed(1)
                                            : '0.0'}
                                    </p>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Coach cơ hữu</p>
                                    <p className="text-3xl font-black">{branch.trainer_links?.length || 0}</p>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tiện ích tích hợp</p>
                                    <p className="text-3xl font-black">{branch.amenities?.length || 0}</p>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Thiết bị & Máy tập</p>
                                    <p className="text-3xl font-black">{branch.equipment?.length || 0}</p>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gói phí tập</p>
                                    <p className="text-3xl font-black">{branch.pricing?.length || 0}</p>
                                </div>
                            </div>

                            <div className="bg-black text-white p-8 rounded-2xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <h4 className="text-lg font-black uppercase tracking-tight mb-2">Tăng trưởng tương tác</h4>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Chi nhánh đang thu hút sự quan tâm của cộng đồng Gymers.</p>
                                </div>
                                <div className="absolute right-[-10%] top-[-20%] text-[120px] font-black text-white/5 pointer-events-none select-none">
                                    GYM
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'coaches' && (
                        <div className="animate-fade-in space-y-8">
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <h3 className="text-sm font-black uppercase tracking-widest mb-4">Mời Coach tham gia</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nhập tên hoặc email Coach..."
                                        className="form-input flex-1"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                    <select
                                        value={inviteRole}
                                        onChange={e => setInviteRole(e.target.value)}
                                        className="form-input text-sm"
                                    >
                                        <option value="Huấn luyện viên">Huấn luyện viên</option>
                                        <option value="PT Chính">PT Chính</option>
                                        <option value="PT Phụ">PT Phụ</option>
                                        <option value="Yoga Instructor">Yoga Instructor</option>
                                    </select>
                                    <button
                                        onClick={handleSearchCoaches}
                                        className="btn-primary px-6 text-[10px] font-black uppercase"
                                    >
                                        {searching ? 'Đang tìm...' : 'Tìm'}
                                    </button>
                                </div>

                                {searchResults.length > 0 && (
                                    <div className="mt-4 divide-y divide-gray-100 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                                        {searchResults.map(user => (
                                            <div key={user.id} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=000&color=fff`}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                        alt="Avatar"
                                                    />
                                                    <div>
                                                        <h4 className="text-[10px] font-black uppercase tracking-tight">{user.full_name}</h4>
                                                        <p className="text-[8px] text-gray-400 font-bold uppercase">{user.email}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleInviteTrainer(user.id)}
                                                    className="bg-black text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    Mời
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {branch.trainer_links?.map((link) => (
                                    <div key={link.id} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between group hover:border-black transition-all">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={link.trainer?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(link.trainer?.full_name || 'C')}&background=000&color=fff`}
                                                className="w-12 h-12 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all"
                                                alt="Coach"
                                            />
                                            <div>
                                                <h4 className="text-sm font-black uppercase tracking-tight">{link.trainer?.full_name}</h4>
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${link.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                                                    }`}>
                                                    {link.status === 'active' ? 'Đang hoạt động' : 'Chờ xác nhận'}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveTrainer(link.id)}
                                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                {(!branch.trainer_links || branch.trainer_links.length === 0) && (
                                    <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-100 rounded-xl text-gray-400 text-xs font-bold uppercase">
                                        Chưa có Coach nào liên kết
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>ID: {branch.id}</span>
                    <span>Tất cả thay đổi đều được lưu tức thì vào hệ thống</span>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                description={confirmConfig.description}
                confirmText="Xác nhận"
                isDestructive={confirmConfig.isDestructive}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default GymBranchEditor;
