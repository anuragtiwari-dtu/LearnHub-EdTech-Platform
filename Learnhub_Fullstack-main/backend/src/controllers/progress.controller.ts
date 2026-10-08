import { Request, Response } from 'express';
import { progressService } from '../services/progress.service';
import { asyncHandler } from '../../../shared/utils';

export const getProgress = asyncHandler(async (req: Request, res: Response) => {
    const progress = await progressService.getProgress(req.user!.userId, req.params.courseId);
    res.json({ success: true, data: progress });
});

export const markLessonComplete = asyncHandler(async (req: Request, res: Response) => {
    const progress = await progressService.markLessonComplete(
        req.user!.userId,
        req.params.courseId,
        req.params.lessonId
    );
    res.json({ success: true, data: progress });
});

export const updateNotes = asyncHandler(async (req: Request, res: Response) => {
    const progress = await progressService.updateNotes(
        req.user!.userId,
        req.params.courseId,
        req.params.lessonId,
        req.body.content
    );
    res.json({ success: true, data: progress });
});

export const getUserProgress = asyncHandler(async (req: Request, res: Response) => {
    const progress = await progressService.getUserProgress(req.user!.userId);
    res.json({ success: true, data: progress });
});

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await progressService.getDashboardStats(req.user!.userId);
    res.json({ success: true, data: stats });
});