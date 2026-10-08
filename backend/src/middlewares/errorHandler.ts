import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../shared/utils';
import { env } from '../config/env';

export const errorHandler = (
    err: Error | AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let errors: any = undefined;

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err.name === 'ValidationError') {
        statusCode = 422;
        message = 'Validation Error';
        errors = err;
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    } else if (err.name === 'MongoServerError' && (err as any).code === 11000) {
        statusCode = 409;
        const field = Object.keys((err as any).keyValue)[0];
        message = `${field} already exists`;
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    if (env.NODE_ENV === 'development') {
        console.error('🔥 Error:', err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(errors && { errors }),
        ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

export const notFound = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
};