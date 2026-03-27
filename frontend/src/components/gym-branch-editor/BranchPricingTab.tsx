import React from 'react';
import type { GymPricing } from '../../types';

interface BranchPricingTabProps {
    pricing: Partial<GymPricing>[];
    newPrice: Partial<GymPricing>;
    setNewPrice: (price: Partial<GymPricing>) => void;
    handleUpdatePricing: (updated: Partial<GymPricing>[]) => void;
}

export const BranchPricingTab: React.FC<BranchPricingTabProps> = ({
    pricing,
    newPrice,
    setNewPrice,
    handleUpdatePricing
}) => {
    return (
        <div className="animate-fade-in text-black font-black">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-black text-black">
                {pricing.map((item, idx) => (
                    <div key={idx} className="card relative group bg-gray-50 border-gray-200 hover:border-black transition-all">
                        <div className="mb-4">
                            <h4 className="text-sm font-black uppercase tracking-widest text-black">{item.plan_name}</h4>
                            <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-tighter">{item.billing_cycle}</p>
                        </div>
                        <p className="text-xl font-black mb-4">
                            {item.price?.toLocaleString('vi-VN')} ₫
                        </p>
                        <button
                            onClick={() => {
                                const fresh = pricing.filter((_, i) => i !== idx);
                                handleUpdatePricing(fresh);
                            }}
                            className="w-full py-2 bg-white text-gray-500 hover:text-red-600 border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
                        >
                            Xóa gói phí
                        </button>
                    </div>
                ))}

                {/* New Pricing Card */}
                <div className="card border-dashed border-2 border-gray-200 bg-white flex flex-col justify-center gap-4 text-black font-black">
                    <input
                        type="text"
                        className="form-input !py-1.5 !text-xs font-black text-black"
                        placeholder="Tên gói (VD: Gói Member 1 Tháng)"
                        value={newPrice.plan_name}
                        onChange={e => setNewPrice({ ...newPrice, plan_name: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-2 text-black">
                        <input
                            type="number"
                            className="form-input !py-1.5 !text-xs text-black"
                            placeholder="Số tiền (₫)"
                            value={newPrice.price || ''}
                            onChange={e => setNewPrice({ ...newPrice, price: parseInt(e.target.value) || 0 })}
                        />
                        <select
                            className="form-input !py-1.5 !text-xs text-black"
                            value={newPrice.billing_cycle}
                            onChange={e => setNewPrice({ ...newPrice, billing_cycle: e.target.value as any })}
                        >
                            <option value="per_day">Theo ngày</option>
                            <option value="per_month">Theo tháng</option>
                            <option value="per_quarter">Qúy (3 tháng)</option>
                            <option value="per_year">Theo năm</option>
                            <option value="per_session">Theo buổi</option>
                        </select>
                    </div>
                    <button
                        onClick={() => {
                            if (!newPrice.plan_name || !newPrice.price) return;
                            const fresh = [...pricing, { ...newPrice, is_highlighted: false, order_number: 0 }];
                            handleUpdatePricing(fresh);
                            setNewPrice({ plan_name: '', price: 0, billing_cycle: 'per_month' });
                        }}
                        className="btn-primary w-full !py-2.5 text-[10px] font-black uppercase"
                    >
                        Thêm gói mới
                    </button>
                </div>
            </div>
        </div>
    );
};
