import { Upload } from 'lucide-react';

interface SettingsFormData {
    name: string;
    description: string;
}

interface Props {
    form: SettingsFormData;
    onChange: (updater: (prev: SettingsFormData) => SettingsFormData) => void;
    onSave: () => void;
    saving: boolean;
}

export default function DashboardSettingsTab({ form, onChange, onSave, saving }: Props) {
    return (
        <div className="animate-fade-in">
            <div className="mb-10">
                <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Hồ sơ Thương hiệu</h1>
                <p className="text-gray-500">Cập nhật thông tin hệ thống phòng tập và bộ nhận diện</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6 bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-black uppercase tracking-tight border-b border-gray-200 pb-3">Thông tin cơ bản</h3>
                    <div>
                        <label className="form-label block mb-2 font-bold text-xs uppercase text-gray-500 tracking-widest">Tên phòng tập *</label>
                        <input
                            type="text"
                            className="form-input w-full"
                            value={form.name}
                            onChange={(e) => onChange((prev) => ({ ...prev, name: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="form-label block mb-2 font-bold text-xs uppercase text-gray-500 tracking-widest">Giới thiệu tổng quan</label>
                        <textarea
                            className="form-input w-full h-32"
                            value={form.description}
                            onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
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
                        onClick={onSave}
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
                        <h3 className="text-sm font-black uppercase tracking-tight mb-2">Hồ sơ công khai</h3>
                        <p className="text-xs text-gray-500 mb-4 leading-relaxed">Hồ sơ sẽ hiển thị tới công chúng sau khi được admin GYMERVIET phê duyệt.</p>
                        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Trạng thái</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-green-700 bg-green-100 px-2 py-1 rounded-sm">Đang hoạt động</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
