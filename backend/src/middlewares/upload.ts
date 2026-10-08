import multer from 'multer';
import { AppError } from '../../../shared/utils';

const storage = multer.memoryStorage();

const fileFilter = (
    _req: any,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'video/mp4',
        'video/webm',
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError(400, 'Invalid file type. Only images and videos are allowed.'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB
        files: 10,
    },
});

export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 10);
export const uploadThumbnail = upload.single('thumbnail');
export const uploadVideo = upload.single('video');