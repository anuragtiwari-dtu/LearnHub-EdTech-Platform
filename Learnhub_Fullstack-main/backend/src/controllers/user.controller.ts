import { Request, Response } from 'express';
import { userRepository } from '../repositories/user.repository';
import { progressService } from '../services/progress.service';
import { asyncHandler, AppError, getPaginationMeta } from '../../../shared/utils';
import { uploadToCloudinary } from '../config/cloudinary';

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const { name, phone } = req.body;
    const updateData: any = { name, phone };

    if (req.file) {
        const result = await uploadToCloudinary(req.file, 'learnhub/avatars');
        updateData.avatar = result.url;
        updateData.avatarPublicId = result.publicId;
    }

    const user = await userRepository.updateById(req.user!.userId, updateData);
    if (!user) throw new AppError(404, 'User not found');
    res.json({ success: true, data: user });
});

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
    const user = await userRepository.addToWishlist(req.user!.userId, req.params.courseId);
    res.json({ success: true, data: user?.wishlist });
});

export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
    const user = await userRepository.removeFromWishlist(req.user!.userId, req.params.courseId);
    res.json({ success: true, data: user?.wishlist });
});

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
    const user = await userRepository.findById(req.user!.userId);
    if (!user) throw new AppError(404, 'User not found');
    await user.populate('wishlist', 'title slug thumbnail price discountPrice isFree level rating');
    res.json({ success: true, data: user.wishlist });
});

export const getEnrolledCourses = asyncHandler(async (req: Request, res: Response) => {
    const progress = await progressService.getUserProgress(req.user!.userId);
    res.json({ success: true, data: progress });
});

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const [user, stats, progress] = await Promise.all([
        userRepository.findById(req.user!.userId),
        progressService.getDashboardStats(req.user!.userId),
        progressService.getUserProgress(req.user!.userId),
    ]);
    res.json({ success: true, data: { user, stats, recentProgress: progress.slice(0, 5) } });
});

// Admin controllers
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;

    const filter: any = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (role) filter.role = role;

    const { users, total } = await userRepository.findAll(filter, page, limit);
    const meta = getPaginationMeta(total, page, limit);
    res.json({ success: true, data: users, meta });
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
    const { role } = req.body;
    if (!['student', 'admin'].includes(role)) {
        throw new AppError(400, 'Invalid role');
    }
    const user = await userRepository.updateById(req.params.id, { role });
    if (!user) throw new AppError(404, 'User not found');
    res.json({ success: true, data: user });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userRepository.deleteById(req.params.id);
    if (!user) throw new AppError(404, 'User not found');
    res.json({ success: true, message: 'User deleted' });
});