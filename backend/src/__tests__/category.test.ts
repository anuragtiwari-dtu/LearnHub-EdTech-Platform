import request from 'supertest';
import { connectTestDB, disconnectTestDB, clearTestDB } from './setup';
import app from '../server';
import { User } from '../models/User';
import { Category } from '../models/Category';

describe('Category API', () => {
    let adminCookie: string;

    beforeAll(async () => {
        await connectTestDB();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    beforeEach(async () => {
        await clearTestDB();

        // Register and promote to admin
        const registerRes = await request(app)
            .post('/api/v1/auth/register')
            .send({
                name: 'Admin User',
                email: 'admin@learnhub.com',
                password: 'admin123456',
                confirmPassword: 'admin123456',
            });

        adminCookie = registerRes.headers['set-cookie'];
        await User.findOneAndUpdate({ email: 'admin@learnhub.com' }, { role: 'admin' });
    });

    describe('POST /api/v1/categories', () => {
        it('should create a category as admin', async () => {
            const res = await request(app)
                .post('/api/v1/categories')
                .set('Cookie', adminCookie)
                .send({ name: 'Web Development', description: 'Web dev courses', icon: '🌐' })
                .expect(201);

            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Web Development');
            expect(res.body.data.slug).toBe('web-development');
        });

        it('should not create duplicate category', async () => {
            await request(app)
                .post('/api/v1/categories')
                .set('Cookie', adminCookie)
                .send({ name: 'Web Development', description: 'Web dev courses', icon: '🌐' });

            const res = await request(app)
                .post('/api/v1/categories')
                .set('Cookie', adminCookie)
                .send({ name: 'Web Development', description: 'Duplicate', icon: '📚' })
                .expect(409);

            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/categories', () => {
        beforeEach(async () => {
            await Category.create([
                { name: 'Web Development', icon: '🌐' },
                { name: 'Data Science', icon: '📊' },
            ]);
        });

        it('should return all categories', async () => {
            const res = await request(app)
                .get('/api/v1/categories')
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(2);
            expect(res.body.data[0].name).toBe('Data Science'); // Sorted alphabetically
        });
    });
});