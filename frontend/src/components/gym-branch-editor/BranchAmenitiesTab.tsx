import React from 'react';
import type { GymAmenity } from '../../types';

interface BranchAmenitiesTabProps {
    amenities: Partial<GymAmenity>[];
    setAmenities: (amenities: Partial<GymAmenity>[]) => void;
    newAmenity: { name: string; is_available: boolean };
    setNewAmenity: (amenity: { name: string; is_available: boolean }) => void;
    handleUpdateAmenities: (updated: Partial<GymAmenity>[]) => void;
}

export const BranchAmenitiesTab: React.FC<BranchAmenitiesTabProps> = ({
    amenities,
    setAmenities,
    newAmenity,
    setNewAmenity,
    handleUpdateAmenities
}) => {
    return (
        <div className="animate-fade-in text-black">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
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
                                    className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${item.is_available ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
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
    );
};
