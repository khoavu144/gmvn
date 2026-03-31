import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useGymOwnerDashboard } from '../hooks/useGymOwnerDashboard';
import GymBranchEditor from '../components/GymBranchEditor';
import DashboardSidebar from '../components/gym-owner/DashboardSidebar';
import DashboardOverviewTab from '../components/gym-owner/DashboardOverviewTab';
import DashboardBranchesTab from '../components/gym-owner/DashboardBranchesTab';
import DashboardTrainersTab from '../components/gym-owner/DashboardTrainersTab';
import DashboardSettingsTab from '../components/gym-owner/DashboardSettingsTab';
import InviteCoachModal from '../components/gym-owner/InviteCoachModal';

const GymOwnerDashboard: React.FC = () => {
    const {
        toast,
        ToastComponent,
        gym,
        loading,
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
        stats,
        showInviteModal,
        setShowInviteModal,
        inviteForm,
        setInviteForm,
        settingsForm,
        setSettingsForm,
        saving,
        fetchMyGym,
        handleCreateBranch,
        handleSaveSettings,
    } = useGymOwnerDashboard();

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
                <title>Bảng điều khiển chủ phòng tập — GYMERVIET</title>
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

            <DashboardSidebar 
                gym={gym}
                activeTab={activeTab}
                isSidebarOpen={isSidebarOpen}
                onTabChange={setActiveTab}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main content */}
            <div className="flex-1 p-6 md:p-10 overflow-y-auto">
                {activeTab === 'overview' && (
                    <DashboardOverviewTab gym={gym} stats={stats} branches={branches} />
                )}

                {activeTab === 'branches' && (
                    <DashboardBranchesTab 
                        branches={branches}
                        showNewBranchForm={showNewBranchForm}
                        setShowNewBranchForm={setShowNewBranchForm}
                        newBranchForm={newBranchForm}
                        setNewBranchForm={setNewBranchForm}
                        handleCreateBranch={handleCreateBranch}
                        creatingBranch={creatingBranch}
                        setEditingBranch={setEditingBranch}
                    />
                )}

                {activeTab === 'trainers' && (
                    <DashboardTrainersTab 
                        branches={branches}
                        onInviteClick={() => setShowInviteModal(true)}
                    />
                )}

                {activeTab === 'settings' && (
                    <DashboardSettingsTab 
                        form={settingsForm}
                        onChange={setSettingsForm}
                        onSave={handleSaveSettings}
                        saving={saving}
                    />
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
                <InviteCoachModal 
                    gym={gym}
                    form={inviteForm}
                    onChange={setInviteForm}
                    onClose={() => setShowInviteModal(false)}
                    onSuccess={(msg) => {
                        toast.success(msg);
                        setShowInviteModal(false);
                        setInviteForm({ email: '', role: 'Coach' });
                    }}
                    onError={(msg) => toast.error(msg)}
                    isSending={creatingBranch /* Resusing loading state for now, maybe use dedicated if needed */}
                />
            )}

            {ToastComponent}
        </div>
    );
};

export default GymOwnerDashboard;
