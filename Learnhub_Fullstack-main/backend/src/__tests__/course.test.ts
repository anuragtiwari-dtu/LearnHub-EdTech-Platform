import request from 'supertest';
import { connectTestDB, disconnectTestDB, clearTestDB } from './setup';
import app from '../server';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Course } from '../models/Course';

describe('Course API', () => {
    let adminCookie: string;
    let categoryId: string;
    let courseId: string;

    beforeAll(async () => {
        await connectTestDB();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    beforeEach(async () => {
        await clearTestDB();

        // Create admin
        const adminRes = await request(app)
            .post('/api/v1/auth/register')
            .send({
                name: 'Admin User',
                email: 'admin@learnhub.com',
                password: 'admin123456',
                confirmPassword: 'admin123456',
            });

        adminCookie = adminRes.headers['set-cookie'];

        // Set user as admin directly
        await User.findOneAndUpdate(
            { email: 'admin@learnhub.com' },
            { role: 'admin' }
        );

        // Create category
        const catRes = await request(app)
            .post('/api/v1/categories')
            .set('Cookie', adminCookie)
            .send({ name: 'Web Development', description: 'Web dev courses', icon: '🌐' });

        categoryId = catRes.body.data._id;
    });

    describe('POST /api/v1/courses (Admin)', () => {
        it('should create a course as admin', async () => {
            const res = await request(app)
                .post('/api/v1/courses')
                .set('Cookie', adminCookie)
                .field('title', 'React Masterclass')
                .field('description', 'Learn React from scratch to advanced')
                .field('shortDescription', 'Complete React course')
                .field('category', categoryId)
                .field('level', 'beginner')
                .field('price', '999')
                .field('status', 'published')
                .field('sections', JSON.stringify([
                    {
                        title: 'Getting Started', description: 'Intro', order: 1, lessons: [
                            { title: 'Welcome', description: 'Welcome lesson', videoUrl: 'https://example.com/video.mp4', videoPublicId: '', duration: 300, notes: '', order: 1, isFree: true }
                        ]
                    }
                ]))
                .field('tags', JSON.stringify(['react', 'javascript']))
                .field('requirements', JSON.stringify(['Basic HTML/CSS']))
                .field('learningOutcomes', JSON.stringify(['Build React apps']))
                .expect(201);

            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('React Masterclass');
            courseId = res.body.data._id;
        });

        it('should not create course as non-admin', async () => {
            const studentRes = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Student',
                    email: 'student@learnhub.com',
                    password: 'student123',
                    confirmPassword: 'student123',
                });
            const studentCookie = studentRes.headers['set-cookie'];

            await request(app)
                .post('/api/v1/courses')
                .set('Cookie', studentCookie)
                .field('title', 'Test Course')
                .field('description', 'Test description')
                .field('category', categoryId)
                .field('price', '0')
                .expect(403);
        });
    });

    describe('GET /api/v1/courses (Public)', () => {
        beforeEach(async () => {
            // Create published course
            await Course.create({
                title: 'Published Course',
                slug: 'published-course',
                description: 'A published course',
                shortDescription: 'Published',
                thumbnail: 'https://example.com/thumb.jpg',
                category: categoryId,
                instructor: (await User.findOne({ email: 'admin@learnhub.com' }))!._id,
                level: 'beginner',
                price: 0,
                isFree: true,
                status: 'published',
                sections: [],
                tags: ['test'],
                requirements: [],
                learningOutcomes: [],
                totalDuration: 0,
                totalLessons: 0,
                enrollmentCount: 42,
                rating: 4.5,
                reviewCount: 10,
            });

            // Create draft course (should not appear in public)
            await Course.create({
                title: 'Draft Course',
                slug: 'draft-course',
                description: 'A draft course',
                shortDescription: 'Draft',
                thumbnail: 'https://example.com/thumb.jpg',
                category: categoryId,
                instructor: (await User.findOne({ email: 'admin@learnhub.com' }))!._id,
                level: 'advanced',
                price: 1999,
                status: 'draft',
                sections: [],
                tags: [],
                requirements: [],
                learningOutcomes: [],
                totalDuration: 0,
                totalLessons: 0,
            });
        });

        it('should return only published courses', async () => {
            const res = await request(app)
                .get('/api/v1/courses')
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].status).toBe('published');
        });

        it('should filter by level', async () => {
            const res = await request(app)
                .get('/api/v1/courses?level=beginner')
                .expect(200);

            expect(res.body.data).toHaveLength(1);
        });

        it('should filter by isFree', async () => {
            const res = await request(app)
                .get('/api/v1/courses?isFree=true')
                .expect(200);

            expect(res.body.data).toHaveLength(1);
        });

        it('should return pagination meta', async () => {
            const res = await request(app)
                .get('/api/v1/courses?page=1&limit=12')
                .expect(200);

            expect(res.body.meta).toBeDefined();
            expect(res.body.meta.page).toBe(1);
        });
    });

    describe('GET /api/v1/courses/slug/:slug', () => {
        it('should get course by slug', async () => {
            const res = await request(app)
                .get('/api/v1/courses/slug/published-course')
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('Published Course');
        });

        it('should return 404 for non-existent slug', async () => {
            const res = await request(app)
                .get('/api/v1/courses/slug/non-existent')
                .expect(404);

            expect(res.body.success).toBe(false);
        });
    });
});