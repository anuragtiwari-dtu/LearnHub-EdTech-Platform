import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// Token refresh interceptor
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (r?: unknown) => void }> = [];

const processQueue = (error: any) => {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(undefined)));
    failedQueue = [];
};

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => api(originalRequest));
            }
            originalRequest._retry = true;
            isRefreshing = true;
            try {
                await axios.post(
                    `${import.meta.env.VITE_API_URL || '/api/v1'}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export async function apiCall<T = any>(
    url: string,
    method: 'get' | 'post' | 'put' | 'delete',
    data?: unknown
): Promise<{ success: boolean; data?: T; meta?: any; message?: string }> {
    const res = await api[method]<any>(url, data);
    return res.data;
}

// For multipart form uploads
export async function apiUpload<T = any>(
    url: string,
    formData: FormData,
    method: 'post' | 'put' = 'post'
): Promise<{ success: boolean; data?: T; message?: string }> {
    const res = await api[method]<any>(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
}

export const adminAPI = {
    // Dashboard
    getStats: () => apiCall('/stats', 'get'),
    getRevenueStats: () => apiCall('/payments/revenue-stats', 'get'),

    // Users
    getUsers: (params?: string) => apiCall(`/users/admin/all${params ? `?${params}` : ''}`, 'get'),
    updateUserRole: (id: string, role: string) => apiCall(`/users/admin/${id}/role`, 'put', { role }),
    deleteUser: (id: string) => apiCall(`/users/admin/${id}`, 'delete'),

    // Courses
    getCourses: (params?: string) => apiCall(`/courses/admin/all${params ? `?${params}` : ''}`, 'get'),
    getCourse: (id: string) => apiCall(`/courses/${id}`, 'get'),
    createCourse: (data: any) => apiCall('/courses', 'post', data),
    createCourseFormData: (formData: FormData) => apiUpload('/courses', formData),
    updateCourse: (id: string, data: any) => apiCall(`/courses/${id}`, 'put', data),
    updateCourseFormData: (id: string, formData: FormData) => apiUpload(`/courses/${id}`, formData, 'put'),
    deleteCourse: (id: string) => apiCall(`/courses/${id}`, 'delete'),
    uploadVideo: (formData: FormData) => apiUpload('/courses/upload/video', formData),

    // Categories
    getCategories: () => apiCall('/categories/admin/all', 'get'),
    getPublicCategories: () => apiCall('/categories', 'get'),
    createCategory: (data: any) => apiCall('/categories', 'post', data),
    updateCategory: (id: string, data: any) => apiCall(`/categories/${id}`, 'put', data),
    deleteCategory: (id: string) => apiCall(`/categories/${id}`, 'delete'),

    // Orders
    getOrders: (params?: string) => apiCall(`/payments/admin/orders${params ? `?${params}` : ''}`, 'get'),

    // Contacts
    getContacts: (params?: string) => apiCall(`/contact/admin${params ? `?${params}` : ''}`, 'get'),
    updateContactStatus: (id: string, status: string) => apiCall(`/contact/admin/${id}/status`, 'put', { status }),
};

export const authAPI = {
    login: (data: any) => apiCall('/auth/login', 'post', data),
    logout: () => apiCall('/auth/logout', 'post'),
    getMe: () => apiCall('/auth/me', 'get'),
};

export default api;