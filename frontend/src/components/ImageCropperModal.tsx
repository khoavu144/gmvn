import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import { useFocusTrap } from '../hooks/useFocusTrap';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageFile: File | null;
    onCropComplete: (croppedImage: Blob) => void;
    aspectRatio?: number; // e.g., 1 for square, 16/9 for landscape. If undefined, free crop.
    title?: string;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
    isOpen,
    onClose,
    imageFile,
    onCropComplete,
    aspectRatio = 1,
    title = 'Cắt ảnh'
}) => {
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useFocusTrap(modalRef, isOpen);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (imageFile) {
            const reader = new FileReader();
            reader.addEventListener('load', () =>
                setImgSrc(reader.result?.toString() || '')
            );
            reader.readAsDataURL(imageFile);
        }
    }, [imageFile]);

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        // Default crop to center, 80% of min dimension
        const size = Math.min(width, height) * 0.8;
        const x = (width - size) / 2;
        const y = (height - size) / 2;

        setCrop({
            unit: 'px',
            width: size,
            height: size,
            x,
            y
        });
    };

    const handleSave = async () => {
        if (!imgRef.current || !completedCrop) return;

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Tối ưu độ phân giải đầu ra thay vì lấy đúng px gốc
        const targetWidth = 1080;
        const scaleX = targetWidth / completedCrop.width;
        const scaleY = aspectRatio ? scaleX : (1080 / completedCrop.height);

        canvas.width = Math.floor(completedCrop.width * scaleX);
        canvas.height = Math.floor(completedCrop.height * scaleY);

        ctx.imageSmoothingQuality = 'high';

        const cropX = completedCrop.x;
        const cropY = completedCrop.y;
        const cropWidth = completedCrop.width;
        const cropHeight = completedCrop.height;

        ctx.drawImage(
            image,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.toBlob(
            (blob) => {
                if (blob) {
                    onCropComplete(blob);
                    onClose();
                }
            },
            'image/webp', // Use webp for modern compression
            0.9
        );
    };

    if (!isOpen || !imgSrc) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div 
                ref={modalRef}
                role="dialog" 
                aria-modal="true"
                className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200"
            >

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        aria-label="Đóng hộp thoại cắt ảnh"
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        <i className="fi fi-rr-cross"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-50">
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={aspectRatio}
                        circularCrop={aspectRatio === 1} // if 1:1, show circle guide
                    >
                        <img
                            ref={imgRef}
                            alt="Crop me"
                            src={imgSrc}
                            onLoad={onImageLoad}
                            className="max-h-[60vh] object-contain"
                        />
                    </ReactCrop>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2.5 rounded-lg font-medium text-white bg-black hover:bg-gray-800 transition"
                    >
                        Tiếp tục
                    </button>
                </div>
            </div>
        </div>
    );
};
