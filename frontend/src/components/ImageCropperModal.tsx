import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
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
            <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                    >
                        <i className="fi fi-rr-cross"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-zinc-50 dark:bg-black/50">
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
                <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 bg-white dark:bg-zinc-900">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2.5 rounded-xl font-medium text-white bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition"
                    >
                        Tiếp tục
                    </button>
                </div>
            </div>
        </div>
    );
};
