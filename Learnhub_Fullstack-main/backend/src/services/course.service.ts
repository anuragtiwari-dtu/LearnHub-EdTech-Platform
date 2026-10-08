import { courseRepository } from '../repositories/course.repository';
import { Course, CourseDocument } from '../models/Course';
import { Category } from '../models/Category';
import { AppError } from '../../../shared/utils';
import { MESSAGES } from '../../../shared/constants';
import { CourseFilterInput } from '../../../shared/types';
import { getPaginationMeta } from '../../../shared/utils';
import { deleteFromCloudinary } from '../config/cloudinary';

export class CourseService {
    async createCourse(data: Partial<CourseDocument>, instructorId: string) {
        const course = await courseRepository.create({
            ...data,
            instructor: instructorId as any,
        });
        await this.updateCategoryCount(course.category.toString());
        return course;
    }

    async updateCourse(courseId: string, data: Partial<CourseDocument>) {
        const existingCourse = await courseRepository.findById(courseId);
        if (!existingCourse) {
            throw new AppError(404, MESSAGES.COURSE.NOT_FOUND);
        }

        // Clean up old cloudinary assets if replaced
        if (data.thumbnail && existingCourse.thumbnailPublicId) {
            await deleteFromCloudinary(existingCourse.thumbnailPublicId).catch(() => { });
        }
        if (data.previewVideoUrl && existingCourse.previewVideoPublicId) {
            await deleteFromCloudinary(existingCourse.previewVideoPublicId).catch(() => { });
        }

        const course = await courseRepository.updateById(courseId, data);
        
        const oldCategoryId = (existingCourse.category as any)?._id?.toString() || existingCourse.category?.toString();
        const newCategoryId = data.category?.toString();

        if (newCategoryId && oldCategoryId && newCategoryId !== oldCategoryId) {
            await this.updateCategoryCount(oldCategoryId);
            await this.updateCategoryCount(newCategoryId);
        }
        
        return course;
    }

    async deleteCourse(courseId: string) {
        const course = await courseRepository.findById(courseId);
        if (!course) {
            throw new AppError(404, MESSAGES.COURSE.NOT_FOUND);
        }

        // Clean up cloudinary assets
        if (course.thumbnailPublicId) {
            await deleteFromCloudinary(course.thumbnailPublicId).catch(() => { });
        }
        if (course.previewVideoPublicId) {
            await deleteFromCloudinary(course.previewVideoPublicId).catch(() => { });
        }
        for (const section of course.sections) {
            for (const lesson of section.lessons) {
                if (lesson.videoPublicId) {
                    await deleteFromCloudinary(lesson.videoPublicId).catch(() => { });
                }
            }
        }

        await courseRepository.deleteById(courseId);
        await this.updateCategoryCount(course.category.toString());
        return { message: MESSAGES.COURSE.DELETED };
    }

    async getPublishedCourses(filter: CourseFilterInput) {
        const { courses, total } = await courseRepository.findAll(filter);
        const meta = getPaginationMeta(total, filter.page, filter.limit);
        return { courses, meta };
    }

    async getCourseBySlug(slug: string) {
        const course = await courseRepository.findBySlug(slug);
        if (!course || course.status !== 'published') {
            throw new AppError(404, MESSAGES.COURSE.NOT_FOUND);
        }
        return course;
    }

    async getCourseById(id: string) {
        const course = await courseRepository.findById(id);
        if (!course) {
            throw new AppError(404, MESSAGES.COURSE.NOT_FOUND);
        }
        return course;
    }

    async getFeaturedCourses() {
        return courseRepository.findPublished();
    }

    async getCourseContent(courseId: string, userId: string) {
        const { Order } = await import('../models/Order');
        const order = await Order.findOne({
            user: userId,
            course: courseId,
            status: 'completed',
        });

        const course = await courseRepository.findById(courseId);
        if (!course) {
            throw new AppError(404, MESSAGES.COURSE.NOT_FOUND);
        }

        // If not purchased, only return free lessons
        if (!order && !course.isFree) {
            const filteredCourse = {
                ...course.toJSON(),
                sections: course.sections.map((section) => ({
                    ...(section as any).toObject(),
                    lessons: section.lessons.map((lesson) => ({
                        ...(lesson as any).toObject(),
                        videoUrl: lesson.isFree ? lesson.videoUrl : '',
                        notes: lesson.isFree ? lesson.notes : '',
                    })),
                })),
            };
            return filteredCourse;
        }

        return course;
    }

    private async updateCategoryCount(categoryId: string) {
        const count = await courseRepository.countByCategory(categoryId);
        await Category.findByIdAndUpdate(categoryId, { courseCount: count });
    }

    async getAdminCourses(page: number, limit: number, status?: string) {
        const filter: any = {};
        if (status) filter.status = status;
        const { courses, total } = await courseRepository.findAllForAdmin(filter, page, limit);
        const meta = getPaginationMeta(total, page, limit);
        return { courses, meta };
    }
}

export const courseService = new CourseService();