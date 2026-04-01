import express from 'express';
import multer from 'multer';
import { uploadFile } from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Configure multer to use memory storage (file buffer)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (_req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP.'));
        }
    }
});

router.post('/', authenticate, upload.single('file'), uploadFile);

export default router;
