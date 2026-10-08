import { Router } from 'express';
import { register, login, logout, refreshToken, getMe, sendOTP, verifyOTP, googleOAuth, githubOAuth, changePassword } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import { loginSchema, registerSchema } from '../../../shared/types';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', authenticate, logout);
router.post('/refresh-token', refreshToken);
router.get('/me', authenticate, getMe);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/google', googleOAuth);
router.post('/github', githubOAuth);
router.post('/change-password', authenticate, changePassword);

export default router;