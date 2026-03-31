import React from 'react';
import type { GymBranch, User } from '../../types';

interface BranchCoachesTabProps {
    branch: GymBranch;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    inviteRole: string;
    setInviteRole: (role: string) => void;
    searching: boolean;
    handleSearchCoaches: () => void;
    searchResults: User[];
    handleInviteTrainer: (userId: string) => void;
    handleRemoveTrainer: (linkId: string) => void;
}

export const BranchCoachesTab: React.FC<BranchCoachesTabProps> = ({
    branch,
    searchQuery,
    setSearchQuery,
    inviteRole,
    setInviteRole,
    searching,
    handleSearchCoaches,
    searchResults,
    handleInviteTrainer,
    handleRemoveTrainer
}) => {
    return (
        <div className="animate-fade-in space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-sm font-black uppercase tracking-widest mb-4">Mời huấn luyện viên tham gia</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Nhập tên hoặc email huấn luyện viên..."
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
                        <option value="Huấn luyện viên yoga">Huấn luyện viên yoga</option>
                    </select>
                    <button
                        onClick={handleSearchCoaches}
                        className="btn-primary px-6 text-[10px] font-black uppercase"
                    >
                        {searching ? 'Đang tìm...' : 'Tìm'}
                    </button>
                </div>

                {searchResults.length > 0 && (
                    <div className="mt-4 divide-y divide-gray-100 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
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
                                        <p className="text-[8px] text-gray-500 font-bold uppercase">{user.email}</p>
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
                    <div key={link.id} className="p-4 bg-white border border-gray-200 rounded-lg flex items-center justify-between group hover:border-black transition-all">
                        <div className="flex items-center gap-4">
                            <img
                                src={link.trainer?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(link.trainer?.full_name || 'C')}&background=000&color=fff`}
                                className="w-12 h-12 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all"
                                alt="Huấn luyện viên"
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
                    <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-200 rounded-lg text-gray-500 text-xs font-bold uppercase">
                        Chưa có huấn luyện viên nào liên kết
                    </div>
                )}
            </div>
        </div>
    );
};
