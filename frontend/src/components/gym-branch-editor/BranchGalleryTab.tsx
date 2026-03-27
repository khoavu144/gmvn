import React from 'react';
import type { GymBranch } from '../../types';

interface BranchGalleryTabProps {
    branch: GymBranch;
    newImageUrl: string;
    setNewImageUrl: (url: string) => void;
    newImageCaption: string;
    setNewImageCaption: (caption: string) => void;
    handleAddImage: () => void;
    handleDeleteImage: (imageId: string) => void;
    loading: boolean;
}

export const BranchGalleryTab: React.FC<BranchGalleryTabProps> = ({
    branch,
    newImageUrl,
    setNewImageUrl,
    newImageCaption,
    setNewImageCaption,
    handleAddImage,
    handleDeleteImage,
    loading
}) => {
    return (
        <div className="animate-fade-in text-black">
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg mb-8">
                <h3 className="text-sm font-black uppercase tracking-widest mb-4 text-black">Thêm ảnh mới</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="URL hình ảnh (https://...)"
                        value={newImageUrl}
                        onChange={e => setNewImageUrl(e.target.value)}
                    />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Chú thích ảnh (không bắt buộc)"
                        value={newImageCaption}
                        onChange={e => setNewImageCaption(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleAddImage}
                    disabled={loading || !newImageUrl}
                    className="btn-primary px-8 py-3 text-[10px] font-black uppercase tracking-widest"
                >
                    Tải ảnh lên thư viện
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {branch.gallery?.map((img) => (
                    <div key={img.id} className="aspect-square relative group rounded-lg overflow-hidden border border-gray-200">
                        <img src={img.image_url} alt={img.caption || 'Gallery'} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={() => handleDeleteImage(img.id)}
                                className="bg-white text-black px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tight shadow-lg"
                            >
                                Gỡ bỏ
                            </button>
                        </div>
                    </div>
                ))}
                {(!branch.gallery || branch.gallery.length === 0) && (
                    <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-200 rounded-lg text-gray-500 text-xs font-bold uppercase">
                        Chưa có hình ảnh nào trong thư viện
                    </div>
                )}
            </div>
        </div>
    );
};
