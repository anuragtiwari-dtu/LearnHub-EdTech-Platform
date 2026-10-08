export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export const getPaginationMeta = (total: number, page: number, limit: number) => {
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    };
};