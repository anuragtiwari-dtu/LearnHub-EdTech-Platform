import Stripe from 'stripe';
import Razorpay from 'razorpay';
import { orderRepository } from '../repositories/order.repository';
import { courseRepository } from '../repositories/course.repository';
import { env } from '../config/env';
import { AppError } from '../../../shared/utils';
import { MESSAGES } from '../../../shared/constants';
import { Progress } from '../models/Progress';
import crypto from 'crypto';

// Stripe initialization
const stripe = env.STRIPE_SECRET_KEY
    ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' as any })
    : null;

// Razorpay initialization
const razorpay = env.RAZORPAY_KEY_ID
    ? new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET,
    })
    : null;

export class PaymentService {
    async createOrder(
        userId: string,
        courseId: string,
        provider: 'stripe' | 'razorpay'
    ) {
        const course = await courseRepository.findById(courseId);
        if (!course) {
            throw new AppError(404, MESSAGES.COURSE.NOT_FOUND);
        }

        // Check if already purchased
        const existingOrder = await orderRepository.findByUserAndCourse(userId, courseId);
        if (existingOrder) {
            throw new AppError(409, MESSAGES.COURSE.ALREADY_ENROLLED);
        }

        const amount = course.discountPrice ?? course.price;
        const originalAmount = course.price;
        const discount = originalAmount - amount;

        if (amount === 0 || course.isFree) {
            // Free enrollment
            await Progress.create({ user: userId, course: courseId, progressPercentage: 0 });
            await courseRepository.incrementEnrollment(courseId);
            return { isFree: true, message: MESSAGES.COURSE.ENROLLED };
        }

        if (provider === 'stripe' && stripe) {
            return this.createStripeOrder(userId, courseId, amount, originalAmount, discount);
        } else if (provider === 'razorpay' && razorpay) {
            return this.createRazorpayOrder(userId, courseId, amount, originalAmount, discount);
        } else {
            throw new AppError(400, `Payment provider ${provider} is not configured`);
        }
    }

    private async createStripeOrder(
        userId: string,
        courseId: string,
        amount: number,
        originalAmount: number,
        discount: number
    ) {
        const paymentIntent = await stripe!.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects cents
            currency: 'inr',
            metadata: {
                userId,
                courseId,
            },
            automatic_payment_methods: { enabled: true },
        });

        const order = await orderRepository.create({
            user: userId as any,
            course: courseId as any,
            amount,
            originalAmount,
            discount,
            currency: 'inr',
            provider: 'stripe',
            providerOrderId: paymentIntent.id,
            status: 'pending',
        });

        return {
            orderId: order._id,
            clientSecret: paymentIntent.client_secret,
            provider: 'stripe',
        };
    }

    private async createRazorpayOrder(
        userId: string,
        courseId: string,
        amount: number,
        originalAmount: number,
        discount: number
    ) {
        const razorpayOrder = await razorpay!.orders.create({
            amount: Math.round(amount * 100), // Razorpay expects paise
            currency: 'INR',
            notes: {
                userId,
                courseId,
            },
        });

        const order = await orderRepository.create({
            user: userId as any,
            course: courseId as any,
            amount,
            originalAmount,
            discount,
            currency: 'inr',
            provider: 'razorpay',
            providerOrderId: razorpayOrder.id,
            status: 'pending',
        });

        return {
            orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            razorpayKey: env.RAZORPAY_KEY_ID,
            amount: Math.round(amount * 100),
            currency: 'INR',
            provider: 'razorpay',
        };
    }

    async verifyStripePayment(body: {
        paymentIntentId: string;
        orderId: string;
    }) {
        const order = await orderRepository.findById(body.orderId);
        if (!order) {
            throw new AppError(404, 'Order not found');
        }

        const paymentIntent = await stripe!.paymentIntents.retrieve(
            body.paymentIntentId
        );

        if (paymentIntent.status !== 'succeeded') {
            await orderRepository.updateById(body.orderId, { status: 'failed' });
            throw new AppError(400, MESSAGES.PAYMENT.PAYMENT_FAILED);
        }

        await orderRepository.updateById(body.orderId, {
            status: 'completed',
            providerPaymentId: (paymentIntent as any).latest_invoice as string || body.paymentIntentId,
        });

        // Create progress & increment enrollment
        await Progress.create({
            user: order.user,
            course: order.course,
            progressPercentage: 0,
        });
        await courseRepository.incrementEnrollment(
            typeof order.course === 'string' ? order.course : (order.course as any)._id.toString()
        );

        return { message: MESSAGES.PAYMENT.PAYMENT_SUCCESS };
    }

    async verifyRazorpayPayment(body: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
        orderId: string;
    }) {
        const order = await orderRepository.findById(body.orderId);
        if (!order) {
            throw new AppError(404, 'Order not found');
        }

        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', env.RAZORPAY_KEY_SECRET!)
            .update(`${body.razorpayOrderId}|${body.razorpayPaymentId}`)
            .digest('hex');

        if (expectedSignature !== body.razorpaySignature) {
            await orderRepository.updateById(body.orderId, { status: 'failed' });
            throw new AppError(400, 'Invalid payment signature');
        }

        await orderRepository.updateById(body.orderId, {
            status: 'completed',
            providerPaymentId: body.razorpayPaymentId,
        });

        await Progress.create({
            user: order.user,
            course: order.course,
            progressPercentage: 0,
        });
        await courseRepository.incrementEnrollment(
            typeof order.course === 'string' ? order.course : (order.course as any)._id.toString()
        );

        return { message: MESSAGES.PAYMENT.PAYMENT_SUCCESS };
    }

    async handleStripeWebhook(event: Stripe.Event) {
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const order = await orderRepository.findByProviderOrderId(paymentIntent.id);
                if (order && order.status === 'pending') {
                    await orderRepository.updateById(order._id.toString(), {
                        status: 'completed',
                        providerPaymentId: paymentIntent.id,
                    });
                    await Progress.create({
                        user: order.user,
                        course: order.course,
                        progressPercentage: 0,
                    });
                    await courseRepository.incrementEnrollment(
                        typeof order.course === 'string' ? order.course : (order.course as any)._id.toString()
                    );
                }
                break;
            }
            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const order = await orderRepository.findByProviderOrderId(paymentIntent.id);
                if (order) {
                    await orderRepository.updateById(order._id.toString(), { status: 'failed' });
                }
                break;
            }
        }
        return { received: true };
    }

    async getUserOrders(userId: string, page: number, limit: number) {
        const { orders, total } = await orderRepository.findByUser(userId, page, limit);
        const meta = { page, limit, total, totalPages: Math.ceil(total / limit) };
        return { orders, meta };
    }

    async getRevenueStats() {
        return orderRepository.getRevenueStats();
    }

    async getAllOrders(page: number, limit: number, status?: string) {
        const filter: any = {};
        if (status) filter.status = status;
        const { orders, total } = await orderRepository.findAll(filter, page, limit);
        const meta = { page, limit, total, totalPages: Math.ceil(total / limit) };
        return { orders, meta };
    }
}

export const paymentService = new PaymentService();