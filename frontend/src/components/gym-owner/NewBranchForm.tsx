interface NewBranchFormData {
    branch_name: string;
    address: string;
    city: string;
    district: string;
    phone: string;
    description: string;
}

interface Props {
    form: NewBranchFormData;
    onChange: (updater: (prev: NewBranchFormData) => NewBranchFormData) => void;
    onSubmit: () => void;
    onCancel: () => void;
    loading: boolean;
}

export default function NewBranchForm({ form, onChange, onSubmit, onCancel, loading }: Props) {
    return (
        <div className="mb-8 p-6 border-2 border-black rounded-lg bg-gray-50 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black uppercase tracking-tight">Thêm Chi Nhánh Mới</h2>
                <button onClick={onCancel} className="text-gray-500 hover:text-black text-2xl font-black transition-colors">×</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tên chi nhánh <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        className="form-input w-full"
                        placeholder="VD: GYMERVIET - Quận 3"
                        value={form.branch_name}
                        onChange={e => onChange((p) => ({ ...p, branch_name: e.target.value }))}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Số điện thoại</label>
                    <input
                        type="text"
                        className="form-input w-full"
                        placeholder="0987 654 321"
                        value={form.phone}
                        onChange={e => onChange((p) => ({ ...p, phone: e.target.value }))}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Địa chỉ <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        className="form-input w-full"
                        placeholder="Số nhà, tên đường..."
                        value={form.address}
                        onChange={e => onChange((p) => ({ ...p, address: e.target.value }))}
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Quận/Huyện</label>
                        <input
                            type="text"
                            className="form-input w-full"
                            placeholder="Quận 3"
                            value={form.district}
                            onChange={e => onChange((p) => ({ ...p, district: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Thành phố</label>
                        <input
                            type="text"
                            className="form-input w-full"
                            placeholder="TP HCM"
                            value={form.city}
                            onChange={e => onChange((p) => ({ ...p, city: e.target.value }))}
                        />
                    </div>
                </div>
            </div>
            <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Giới thiệu ngắn</label>
                <textarea
                    className="form-input w-full h-20"
                    placeholder="Đặc điểm nổi bật của chi nhánh này..."
                    value={form.description}
                    onChange={e => onChange((p) => ({ ...p, description: e.target.value }))}
                />
            </div>
            <div className="flex gap-3">
                <button
                    className="btn-primary px-8 py-3"
                    onClick={onSubmit}
                    disabled={loading}
                >
                    {loading ? 'Đang tạo...' : 'Tạo chi nhánh'}
                </button>
                <button
                    className="px-8 py-3 border border-gray-200 rounded-lg font-bold text-sm text-gray-600 hover:border-black transition-colors"
                    onClick={onCancel}
                >
                    Huỷ
                </button>
            </div>
        </div>
    );
}
