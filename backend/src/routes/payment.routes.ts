import { Router } from 'express';
import {
    createOrder, verifyPayment, stripeWebhook, getUserOrders, getRevenueStats, getAllOrders,
} from '../controllers/payment.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.post('/create-order', authenticate, createOrder);
router.post('/verify', authenticate, verifyPayment);
router.post('/stripe/webhook', stripeWebhook); // No auth - webhook from Stripe
router.get('/orders', authenticate, getUserOrders);
router.get('/revenue-stats', authenticate, authorize('admin'), getRevenueStats);
router.get('/admin/orders', authenticate, authorize('admin'), getAllOrders);

export default router;