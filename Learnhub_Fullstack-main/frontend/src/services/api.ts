import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../../../shared/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(undefined);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const url = originalRequest?.url || '';

        // Don't attempt token refresh for auth endpoints — these 401s are expected
        const skipRefreshUrls = ['/auth/me', '/auth/login', '/auth/register', '/auth/refresh-token'];
        const shouldSkipRefresh = skipRefreshUrls.some((u) => url.includes(u));

        if (error.response?.status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => api(originalRequest));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError as AxiosError);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export async function apiCall<T = any>(method: 'get' | 'post' | 'put' | 'delete' | 'patch', url: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await api[method]<ApiResponse<T>>(url, data);
    return response.data;
}

export default api;