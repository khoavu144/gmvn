import { Request, Response } from 'express';
import { uploadFileToSupabase } from '../services/storageService';

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, error: 'No file uploaded' });
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
        res.status(500).json({ success: false, error: error.message || 'File upload failed' });
    }
};
