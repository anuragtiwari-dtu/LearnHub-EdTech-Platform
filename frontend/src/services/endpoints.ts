import { apiCall } from './api';

// Auth
export const authAPI = {
    register: (data: any) => apiCall('post', '/auth/register', data),
    login: (data: any) => apiCall('post', '/auth/login', data),
    logout: () => apiCall('post', '/auth/logout'),
    getMe: () => apiCall('get', '/auth/me'),
    sendOTP: (phone: string) => apiCall('post', '/auth/send-otp', { phone }),
    verifyOTP: (phone: string, otp: string) => apiCall('post', '/auth/verify-otp', { phone, otp }),
    googleOAuth: (code: string) => apiCall('post', '/auth/google', { code }),
    githubOAuth: (code: string) => apiCall('post', '/auth/github', { code }),
    changePassword: (data: any) => apiCall('post', '/auth/change-password', data),
};

// Courses
export const courseAPI = {
    getAll: (params?: any) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== '')
        ) as Record<string, string>;
        return apiCall('get', `/courses?${new URLSearchParams(cleanParams)}`);
    },
    getFeatured: () => apiCall('get', '/courses/featured'),
    getBySlug: (slug: string) => apiCall('get', `/courses/slug/${slug}`),
    getById: (id: string) => apiCall('get', `/courses/${id}`),
    getContent: (id: string) => apiCall('get', `/courses/${id}/content`),
    create: (data: any) => apiCall('post', '/courses', data),
    update: (id: string, data: any) => apiCall('put', `/courses/${id}`, data),
    delete: (id: string) => apiCall('delete', `/courses/${id}`),
    uploadVideo: (formData: FormData) => {
        return apiCall('post', '/courses/upload/video', formData);
    },
    getAdminCourses: (params?: any) => apiCall('get', `/courses/admin/all?${new URLSearchParams(params)}`),
};

// Payments
export const paymentAPI = {
    createOrder: (courseId: string, provider: 'stripe' | 'razorpay') =>
        apiCall('post', '/payments/create-order', { courseId, provider }),
    verifyPayment: (data: any) => apiCall('post', '/payments/verify', data),
    getOrders: (params?: any) => apiCall('get', `/payments/orders?${new URLSearchParams(params)}`),
    getRevenueStats: () => apiCall('get', '/payments/revenue-stats'),
    getAllOrders: (params?: any) => apiCall('get', `/payments/admin/orders?${new URLSearchParams(params)}`),
};

// Reviews
export const reviewAPI = {
    getByCourse: (courseId: string, params?: any) =>
        apiCall('get', `/reviews/course/${courseId}?${new URLSearchParams(params)}`),
    create: (courseId: string, data: any) => apiCall('post', `/reviews/course/${courseId}`, data),
    update: (id: string, data: any) => apiCall('put', `/reviews/${id}`, data),
    delete: (id: string) => apiCall('delete', `/reviews/${id}`),
};

// Progress
export const progressAPI = {
    getDashboardStats: () => apiCall('get', '/progress/dashboard-stats'),
    getMyProgress: () => apiCall('get', '/progress/my-progress'),
    getProgress: (courseId: string) => apiCall('get', `/progress/${courseId}`),
    markComplete: (courseId: string, lessonId: string) =>
        apiCall('post', `/progress/${courseId}/lesson/${lessonId}/complete`),
    updateNotes: (courseId: string, lessonId: string, content: string) =>
        apiCall('put', `/progress/${courseId}/lesson/${lessonId}/notes`, { content }),
};

// Categories
export const categoryAPI = {
    getAll: () => apiCall('get', '/categories'),
    getBySlug: (slug: string) => apiCall('get', `/categories/slug/${slug}`),
    create: (data: any) => apiCall('post', '/categories', data),
    update: (id: string, data: any) => apiCall('put', `/categories/${id}`, data),
    delete: (id: string) => apiCall('delete', `/categories/${id}`),
};

// Users
export const userAPI = {
    getDashboard: () => apiCall('get', '/users/dashboard'),
    updateProfile: (data: any) => apiCall('put', '/users/profile', data),
    getWishlist: () => apiCall('get', '/users/wishlist'),
    addToWishlist: (courseId: string) => apiCall('post', `/users/wishlist/${courseId}`),
    removeFromWishlist: (courseId: string) => apiCall('delete', `/users/wishlist/${courseId}`),
    getEnrolled: () => apiCall('get', '/users/enrolled'),
    getAllUsers: (params?: any) => apiCall('get', `/users/admin/all?${new URLSearchParams(params)}`),
    updateUserRole: (id: string, role: string) => apiCall('put', `/users/admin/${id}/role`, { role }),
    deleteUser: (id: string) => apiCall('delete', `/users/admin/${id}`),
};

// Stats
export const statsAPI = {
    getPublicStats: () => apiCall('get', '/stats'),
    submitContact: (data: any) => apiCall('post', '/contact', data),
};