export const API_VERSION = '/api/v1';

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
} as const;

export const COURSE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export const COURSE_STATUSES = ['draft', 'published', 'archived'] as const;
export const USER_ROLES = ['student', 'admin'] as const;
export const ORDER_STATUSES = ['pending', 'completed', 'failed', 'refunded'] as const;
export const AUTH_PROVIDERS = ['local', 'google', 'github'] as const;
export const PAYMENT_PROVIDERS = ['stripe', 'razorpay'] as const;

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 50,
} as const;

export const CURRENCY = {
    DEFAULT: 'inr',
    SYMBOLS: { inr: '₹', usd: '$' },
} as const;

export const REGEX = {
    MONGO_ID: /^[0-9a-fA-F]{24}$/,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    INDIAN_PHONE: /^[6-9]\d{9}$/,
} as const;

export const MESSAGES = {
    AUTH: {
        LOGIN_SUCCESS: 'Logged in successfully',
        REGISTER_SUCCESS: 'Registered successfully',
        LOGOUT_SUCCESS: 'Logged out successfully',
        INVALID_CREDENTIALS: 'Invalid email or password',
        EMAIL_EXISTS: 'Email already registered',
        UNAUTHORIZED: 'Authentication required',
        FORBIDDEN: 'Access denied',
        TOKEN_EXPIRED: 'Token expired, please login again',
        OTP_SENT: 'OTP sent successfully',
        OTP_INVALID: 'Invalid OTP',
        PASSWORD_CHANGED: 'Password changed successfully',
    },
    COURSE: {
        CREATED: 'Course created successfully',
        UPDATED: 'Course updated successfully',
        DELETED: 'Course deleted successfully',
        NOT_FOUND: 'Course not found',
        ALREADY_ENROLLED: 'Already enrolled in this course',
        ENROLLED: 'Enrolled successfully',
    },
    PAYMENT: {
        ORDER_CREATED: 'Order created successfully',
        PAYMENT_SUCCESS: 'Payment completed successfully',
        PAYMENT_FAILED: 'Payment failed',
        WEBHOOK_RECEIVED: 'Webhook processed',
    },
    GENERAL: {
        NOT_FOUND: 'Resource not found',
        SERVER_ERROR: 'Internal server error',
        VALIDATION_ERROR: 'Validation failed',
    },
} as const;