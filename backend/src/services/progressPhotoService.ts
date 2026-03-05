import { AppDataSource } from '../config/database';
import { ProgressPhoto } from '../entities/ProgressPhoto';

export const progressPhotoService = {
    async getByUser(userId: string) {
        const photoRepo = AppDataSource.getRepository(ProgressPhoto);
        return photoRepo.find({
            where: { user_id: userId },
            order: { taken_at: 'DESC', created_at: 'DESC' }
        });
    },

    async create(userId: string, data: { image_url: string; caption?: string; taken_at?: Date; weight_kg?: number }) {
        const photoRepo = AppDataSource.getRepository(ProgressPhoto);
        const photo = photoRepo.create({
            user_id: userId,
            ...data
        });
        return photoRepo.save(photo);
    },

    async delete(photoId: string, userId: string) {
        const photoRepo = AppDataSource.getRepository(ProgressPhoto);
        const photo = await photoRepo.findOne({ where: { id: photoId, user_id: userId } });
        if (!photo) return false;
        await photoRepo.remove(photo);
        return true;
    }
};
