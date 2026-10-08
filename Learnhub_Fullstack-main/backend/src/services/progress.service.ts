import { Progress } from '../models/Progress';
import { Course } from '../models/Course';
import { AppError } from '../../../shared/utils';

export class ProgressService {
    async getProgress(userId: string, courseId: string) {
        const progress = await Progress.findOne({ user: userId, course: courseId });
        if (!progress) {
            throw new AppError(404, 'Progress not found. You may not be enrolled in this course.');
        }
        return progress;
    }

    async markLessonComplete(userId: string, courseId: string, lessonId: string) {
        const progress = await Progress.findOne({ user: userId, course: courseId });
        if (!progress) {
            throw new AppError(404, 'Not enrolled in this course');
        }

        if (!progress.completedLessons.includes(lessonId as any)) {
            progress.completedLessons.push(lessonId as any);
        }
        progress.lastAccessedLesson = lessonId as any;

        // Recalculate percentage
        const course = await Course.findById(courseId);
        if (course) {
            const totalLessons = course.totalLessons || 1;
            progress.progressPercentage = Math.round(
                (progress.completedLessons.length / totalLessons) * 100
            );
            if (progress.progressPercentage === 100) {
                progress.completedAt = new Date();
            }
        }

        await progress.save();
        return progress;
    }

    async updateNotes(userId: string, courseId: string, lessonId: string, content: string) {
        const progress = await Progress.findOne({ user: userId, course: courseId });
        if (!progress) {
            throw new AppError(404, 'Not enrolled in this course');
        }

        const existingNote = progress.notes.find(
            (n) => n.lessonId.toString() === lessonId
        );
        if (existingNote) {
            existingNote.content = content;
        } else {
            progress.notes.push({ lessonId: lessonId as any, content });
        }

        await progress.save();
        return progress;
    }

    async getUserProgress(userId: string) {
        const progressList = await Progress.find({ user: userId })
            .populate({
                path: 'course',
                select: 'title slug thumbnail level totalLessons totalDuration category',
                populate: { path: 'category', select: 'name slug' },
            })
            .sort({ updatedAt: -1 });
        return progressList;
    }

    async getDashboardStats(userId: string) {
        const progressList = await Progress.find({ user: userId });
        const enrolledCount = progressList.length;
        const completedCount = progressList.filter((p) => p.progressPercentage === 100).length;
        const inProgressCount = enrolledCount - completedCount;
        const totalHoursSpent = progressList.reduce((sum, p) => {
            return sum + Math.round(p.progressPercentage / 100 * 10); // rough estimate
        }, 0);

        return { enrolledCount, completedCount, inProgressCount, totalHoursSpent };
    }
}

export const progressService = new ProgressService();