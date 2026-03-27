import type { GymBranch } from '../../types';
import NewBranchForm from './NewBranchForm';

interface NewBranchFormData {
    branch_name: string;
    address: string;
    city: string;
    district: string;
    phone: string;
    description: string;
}

interface Props {
    branches: GymBranch[];
    showNewBranchForm: boolean;
    setShowNewBranchForm: (show: boolean) => void;
    newBranchForm: NewBranchFormData;
    setNewBranchForm: (updater: (prev: NewBranchFormData) => NewBranchFormData) => void;
    handleCreateBranch: () => void;
    creatingBranch: boolean;
    setEditingBranch: (branch: GymBranch) => void;
}

export default function DashboardBranchesTab({
    branches,
    showNewBranchForm,
    setShowNewBranchForm,
    newBranchForm,
    setNewBranchForm,
    handleCreateBranch,
    creatingBranch,
    setEditingBranch
}: Props) {
    return (
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

            {showNewBranchForm && (
                <NewBranchForm
                    form={newBranchForm}
                    onChange={setNewBranchForm}
                    onSubmit={handleCreateBranch}
                    onCancel={() => setShowNewBranchForm(false)}
                    loading={creatingBranch}
                />
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
    );
}
