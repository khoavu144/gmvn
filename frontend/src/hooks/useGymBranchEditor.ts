import { useState } from 'react';
import { useToast } from '../components/Toast';
import { gymService } from '../services/gymService';
import { userService } from '../services/userService';
import type { GymBranch, GymAmenity, GymEquipment, GymPricing, GymEvent, User } from '../types';

export interface UseGymBranchEditorProps {
    branch: GymBranch;
    onUpdate: () => void;
}

export const useGymBranchEditor = ({ branch, onUpdate }: UseGymBranchEditorProps) => {
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
        } catch {
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
        } catch {
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
                } catch {
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
        } catch {
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
        } catch {
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
        } catch {
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
        } catch {
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
        } catch {
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
                } catch {
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
            const results = await userService.searchCoaches(searchQuery);
            setSearchResults(results);
        } catch {
            toast.error('Lỗi tìm kiếm Coach');
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
                } catch {
                    toast.error('Lỗi xóa sự kiện');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    return {
        // Shared states
        activeTab,
        setActiveTab,
        loading,
        confirmConfig,
        setConfirmConfig,
        ToastComponent,

        // Info
        infoForm,
        setInfoForm,
        handleSaveInfo,

        // Gallery
        newImageUrl,
        setNewImageUrl,
        newImageCaption,
        setNewImageCaption,
        handleAddImage,
        handleDeleteImage,

        // Amenities
        amenities,
        setAmenities,
        newAmenity,
        setNewAmenity,
        handleUpdateAmenities,

        // Equipment
        equipment,
        setEquipment,
        newEquip,
        setNewEquip,
        handleUpdateEquipment,

        // Pricing
        pricing,
        setPricing,
        newPrice,
        setNewPrice,
        handleUpdatePricing,

        // Events
        newEvent,
        setNewEvent,
        handleCreateEvent,
        handleDeleteEvent,

        // Coaches
        searchQuery,
        setSearchQuery,
        searchResults,
        setSearchResults,
        searching,
        inviteRole,
        setInviteRole,
        handleInviteTrainer,
        handleRemoveTrainer,
        handleSearchCoaches
    };
};
