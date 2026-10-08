import request from 'supertest';
import { connectTestDB, disconnectTestDB, clearTestDB } from './setup';
import app from '../server';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Course } from '../models/Course';
import { Order } from '../models/Order';

describe('Payment API', () => {
    let studentCookie: string;
    let studentId: string;
    let courseId: string;

    beforeAll(async () => {
        await connectTestDB();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    beforeEach(async () => {
        await clearTestDB();

        const studentRes = await request(app)
            .post('/api/v1/auth/register')
            .send({
                name: 'Student User',
                email: 'student@learnhub.com',
                password: 'student123456',
                confirmPassword: 'student123456',
            });

        studentCookie = studentRes.headers['set-cookie'];
        const user = await User.findOne({ email: 'student@learnhub.com' });
        studentId = user!._id.toString();

        const category = await Category.create({
            name: 'Data Science',
            description: 'Data Science courses',
        });

        const course = await Course.create({
            title: 'Python for Data Science',
            slug: 'python-data-science',
            description: 'Complete Python course',
            shortDescription: 'Python DS',
            thumbnail: 'https://example.com/thumb.jpg',
            category: category._id,
            instructor: studentId,
            level: 'beginner',
            price: 999,
            discountPrice: 499,
            isFree: false,
            status: 'published',
            sections: [],
            tags: ['python'],
            requirements: [],
            learningOutcomes: [],
            totalDuration: 3600,
            totalLessons: 30,
        });

        courseId = course._id.toString();
    });

    describe('POST /api/v1/payments/create-order', () => {
        it('should reject without authentication', async () => {
            await request(app)
                .post('/api/v1/payments/create-order')
                .send({ courseId, provider: 'razorpay' })
                .expect(401);
        });

        it('should reject invalid provider', async () => {
            const res = await request(app)
                .post('/api/v1/payments/create-order')
                .set('Cookie', studentCookie)
                .send({ courseId, provider: 'invalid' })
                .expect(400);

            expect(res.body.success).toBe(false);
        });

        it('should reject non-existent course', async () => {
            const res = await request(app)
                .post('/api/v1/payments/create-order')
                .set('Cookie', studentCookie)
                .send({ courseId: '507f1f77bcf86cd799439011', provider: 'razorpay' })
                .expect(404);

            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/payments/orders', () => {
        it('should return user orders', async () => {
            // Create a completed order
            await Order.create({
                user: studentId,
                course: courseId,
                amount: 499,
                originalAmount: 999,
                discount: 500,
                currency: 'inr',
                provider: 'razorpay',
                providerOrderId: 'order_test123',
                providerPaymentId: 'pay_test123',
                status: 'completed',
            });

            const res = await request(app)
                .get('/api/v1/payments/orders')
                .set('Cookie', studentCookie)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].status).toBe('completed');
        });
    });
});