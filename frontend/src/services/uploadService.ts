import api from './api';
import { logger } from '../lib/logger';

export const uploadService = {
    /**
     * Upload an image blob/file to the backend which will push it to Supabase
     * @param file The File or Blob object
     * @param folder The folder name to store in bucket (e.g. 'avatars', 'covers', 'programs')
     * @param originalName Optional original filename to preserve extension
     * @returns The public URL of the uploaded image
     */
    uploadImage: async (file: Blob | File, folder: string, originalName: string = 'image.png'): Promise<string> => {
        const formData = new FormData();

        // If it's a blob from canvas, we need to append it as a File with a name
        if (file instanceof Blob && !(file instanceof File)) {
            const newFile = new File([file], originalName, { type: file.type });
            formData.append('file', newFile);
        } else {
            formData.append('file', file);
        }

        formData.append('folder', folder);

        try {
            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data.url;
        } catch (error) {
            logger.error('Upload Error:', error);
            throw error;
        }
    }
};
