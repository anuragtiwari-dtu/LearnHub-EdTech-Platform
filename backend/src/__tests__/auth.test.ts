import request from 'supertest';
import { connectTestDB, disconnectTestDB, clearTestDB } from './setup';
import app from '../server';
import { User } from '../models/User';

describe('Auth API', () => {
    beforeAll(async () => {
        await connectTestDB();
    });

    afterEach(async () => {
        await clearTestDB();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    const validRegister = {
        name: 'Test User',
        email: 'test@learnhub.com',
        password: 'password123',
        confirmPassword: 'password123',
    };

    const validLogin = {
        email: 'test@learnhub.com',
        password: 'password123',
    };

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send(validRegister)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(res.body.success).toBe(true);
            expect(res.body.data.user).toBeDefined();
            expect(res.body.data.user.email).toBe(validRegister.email);
            expect(res.body.data.user.password).toBeUndefined();
            expect(res.headers['set-cookie']).toBeDefined();
        });

        it('should not register with duplicate email', async () => {
            await request(app).post('/api/v1/auth/register').send(validRegister);
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send(validRegister)
                .expect(409);

            expect(res.body.success).toBe(false);
        });

        it('should not register with invalid email', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({ ...validRegister, email: 'invalid-email' })
                .expect(422);

            expect(res.body.success).toBe(false);
        });

        it('should not register with short password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({ ...validRegister, password: '123', confirmPassword: '123' })
                .expect(422);

            expect(res.body.success).toBe(false);
        });

        it('should not register with mismatched passwords', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({ ...validRegister, confirmPassword: 'different123' })
                .expect(422);

            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            await request(app).post('/api/v1/auth/register').send(validRegister);
        });

        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send(validLogin)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.user).toBeDefined();
            expect(res.body.data.user.email).toBe(validLogin.email);
            expect(res.headers['set-cookie']).toBeDefined();
        });

        it('should not login with wrong password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({ ...validLogin, password: 'wrongpassword' })
                .expect(401);

            expect(res.body.success).toBe(false);
        });

        it('should not login with non-existent email', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: 'nobody@learnhub.com', password: 'password123' })
                .expect(401);

            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/auth/logout', () => {
        it('should logout successfully', async () => {
            const registerRes = await request(app)
                .post('/api/v1/auth/register')
                .send(validRegister);

            const cookies = registerRes.headers['set-cookie'];

            const res = await request(app)
                .post('/api/v1/auth/logout')
                .set('Cookie', cookies)
                .expect(200);

            expect(res.body.success).toBe(true);
        });
    });

    describe('GET /api/v1/auth/me', () => {
        it('should get current user when authenticated', async () => {
            const registerRes = await request(app)
                .post('/api/v1/auth/register')
                .send(validRegister);

            const cookies = registerRes.headers['set-cookie'];

            const res = await request(app)
                .get('/api/v1/auth/me')
                .set('Cookie', cookies)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.user.email).toBe(validRegister.email);
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app)
                .get('/api/v1/auth/me')
                .expect(401);

            expect(res.body.success).toBe(false);
        });
    });
});