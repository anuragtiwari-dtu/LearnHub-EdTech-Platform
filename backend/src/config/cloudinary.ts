import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
});

export default cloudinary;

export const uploadToCloudinary = async (
    file: Express.Multer.File,
    folder: string = 'learnhub'
): Promise<{ url: string; publicId: string }> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
                chunk_size: 6000000,
                eager: file.mimetype.startsWith('video/')
                    ? [{ width: 720, height: 480, crop: 'limit', format: 'mp4' }]
                    : [{ width: 800, height: 600, crop: 'limit', format: 'webp' }],
            },
            (error, result) => {
                if (error) reject(error);
                else resolve({ url: result!.secure_url, publicId: result!.public_id });
            }
        );
        uploadStream.end(file.buffer);
    });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    await cloudinary.uploader.destroy(publicId);
};