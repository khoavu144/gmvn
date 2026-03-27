import React from 'react';

interface BranchInfoTabProps {
    infoForm: {
        branch_name: string;
        address: string;
        phone: string;
        email: string;
        description: string;
    };
    setInfoForm: (form: any) => void;
    handleSaveInfo: () => void;
    loading: boolean;
}

export const BranchInfoTab: React.FC<BranchInfoTabProps> = ({ infoForm, setInfoForm, handleSaveInfo, loading }) => {
    return (
        <div className="space-y-6 max-w-2xl animate-fade-in text-black">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Tên chi nhánh</label>
                    <input
                        type="text"
                        className="form-input"
                        value={infoForm.branch_name}
                        onChange={e => setInfoForm({ ...infoForm, branch_name: e.target.value })}
                        placeholder="VD: GYMERVIET - Quận 1"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Số điện thoại</label>
                    <input
                        type="text"
                        className="form-input"
                        value={infoForm.phone}
                        onChange={e => setInfoForm({ ...infoForm, phone: e.target.value })}
                    />
                </div>
            </div>
            <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Địa chỉ</label>
                <input
                    type="text"
                    className="form-input"
                    value={infoForm.address}
                    onChange={e => setInfoForm({ ...infoForm, address: e.target.value })}
                />
            </div>
            <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Giới thiệu chi nhánh</label>
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
    );
};
