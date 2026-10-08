import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { verifyAccessToken, verifyRefreshToken, generateAuthTokens } from '../config/jwt';
import { AppError } from '../../../shared/utils';
import { MESSAGES } from '../../../shared/constants';

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: string;
            };
        }
    }
}

export const authenticate = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let token: string | undefined;

        if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        } else if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            throw new AppError(401, MESSAGES.AUTH.UNAUTHORIZED);
        }

        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.userId).select('+refreshToken');

        if (!user) {
            throw new AppError(401, MESSAGES.AUTH.UNAUTHORIZED);
        }

        req.user = { userId: decoded.userId, role: decoded.role };
        next();
    } catch (error) {
        next(error);
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            throw new AppError(401, MESSAGES.AUTH.UNAUTHORIZED);
        }
        if (!roles.includes(req.user.role)) {
            throw new AppError(403, MESSAGES.AUTH.FORBIDDEN);
        }
        next();
    };
};

export const refreshTokenMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) {
            throw new AppError(401, MESSAGES.AUTH.TOKEN_EXPIRED);
        }

        const decoded = verifyRefreshToken(token);
        const user = await User.findById(decoded.userId).select('+refreshToken');

        if (!user || user.refreshToken !== token) {
            throw new AppError(401, MESSAGES.AUTH.TOKEN_EXPIRED);
        }

        const tokens = generateAuthTokens(user._id.toString(), user.role);
        user.refreshToken = tokens.refreshToken;
        await user.save();

        res.cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        req.user = { userId: decoded.userId, role: decoded.role };
        next();
    } catch (error) {
        next(error);
    }
};