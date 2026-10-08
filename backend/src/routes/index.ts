import { Router } from 'express';
import authRoutes from './auth.routes';
import courseRoutes from './course.routes';
import paymentRoutes from './payment.routes';
import reviewRoutes from './review.routes';
import progressRoutes from './progress.routes';
import categoryRoutes from './category.routes';
import userRoutes from './user.routes';
import { submitContact } from '../controllers/contact.controller';
import { contactSchema } from '../../../shared/types';
import { validate } from '../middlewares/validate';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Category } from '../models/Category';
import { Order } from '../models/Order';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
    res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// Contact
import { getContacts, updateContactStatus } from '../controllers/contact.controller';
import { authenticate, authorize } from '../middlewares/auth';

router.post('/contact', validate(contactSchema), submitContact);
router.get('/contact/admin', authenticate, authorize('admin'), getContacts);
router.put('/contact/admin/:id/status', authenticate, authorize('admin'), updateContactStatus);

// Public stats
router.get('/stats', async (_req, res) => {
    const [students, courses, categories, orders] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        Course.countDocuments({ status: 'published' }),
        Category.countDocuments({ isActive: true }),
        Order.countDocuments({ status: 'completed' }),
    ]);
    res.json({ success: true, data: { students, courses, categories, orders } });
});

// Route groups
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/progress', progressRoutes);
router.use('/categories', categoryRoutes);
router.use('/users', userRoutes);

export default router;