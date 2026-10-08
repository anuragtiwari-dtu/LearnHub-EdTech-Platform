import { Router } from 'express';
import multer from 'multer';
import {
    updateProfile, addToWishlist, removeFromWishlist, getWishlist,
    getEnrolledCourses, getDashboard, getAllUsers, updateUserRole, deleteUser,
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// Student routes
router.get('/dashboard', authenticate, getDashboard);
router.put('/profile', authenticate, upload.single('avatar'), updateProfile);
router.get('/wishlist', authenticate, getWishlist);
router.post('/wishlist/:courseId', authenticate, addToWishlist);
router.delete('/wishlist/:courseId', authenticate, removeFromWishlist);
router.get('/enrolled', authenticate, getEnrolledCourses);

// Admin routes
router.get('/admin/all', authenticate, authorize('admin'), getAllUsers);
router.put('/admin/:id/role', authenticate, authorize('admin'), updateUserRole);
router.delete('/admin/:id', authenticate, authorize('admin'), deleteUser);

export default router;