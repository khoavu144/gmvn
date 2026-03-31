import { Search, LinkIcon, Trash2 } from 'lucide-react';
import type { GymBranch } from '../../types';

interface Props {
    branches: GymBranch[];
    onInviteClick: () => void;
}

export default function DashboardTrainersTab({ branches, onInviteClick }: Props) {
    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Quản lý huấn luyện viên liên kết</h1>
                    <p className="text-gray-500">Mời huấn luyện viên tham gia chi nhánh và cấp quyền quản lý hội viên</p>
                </div>
                <button
                    className="btn-primary py-2 px-4 shadow-none flex items-center gap-2"
                    onClick={onInviteClick}
                >
                    <LinkIcon className="w-4 h-4" /> Mời huấn luyện viên mới
                </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Tìm kiếm tên, SĐT huấn luyện viên..." className="form-input pl-10 w-full" />
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
                                <h3 className="font-bold text-base flex items-center gap-2">Huấn luyện viên Nguyễn Văn A {i === 1 && <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm">Premium</span>}</h3>
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
    );
}
