import { Router } from 'express';
import {
    createCategory, updateCategory, deleteCategory, getAllCategories, getCategoryBySlug, getAdminCategories,
} from '../controllers/category.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/', getAllCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/admin/all', authenticate, authorize('admin'), getAdminCategories);
router.post('/', authenticate, authorize('admin'), createCategory);
router.put('/:id', authenticate, authorize('admin'), updateCategory);
router.delete('/:id', authenticate, authorize('admin'), deleteCategory);

export default router;