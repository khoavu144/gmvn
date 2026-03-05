import { Request, Response } from 'express';
import { progressPhotoService } from '../services/progressPhotoService';

export const getProgressPhotos = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.user_id;
        const photos = await progressPhotoService.getByUser(userId);
        res.json(photos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching progress photos' });
    }
};

export const addProgressPhoto = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.user_id;
        const { image_url, caption, taken_at, weight_kg } = req.body;
        if (!image_url) {
            return res.status(400).json({ message: 'Missing image_url' });
        }
        const photo = await progressPhotoService.create(userId, { image_url, caption, taken_at, weight_kg });
        res.status(201).json(photo);
    } catch (error) {
        res.status(500).json({ message: 'Error creating progress photo' });
    }
};

export const deleteProgressPhoto = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.user_id;
        const photoId = req.params.id as string;
        const success = await progressPhotoService.delete(photoId, userId);
        if (!success) {
            return res.status(404).json({ message: 'Photo not found or unauthorized' });
        }
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting progress photo' });
    }
};
