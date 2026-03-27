import React from 'react';
import type { GymEquipment } from '../../types';

interface BranchEquipmentTabProps {
    equipment: Partial<GymEquipment>[];
    setEquipment: (equipment: Partial<GymEquipment>[]) => void;
    newEquip: { name: string; quantity: number; category: string };
    setNewEquip: (equip: { name: string; quantity: number; category: string }) => void;
    handleUpdateEquipment: (updated: Partial<GymEquipment>[]) => void;
}

export const BranchEquipmentTab: React.FC<BranchEquipmentTabProps> = ({
    equipment,
    newEquip,
    setNewEquip,
    handleUpdateEquipment
}) => {
    return (
        <div className="animate-fade-in text-black">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-black">Danh sách máy móc & thiết bị</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[9px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">Tên thiết bị</th>
                                <th className="px-6 py-3">Số lượng</th>
                                <th className="px-6 py-3">Nhóm</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs font-bold text-black font-black">
                            {equipment.map((item, idx) => (
                                <tr key={idx} className="group hover:bg-gray-50/50">
                                    <td className="px-6 py-4 text-black">{item.name}</td>
                                    <td className="px-6 py-4 text-black">{item.quantity}</td>
                                    <td className="px-6 py-4 uppercase tracking-tighter text-[10px] text-gray-500">{item.category}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => {
                                                const fresh = equipment.filter((_, i) => i !== idx);
                                                handleUpdateEquipment(fresh);
                                            }}
                                            className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 font-black font-bold"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-gray-50/50">
                                <td className="px-6 py-3">
                                    <input
                                        type="text"
                                        className="form-input !py-1 !text-xs"
                                        placeholder="Tên máy..."
                                        value={newEquip.name}
                                        onChange={e => setNewEquip({ ...newEquip, name: e.target.value })}
                                    />
                                </td>
                                <td className="px-6 py-3">
                                    <input
                                        type="number"
                                        className="form-input !py-1 !text-xs w-20"
                                        value={newEquip.quantity || 1}
                                        onChange={e => setNewEquip({ ...newEquip, quantity: parseInt(e.target.value) || 1 })}
                                    />
                                </td>
                                <td className="px-6 py-3">
                                    <select
                                        className="form-input !py-1 !text-xs"
                                        value={newEquip.category}
                                        onChange={e => setNewEquip({ ...newEquip, category: e.target.value })}
                                    >
                                        <option value="cardio">Cardio</option>
                                        <option value="strength">Sức mạnh</option>
                                        <option value="free_weights">Tạ tự do</option>
                                        <option value="functional">Chức năng</option>
                                        <option value="studio">Studio</option>
                                        <option value="other">Khác</option>
                                    </select>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <button
                                        onClick={() => {
                                            if (!newEquip.name) return;
                                            const fresh = [...equipment, { ...newEquip, is_available: true }];
                                            handleUpdateEquipment(fresh);
                                            setNewEquip({ name: '', quantity: 1, category: 'strength' });
                                        }}
                                        className="btn-primary !py-1.5 !px-3 text-[9px] font-black uppercase"
                                    >
                                        Thêm
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
