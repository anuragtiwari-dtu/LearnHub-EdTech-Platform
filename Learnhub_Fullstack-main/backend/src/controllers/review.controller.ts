import { Request, Response } from 'express';
import { reviewService } from '../services/review.service';
import { asyncHandler } from '../../../shared/utils';

export const createReview = asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.createReview(
        req.user!.userId,
        req.params.courseId,
        req.body
    );
    res.status(201).json({ success: true, data: review });
});

export const updateReview = asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.updateReview(
        req.params.id,
        req.user!.userId,
        req.body
    );
    res.json({ success: true, data: review });
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
    await reviewService.deleteReview(req.params.id, req.user!.userId);
    res.json({ success: true, message: 'Review deleted' });
});

export const getCourseReviews = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await reviewService.getCourseReviews(req.params.courseId, page, limit);
    res.json({ success: true, data: result.reviews, meta: result.meta });
});
