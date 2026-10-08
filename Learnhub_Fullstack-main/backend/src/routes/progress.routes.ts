import { Router } from 'express';
import {
    getProgress, markLessonComplete, updateNotes, getUserProgress, getDashboardStats,
} from '../controllers/progress.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/dashboard-stats', authenticate, getDashboardStats);
router.get('/my-progress', authenticate, getUserProgress);
router.get('/:courseId', authenticate, getProgress);
router.post('/:courseId/lesson/:lessonId/complete', authenticate, markLessonComplete);
router.put('/:courseId/lesson/:lessonId/notes', authenticate, updateNotes);

export default router;