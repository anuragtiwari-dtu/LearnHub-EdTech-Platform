import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AppError, asyncHandler } from '../../../shared/utils';
import { loginSchema, registerSchema, otpSchema } from '../../../shared/types';
import { validate } from '../middlewares/validate';
import { env } from '../config/env';

const setCookieTokens = (res: Response, tokens: { accessToken: string; refreshToken: string }) => {
    res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 min
    });
    res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    setCookieTokens(res, result.tokens);
    res.status(201).json({
        success: true,
        message: 'Registered successfully',
        data: { user: result.user },
    });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    setCookieTokens(res, result.tokens);
    res.json({
        success: true,
        message: 'Logged in successfully',
        data: { user: result.user },
    });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(req.user!.userId);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;
    if (!token) {
        throw new AppError(401, 'No refresh token provided');
    }
    const tokens = await authService.refreshToken(
        require('jsonwebtoken').verify(token, env.JWT_REFRESH_SECRET).userId
    );
    setCookieTokens(res, tokens);
    res.json({ success: true, message: 'Token refreshed' });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
    const data = await authService.getMe(req.user!.userId);
    res.json({ success: true, data });
});

export const sendOTP = asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.body;
    if (!phone) throw new AppError(400, 'Phone number is required');
    const result = await authService.sendOTP(phone);
    res.json({ success: true, message: result.message, data: { otp: result.otp } });
});

export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.verifyOTP(req.body.phone, req.body.otp);
    setCookieTokens(res, result.tokens);
    res.json({ success: true, data: { user: result.user } });
});

export const googleOAuth = asyncHandler(async (req: Request, res: Response) => {
    // In production, exchange code for tokens via Google API
    const { code } = req.body;
    if (!code) throw new AppError(400, 'Authorization code required');
    // Mock: in production use googleapis library
    const result = await authService.oAuthLogin('google', code, `google_${code}@example.com`, 'Google User');
    setCookieTokens(res, result.tokens);
    res.json({ success: true, data: { user: result.user } });
});

export const githubOAuth = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;
    if (!code) throw new AppError(400, 'Authorization code required');
    const result = await authService.oAuthLogin('github', code, `github_${code}@example.com`, 'GitHub User');
    setCookieTokens(res, result.tokens);
    res.json({ success: true, data: { user: result.user } });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.changePassword(
        req.user!.userId,
        req.body.currentPassword,
        req.body.newPassword
    );
    res.json({ success: true, message: result.message });
});