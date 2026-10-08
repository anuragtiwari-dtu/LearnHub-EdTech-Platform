import { z } from 'zod';

export type UserRole = 'student' | 'admin';

export interface IUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    avatar?: string;
    isEmailVerified: boolean;
    wishlist: any[];
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const contactSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    subject: z.string().optional(),
    message: z.string().min(1, 'Message is required')
});

export type ContactInput = z.infer<typeof contactSchema>;

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    phone: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required')
});

export type LoginInput = z.infer<typeof loginSchema>;

export const otpSchema = z.object({
    phone: z.string().min(1, 'Phone is required'),
    otp: z.string().length(6, 'OTP must be 6 digits')
});

export const courseFilterSchema = z.object({
    page: z.coerce.number().optional().default(1),
    limit: z.coerce.number().optional().default(10),
    search: z.string().optional(),
    level: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    isFree: z.preprocess((val) => (val === 'true' ? true : val === 'false' ? false : val), z.boolean()).optional(),
    sort: z.string().optional()
});
export type CourseFilterInput = z.infer<typeof courseFilterSchema>;

export const reviewSchema = z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().min(1)
});
export type ReviewInput = z.infer<typeof reviewSchema>;

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'published';

export type PaymentProvider = 'stripe' | 'razorpay';
export type OrderStatus = 'pending' | 'completed' | 'failed' | 'refunded';
