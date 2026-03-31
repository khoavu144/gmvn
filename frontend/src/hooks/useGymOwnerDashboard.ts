import { useState, useEffect } from 'react';
import { logger } from '../lib/logger';
import { useToast } from '../components/Toast';
import { gymService } from '../services/gymService';
import type { GymCenter, GymBranch } from '../types';

export function useGymOwnerDashboard() {
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

    useEffect(() => {
        fetchMyGym();
    }, []);

    const handleCreateBranch = async () => {
        if (!newBranchForm.branch_name || !newBranchForm.address) {
            toast.error('Nhập tên chi nhánh và địa chỉ không được bỏ trống');
            return;
        }
        setCreatingBranch(true);
        try {
            const res = await gymService.createBranch(newBranchForm);
            if (res.success) {
                toast.success(`Tạo chi nhánh "${newBranchForm.branch_name}" thành công!`);
                setShowNewBranchForm(false);
                setNewBranchForm({ branch_name: '', address: '', city: '', district: '', phone: '', description: '' });
                fetchMyGym(); // reload fresh data
            }
        } catch {
            toast.error('Lỗi tạo chi nhánh');
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
                toast.success('Cập nhật thành công!');
            }
        } catch {
            toast.error('Lỗi cập nhật cài đặt');
        } finally {
            setSaving(false);
        }
    };

    return {
        toast,
        ToastComponent,
        gym,
        setGym,
        loading,
        setLoading,
        activeTab,
        setActiveTab,
        isSidebarOpen,
        setIsSidebarOpen,
        editingBranch,
        setEditingBranch,
        showNewBranchForm,
        setShowNewBranchForm,
        newBranchForm,
        setNewBranchForm,
        creatingBranch,
        setCreatingBranch,
        stats,
        setStats,
        showInviteModal,
        setShowInviteModal,
        inviteForm,
        setInviteForm,
        settingsForm,
        setSettingsForm,
        saving,
        setSaving,
        fetchMyGym,
        handleCreateBranch,
        handleSaveSettings,
    };
}