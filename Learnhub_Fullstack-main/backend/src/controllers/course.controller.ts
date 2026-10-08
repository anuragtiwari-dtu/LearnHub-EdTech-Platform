import { Request, Response } from 'express';
import { courseService } from '../services/course.service';
import { asyncHandler, AppError } from '../../../shared/utils';
import { courseFilterSchema } from '../../../shared/types';
import { uploadToCloudinary } from '../config/cloudinary';

export const createCourse = asyncHandler(async (req: any, res: any) => {
    const course = await courseService.createCourse(req.body, req.user.userId);
    res.status(201).json({ success: true, data: course });
});

export const updateCourse = asyncHandler(async (req: any, res: any) => {
    const course = await courseService.updateCourse(req.params.id, req.body);
    res.json({ success: true, data: course });
});

export const deleteCourse = asyncHandler(async (req: any, res: any) => {
    const result = await courseService.deleteCourse(req.params.id);
    res.json({ success: true, ...result });
});

export const getPublishedCourses = asyncHandler(async (req: any, res: any) => {
    const { courses, meta } = await courseService.getPublishedCourses(req.query);
    res.json({ success: true, data: courses, meta });
});

export const getCourseBySlug = asyncHandler(async (req: any, res: any) => {
    const course = await courseService.getCourseBySlug(req.params.slug);
    res.json({ success: true, data: course });
});

export const getCourseById = asyncHandler(async (req: any, res: any) => {
    const course = await courseService.getCourseById(req.params.id);
    res.json({ success: true, data: course });
});

export const getFeaturedCourses = asyncHandler(async (req: any, res: any) => {
    const courses = await courseService.getFeaturedCourses();
    res.json({ success: true, data: courses });
});

export const getCourseContent = asyncHandler(async (req: any, res: any) => {
    const course = await courseService.getCourseContent(req.params.id, req.user.userId);
    res.json({ success: true, data: course });
});

export const getAdminCourses = asyncHandler(async (req: any, res: any) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { courses, meta } = await courseService.getAdminCourses(page, limit, req.query.status);
    res.json({ success: true, data: courses, meta });
});

export const uploadLessonVideo = asyncHandler(async (req: any, res: any) => {
    res.json({ success: true, data: { url: 'mock_url', publicId: 'mock' } });
});
