import React from 'react';
import type { GymBranch, GymEvent } from '../../types';

interface BranchEventsTabProps {
    branch: GymBranch;
    newEvent: Partial<GymEvent>;
    setNewEvent: (event: Partial<GymEvent>) => void;
    handleCreateEvent: () => void;
    handleDeleteEvent: (eventId: string) => void;
    loading: boolean;
}

export const BranchEventsTab: React.FC<BranchEventsTabProps> = ({
    branch,
    newEvent,
    setNewEvent,
    handleCreateEvent,
    handleDeleteEvent,
    loading
}) => {
    return (
        <div className="animate-fade-in space-y-8">
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
                <h3 className="text-sm font-black uppercase tracking-widest mb-4">Tạo sự kiện mới</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Tên sự kiện / Lớp học..."
                        value={newEvent.title}
                        onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                    <select
                        className="form-input"
                        value={newEvent.event_type}
                        onChange={e => setNewEvent({ ...newEvent, event_type: e.target.value as any })}
                    >
                        <option value="class">Lớp học</option>
                        <option value="workshop">Workshop</option>
                        <option value="competition">Cuộc thi</option>
                        <option value="promotion">Khuyến mãi</option>
                        <option value="other">Khác</option>
                    </select>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Bắt đầu</label>
                        <input
                            type="datetime-local"
                            className="form-input"
                            value={newEvent.start_time}
                            onChange={e => setNewEvent({ ...newEvent, start_time: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Kết thúc</label>
                        <input
                            type="datetime-local"
                            className="form-input"
                            value={newEvent.end_time}
                            onChange={e => setNewEvent({ ...newEvent, end_time: e.target.value })}
                        />
                    </div>
                </div>
                <textarea
                    className="form-input h-24 mb-4"
                    placeholder="Mô tả chi tiết sự kiện..."
                    value={newEvent.description || ''}
                    onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                />
                <button
                    onClick={handleCreateEvent}
                    disabled={loading || !newEvent.title}
                    className="btn-primary px-8 py-3 text-[10px] font-black uppercase tracking-widest"
                >
                    Đăng sự kiện
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {branch.events?.map((evt) => (
                    <div key={evt.id} className="flex border border-gray-200 rounded-lg overflow-hidden hover:border-black transition-colors group">
                        <div className="bg-gray-50 w-24 flex flex-col items-center justify-center p-2 text-center">
                            <span className="text-[10px] font-black uppercase">{new Date(evt.start_time).toLocaleDateString('vi-VN', { weekday: 'short' })}</span>
                            <span className="text-2xl font-black">{new Date(evt.start_time).getDate()}</span>
                            <span className="text-[10px] font-black uppercase">Tháng {new Date(evt.start_time).getMonth() + 1}</span>
                        </div>
                        <div className="p-4 flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="px-2 py-0.5 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-full mb-2 inline-block">
                                        {evt.event_type}
                                    </span>
                                    <h4 className="text-sm font-black uppercase tracking-tight">{evt.title}</h4>
                                    <p className="text-[10px] font-bold text-gray-500 mt-1">
                                        {new Date(evt.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(evt.end_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDeleteEvent(evt.id)}
                                    className="text-gray-300 hover:text-red-500 transition-colors py-1 px-2 text-[10px] font-black uppercase border border-gray-200 rounded group-hover:border-red-100"
                                >
                                    Hủy bỏ
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {(!branch.events || branch.events.length === 0) && (
                    <div className="py-10 text-center border-2 border-dashed border-gray-200 rounded-lg text-gray-500 text-xs font-bold uppercase">
                        Chưa có sự kiện nào được lên lịch
                    </div>
                )}
            </div>
        </div>
    );
};
