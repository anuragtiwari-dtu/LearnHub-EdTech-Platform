import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../../../shared/utils';
import { MESSAGES } from '../../../shared/constants';

export const validate = (schema: any) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            const result = schema.safeParse(req.body);
            if (!result.success) {
                const errors = (result as any).error.flatten().fieldErrors as Record<string, string[]>;
                const message = Object.entries(errors)
                    .map(([field, msgs]) => `${field}: ${msgs?.join(', ')}`)
                    .join('; ');
                throw new AppError(422, message);
            }
            req.body = result.data;
            next();
        } catch (error) {
            next(error);
        }
    };
};

export const validateQuery = (schema: any) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            const result = schema.safeParse(req.query);
            if (!result.success) {
                const errors = (result as any).error.flatten().fieldErrors as Record<string, string[]>;
                const message = Object.entries(errors)
                    .map(([field, msgs]) => `${field}: ${msgs?.join(', ')}`)
                    .join('; ');
                throw new AppError(422, message);
            }
            req.query = result.data as any;
            next();
        } catch (error) {
            next(error);
        }
    };
};