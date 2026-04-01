import { Request, Response } from 'express';
import { progressPhotoService } from '../services/progressPhotoService';
import { getErrorMessage } from '../utils/controllerUtils';

export const getProgressPhotos = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.user_id;
        const photos = await progressPhotoService.getByUser(userId);
        res.json(photos);
    } catch (error) {
        res.status(500).json({ message: getErrorMessage(error, 'Không thể tải ảnh tiến độ') });
    }
};

export const addProgressPhoto = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.user_id;
        const { image_url, caption, taken_at, weight_kg } = req.body;
        if (!image_url) {
            return res.status(400).json({ message: 'Thiếu đường dẫn ảnh' });
        }
        const photo = await progressPhotoService.create(userId, { image_url, caption, taken_at, weight_kg });
        res.status(201).json(photo);
    } catch (error) {
        res.status(500).json({ message: getErrorMessage(error, 'Không thể tạo ảnh tiến độ') });
    }
};

export const deleteProgressPhoto = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.user_id;
        const photoId = req.params.id as string;
        const success = await progressPhotoService.delete(photoId, userId);
        if (!success) {
            return res.status(404).json({ message: 'Không tìm thấy ảnh hoặc bạn không có quyền truy cập' });
        }
        res.json({ message: 'Đã xóa thành công' });
    } catch (error) {
        res.status(500).json({ message: getErrorMessage(error, 'Không thể xóa ảnh tiến độ') });
    }
};
