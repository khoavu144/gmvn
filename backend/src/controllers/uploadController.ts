import { Request, Response } from 'express';
import { uploadFileToSupabase } from '../services/storageService';
import { getErrorMessage } from '../utils/controllerUtils';

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, error: 'Chưa có tệp nào được tải lên' });
            return;
        }

        // P0-3: Magic bytes check to ensure file is really an image
        const isSafeImage = (buffer: Buffer): boolean => {
            if (buffer.length < 12) return false;
            // JPEG
            if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;
            // PNG
            if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true;
            // WebP
            const riff = buffer.toString('ascii', 0, 4);
            const webp = buffer.toString('ascii', 8, 12);
            if (riff === 'RIFF' && webp === 'WEBP') return true;
            return false;
        };

        if (!isSafeImage(req.file.buffer)) {
            res.status(400).json({ success: false, error: 'Nội dung tệp không hợp lệ: chỉ hỗ trợ ảnh JPG, PNG hoặc WebP' });
            return;
        }

        const folder = req.body.folder || 'misc';

        const publicUrl = await uploadFileToSupabase(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype,
            folder
        );

        res.json({
            success: true,
            data: {
                url: publicUrl,
                filename: req.file.originalname
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: getErrorMessage(error, 'Tải tệp lên thất bại') });
    }
};
