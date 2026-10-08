import { http, HttpResponse } from 'msw';

const API_BASE = '/api/v1';

export const handlers = [
    // Auth endpoints
    http.post(`${API_BASE}/auth/register`, async ({ request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({
            success: true,
            message: 'Registered successfully',
            data: {
                user: {
                    _id: 'mock-user-id',
                    name: body.name,
                    email: body.email,
                    role: 'student',
                    isEmailVerified: false,
                    authProvider: 'local',
                    wishlist: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            },
        }, { status: 201 });
    }),

    http.post(`${API_BASE}/auth/login`, async ({ request }) => {
        const body = await request.json() as any;
        if (body.email === 'test@learnhub.com' && body.password === 'password123') {
            return HttpResponse.json({
                success: true,
                message: 'Logged in successfully',
                data: {
                    user: {
                        _id: 'mock-user-id',
                        name: 'Test User',
                        email: 'test@learnhub.com',
                        role: 'student',
                        isEmailVerified: true,
                        authProvider: 'local',
                        wishlist: [],
                    },
                },
            });
        }
        return HttpResponse.json({
            success: false,
            message: 'Invalid email or password',
        }, { status: 401 });
    }),

    http.get(`${API_BASE}/auth/me`, () => {
        return HttpResponse.json({
            success: true,
            data: {
                user: {
                    _id: 'mock-user-id',
                    name: 'Test User',
                    email: 'test@learnhub.com',
                    role: 'student',
                    isEmailVerified: true,
                    authProvider: 'local',
                    wishlist: [],
                },
            },
        });
    }),

    // Stats endpoints
    http.get(`${API_BASE}/stats`, () => {
        return HttpResponse.json({
            success: true,
            data: { students: 1500, courses: 45, categories: 8, orders: 3200 },
        });
    }),

    // Course endpoints
    http.get(`${API_BASE}/courses/featured`, () => {
        return HttpResponse.json({
            success: true,
            data: [
                {
                    _id: 'course-1',
                    title: 'Complete React & Next.js Developer',
                    slug: 'complete-react-nextjs',
                    thumbnail: 'https://picsum.photos/seed/course-1/400/250',
                    shortDescription: 'Master React ecosystem',
                    level: 'intermediate',
                    price: 999,
                    discountPrice: 499,
                    isFree: false,
                    rating: 4.8,
                    reviewCount: 120,
                    enrollmentCount: 1500,
                    totalDuration: 3600,
                    totalLessons: 45,
                    category: { _id: 'cat-1', name: 'Web Development', slug: 'web-development' },
                    instructor: { _id: 'inst-1', name: 'John Doe', avatar: '' },
                },
                {
                    _id: 'course-2',
                    title: 'Python for Data Science',
                    slug: 'python-data-science',
                    thumbnail: 'https://picsum.photos/seed/course-2/400/250',
                    shortDescription: 'Learn Data Science with Python',
                    level: 'beginner',
                    price: 0,
                    isFree: true,
                    rating: 4.5,
                    reviewCount: 80,
                    enrollmentCount: 2300,
                    totalDuration: 2400,
                    totalLessons: 30,
                    category: { _id: 'cat-2', name: 'Data Science', slug: 'data-science' },
                    instructor: { _id: 'inst-2', name: 'Jane Smith', avatar: '' },
                },
            ],
        });
    }),

    http.get(`${API_BASE}/courses`, ({ request }) => {
        const url = new URL(request.url);
        const search = url.searchParams.get('search');
        return HttpResponse.json({
            success: true,
            data: [
                {
                    _id: 'course-1',
                    title: search ? `Search Result: ${search}` : 'Complete React & Next.js Developer',
                    slug: 'complete-react-nextjs',
                    thumbnail: 'https://picsum.photos/seed/course-1/400/250',
                    level: 'intermediate',
                    price: 999,
                    discountPrice: 499,
                    isFree: false,
                    rating: 4.8,
                    totalDuration: 3600,
                    totalLessons: 45,
                    category: { _id: 'cat-1', name: 'Web Development' },
                    instructor: { _id: 'inst-1', name: 'John Doe' },
                },
            ],
            meta: { page: 1, limit: 12, total: 1, totalPages: 1 },
        });
    }),

    http.get(`${API_BASE}/categories`, () => {
        return HttpResponse.json({
            success: true,
            data: [
                { _id: 'cat-1', name: 'Web Development', slug: 'web-development', courseCount: 15 },
                { _id: 'cat-2', name: 'Data Science', slug: 'data-science', courseCount: 10 },
            ],
        });
    }),
];