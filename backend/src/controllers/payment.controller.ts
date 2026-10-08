import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { asyncHandler, AppError } from '../../../shared/utils';
import { env } from '../config/env';

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
    const { courseId, provider } = req.body;
    if (!courseId) throw new AppError(400, 'Course ID is required');
    if (!provider || !['stripe', 'razorpay'].includes(provider)) {
        throw new AppError(400, 'Valid payment provider is required');
    }
    const result = await paymentService.createOrder(req.user!.userId, courseId, provider);
    res.json({ success: true, data: result });
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
    const { provider } = req.body;
    let result;
    if (provider === 'stripe') {
        result = await paymentService.verifyStripePayment(req.body);
    } else if (provider === 'razorpay') {
        result = await paymentService.verifyRazorpayPayment(req.body);
    } else {
        throw new AppError(400, 'Invalid payment provider');
    }
    res.json({ success: true, message: result.message });
});

export const stripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    let event;
    try {
        // Verify webhook signature
        const stripe = require('stripe')(env.STRIPE_SECRET_KEY);
        event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
        res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
        return;
    }
    await paymentService.handleStripeWebhook(event);
    res.json({ received: true });
};

export const getUserOrders = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await paymentService.getUserOrders(req.user!.userId, page, limit);
    res.json({ success: true, data: result.orders, meta: result.meta });
});

export const getRevenueStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await paymentService.getRevenueStats();
    res.json({ success: true, data: stats });
});

export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;
    const result = await paymentService.getAllOrders(page, limit, status);
    res.json({ success: true, data: result.orders, meta: result.meta });
});