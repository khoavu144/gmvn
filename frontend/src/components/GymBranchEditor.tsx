import React from 'react';
import { ConfirmModal } from '../components/ConfirmModal';
import type { GymBranch } from '../types';
import { useGymBranchEditor } from '../hooks/useGymBranchEditor';
import { BranchInfoTab } from './gym-branch-editor/BranchInfoTab';
import { BranchGalleryTab } from './gym-branch-editor/BranchGalleryTab';
import { BranchAmenitiesTab } from './gym-branch-editor/BranchAmenitiesTab';
import { BranchEquipmentTab } from './gym-branch-editor/BranchEquipmentTab';
import { BranchPricingTab } from './gym-branch-editor/BranchPricingTab';
import { BranchEventsTab } from './gym-branch-editor/BranchEventsTab';
import { BranchReviewsTab } from './gym-branch-editor/BranchReviewsTab';
import { BranchStatsTab } from './gym-branch-editor/BranchStatsTab';
import { BranchCoachesTab } from './gym-branch-editor/BranchCoachesTab';

interface GymBranchEditorProps {
    branch: GymBranch;
    onClose: () => void;
    onUpdate: () => void;
}

const GymBranchEditor: React.FC<GymBranchEditorProps> = ({ branch, onClose, onUpdate }) => {
    const editor = useGymBranchEditor({ branch, onUpdate });

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            {editor.ToastComponent}
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in text-black">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-black">{branch.branch_name}</h2>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Chỉnh sửa chi tiết chi nhánh</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-xl text-gray-500">✕</button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-white sticky top-0 px-2 overflow-x-auto">
                    {[
                        { id: 'info', label: 'Thông tin' },
                        { id: 'gallery', label: 'Thư viện ảnh' },
                        { id: 'amenities', label: 'Tiện ích' },
                        { id: 'equipment', label: 'Thiết bị' },
                        { id: 'pricing', label: 'Bảng giá' },
                        { id: 'events', label: 'Sự kiện' },
                        { id: 'reviews', label: 'Đánh giá' },
                        { id: 'stats', label: 'Thống kê' },
                        { id: 'coaches', label: 'Coach' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => editor.setActiveTab(tab.id as any)}
                            className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${editor.activeTab === tab.id ? 'text-black' : 'text-gray-500 hover:text-gray-600'
                                }`}
                        >
                            {tab.label}
                            {editor.activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-t-full" />}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 text-black">
                    {editor.activeTab === 'info' && (
                        <BranchInfoTab
                            infoForm={editor.infoForm}
                            setInfoForm={editor.setInfoForm}
                            handleSaveInfo={editor.handleSaveInfo}
                            loading={editor.loading}
                        />
                    )}

                    {editor.activeTab === 'gallery' && (
                        <BranchGalleryTab
                            branch={branch}
                            newImageUrl={editor.newImageUrl}
                            setNewImageUrl={editor.setNewImageUrl}
                            newImageCaption={editor.newImageCaption}
                            setNewImageCaption={editor.setNewImageCaption}
                            handleAddImage={editor.handleAddImage}
                            handleDeleteImage={editor.handleDeleteImage}
                            loading={editor.loading}
                        />
                    )}

                    {editor.activeTab === 'amenities' && (
                        <BranchAmenitiesTab
                            amenities={editor.amenities}
                            setAmenities={editor.setAmenities}
                            newAmenity={editor.newAmenity}
                            setNewAmenity={editor.setNewAmenity}
                            handleUpdateAmenities={editor.handleUpdateAmenities}
                        />
                    )}

                    {editor.activeTab === 'equipment' && (
                        <BranchEquipmentTab
                            equipment={editor.equipment}
                            setEquipment={editor.setEquipment}
                            newEquip={editor.newEquip}
                            setNewEquip={editor.setNewEquip}
                            handleUpdateEquipment={editor.handleUpdateEquipment}
                        />
                    )}

                    {editor.activeTab === 'pricing' && (
                        <BranchPricingTab
                            pricing={editor.pricing}
                            newPrice={editor.newPrice}
                            setNewPrice={editor.setNewPrice}
                            handleUpdatePricing={editor.handleUpdatePricing}
                        />
                    )}

                    {editor.activeTab === 'events' && (
                        <BranchEventsTab
                            branch={branch}
                            newEvent={editor.newEvent}
                            setNewEvent={editor.setNewEvent}
                            handleCreateEvent={editor.handleCreateEvent}
                            handleDeleteEvent={editor.handleDeleteEvent}
                            loading={editor.loading}
                        />
                    )}

                    {editor.activeTab === 'reviews' && (
                        <BranchReviewsTab branch={branch} />
                    )}

                    {editor.activeTab === 'stats' && (
                        <BranchStatsTab branch={branch} />
                    )}

                    {editor.activeTab === 'coaches' && (
                        <BranchCoachesTab
                            branch={branch}
                            searchQuery={editor.searchQuery}
                            setSearchQuery={editor.setSearchQuery}
                            inviteRole={editor.inviteRole}
                            setInviteRole={editor.setInviteRole}
                            searching={editor.searching}
                            handleSearchCoaches={editor.handleSearchCoaches}
                            searchResults={editor.searchResults}
                            handleInviteTrainer={editor.handleInviteTrainer}
                            handleRemoveTrainer={editor.handleRemoveTrainer}
                        />
                    )}
                </div>

                {/* Footer Info */}
                <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <span>ID: {branch.id}</span>
                    <span>Tất cả thay đổi đều được lưu tức thì vào hệ thống</span>
                </div>
            </div>

            <ConfirmModal
                isOpen={editor.confirmConfig.isOpen}
                title={editor.confirmConfig.title}
                description={editor.confirmConfig.description}
                confirmText="Xác nhận"
                isDestructive={editor.confirmConfig.isDestructive}
                onConfirm={editor.confirmConfig.onConfirm}
                onCancel={() => editor.setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default GymBranchEditor;
