import { Review } from '../models/Review';
import { AppError } from '../../../shared/utils';
import { ReviewInput } from '../../../shared/types';
import { getPaginationMeta } from '../../../shared/utils';

export class ReviewService {
    async createReview(userId: string, courseId: string, data: ReviewInput) {
        const existing = await Review.findOne({ user: userId, course: courseId });
        if (existing) {
            throw new AppError(409, 'You have already reviewed this course');
        }

        // Verify purchase
        const { Order } = await import('../models/Order');
        const order = await Order.findOne({ user: userId, course: courseId, status: 'completed' });
        if (!order) {
            throw new AppError(403, 'You must purchase this course to review it');
        }

        const review = await Review.create({
            user: userId,
            course: courseId,
            ...data,
        });

        return review.populate('user', 'name avatar');
    }

    async updateReview(reviewId: string, userId: string, data: Partial<ReviewInput>) {
        const review = await Review.findOne({ _id: reviewId, user: userId });
        if (!review) {
            throw new AppError(404, 'Review not found');
        }
        Object.assign(review, data);
        await review.save();
        return review.populate('user', 'name avatar');
    }

    async deleteReview(reviewId: string, userId: string) {
        const review = await Review.findOneAndDelete({ _id: reviewId, user: userId });
        if (!review) {
            throw new AppError(404, 'Review not found');
        }
        return { message: 'Review deleted' };
    }

    async getCourseReviews(courseId: string, page: number, limit: number) {
        const [reviews, total] = await Promise.all([
            Review.find({ course: courseId })
                .populate('user', 'name avatar')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Review.countDocuments({ course: courseId }),
        ]);
        const meta = getPaginationMeta(total, page, limit);
        return { reviews, meta };
    }
}

export const reviewService = new ReviewService();