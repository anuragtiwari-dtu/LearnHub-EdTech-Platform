import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import {
    createCourse, updateCourse, deleteCourse, getPublishedCourses,
    getCourseBySlug, getCourseById, getFeaturedCourses, getCourseContent,
    getAdminCourses, uploadLessonVideo,
} from '../controllers/course.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validateQuery } from '../middlewares/validate';
import { courseFilterSchema } from '../../../shared/types';

const upload = multer({ storage: multer.memoryStorage() });

// Middleware: only run multer if the request is multipart/form-data
const optionalUpload = (fields: multer.Field[]) => {
    const multerMiddleware = upload.fields(fields);
    return (req: Request, res: Response, next: NextFunction) => {
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('multipart/form-data')) {
            multerMiddleware(req, res, next);
        } else {
            next();
        }
    };
};

const courseUploadFields: multer.Field[] = [
    { name: 'thumbnail', maxCount: 1 },
    { name: 'previewVideo', maxCount: 1 },
];

const router = Router();

// Public routes
router.get('/', validateQuery(courseFilterSchema), getPublishedCourses);
router.get('/featured', getFeaturedCourses);
router.get('/slug/:slug', getCourseBySlug);

// Admin routes (MUST be before /:id to avoid wildcard catching 'admin')
router.get('/admin/all', authenticate, authorize('admin'), getAdminCourses);
router.post(
    '/',
    authenticate,
    authorize('admin'),
    optionalUpload(courseUploadFields),
    createCourse
);
router.post(
    '/upload/video',
    authenticate,
    authorize('admin'),
    upload.single('video'),
    uploadLessonVideo
);

// Parameterized routes (after all specific routes)
router.get('/:id', getCourseById);
router.get('/:id/content', authenticate, getCourseContent);
router.put(
    '/:id',
    authenticate,
    authorize('admin'),
    optionalUpload(courseUploadFields),
    updateCourse
);
router.delete('/:id', authenticate, authorize('admin'), deleteCourse);

export default router;