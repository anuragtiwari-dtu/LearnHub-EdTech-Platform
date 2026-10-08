import { userRepository } from '../repositories/user.repository';
import { User, UserDocument } from '../models/User';
import { generateAuthTokens } from '../config/jwt';
import { AppError } from '../../../shared/utils';
import { MESSAGES } from '../../../shared/constants';
import { RegisterInput, LoginInput } from '../../../shared/types';
import { Progress } from '../models/Progress';

export class AuthService {
    async register(data: RegisterInput) {
        const existingUser = await userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new AppError(409, MESSAGES.AUTH.EMAIL_EXISTS);
        }

        const user = await userRepository.create({
            name: data.name,
            email: data.email,
            password: data.password,
            phone: data.phone,
            authProvider: 'local',
        });

        const tokens = generateAuthTokens(user._id.toString(), user.role);
        await userRepository.updateRefreshToken(user._id.toString(), tokens.refreshToken);

        return {
            user: user.toJSON(),
            tokens,
        };
    }

    async login(data: LoginInput) {
        const user = await User.findOne({ email: data.email }).select('+password');
        if (!user || !(await user.comparePassword(data.password))) {
            throw new AppError(401, MESSAGES.AUTH.INVALID_CREDENTIALS);
        }

        const tokens = generateAuthTokens(user._id.toString(), user.role);
        await userRepository.updateRefreshToken(user._id.toString(), tokens.refreshToken);

        return {
            user: user.toJSON(),
            tokens,
        };
    }

    async logout(userId: string) {
        await userRepository.clearRefreshToken(userId);
    }

    async refreshToken(userId: string) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new AppError(401, MESSAGES.AUTH.UNAUTHORIZED);
        }

        const tokens = generateAuthTokens(user._id.toString(), user.role);
        await userRepository.updateRefreshToken(user._id.toString(), tokens.refreshToken);

        return tokens;
    }

    async oAuthLogin(provider: string, providerId: string, email: string, name: string, avatar?: string) {
        let user = await userRepository.findByProviderId(provider, providerId);

        if (!user) {
            const existingUser = await userRepository.findByEmail(email);
            if (existingUser) {
                user = await userRepository.updateById(existingUser._id.toString(), {
                    authProvider: provider,
                    providerId,
                    avatar: avatar || existingUser.avatar,
                    isEmailVerified: true,
                });
            } else {
                user = await userRepository.create({
                    name,
                    email,
                    authProvider: provider as any,
                    providerId,
                    avatar,
                    isEmailVerified: true,
                });
            }
        }

        const tokens = generateAuthTokens(user!._id.toString(), user!.role);
        await userRepository.updateRefreshToken(user!._id.toString(), tokens.refreshToken);

        return {
            user: user!.toJSON(),
            tokens,
        };
    }

    async sendOTP(phone: string) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`📱 OTP for ${phone}: ${otp}`);
        // In production, integrate SMS service (Twilio, MSG91, etc.)
        return { message: MESSAGES.AUTH.OTP_SENT, otp }; // Return OTP only in dev
    }

    async verifyOTP(phone: string, otp: string) {
        // Mock verification - in production verify against stored OTP
        if (otp.length !== 6) {
            throw new AppError(400, MESSAGES.AUTH.OTP_INVALID);
        }
        let user = await User.findOne({ phone });
        if (!user) {
            user = await userRepository.create({
                name: `User_${phone.slice(-4)}`,
                phone,
                authProvider: 'local',
                isEmailVerified: false,
            }) as any;
        }
        if (!user) throw new AppError(404, 'User not found');
        const tokens = generateAuthTokens(user._id.toString(), user.role);
        await userRepository.updateRefreshToken(user._id.toString(), tokens.refreshToken);
        return { user: user.toJSON(), tokens };
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await User.findById(userId).select('+password');
        if (!user) {
            throw new AppError(404, 'User not found');
        }
        if (!(await user.comparePassword(currentPassword))) {
            throw new AppError(400, 'Current password is incorrect');
        }
        user.password = newPassword;
        await user.save();
        return { message: MESSAGES.AUTH.PASSWORD_CHANGED };
    }

    async getMe(userId: string) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new AppError(404, 'User not found');
        }

        const enrolledCourses = await Progress.find({ user: userId })
            .populate({
                path: 'course',
                select: 'title slug thumbnail level totalLessons totalDuration',
                populate: { path: 'category', select: 'name slug' },
            });

        return {
            user: user.toJSON(),
            enrolledCourses,
        };
    }
}

export const authService = new AuthService();