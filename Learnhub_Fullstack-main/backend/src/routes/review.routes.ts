import { Router } from 'express';
import {
    createReview, updateReview, deleteReview, getCourseReviews,
} from '../controllers/review.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { reviewSchema } from '../../../shared/types';

const router = Router();

router.get('/course/:courseId', getCourseReviews);
router.post('/course/:courseId', authenticate, validate(reviewSchema), createReview);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

export default router;