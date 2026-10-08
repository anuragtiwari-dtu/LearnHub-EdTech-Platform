import { User, UserDocument } from '../models/User';
import { FilterQuery, UpdateQuery } from 'mongoose';

export class UserRepository {
    async findById(id: string): Promise<UserDocument | null> {
        return User.findById(id);
    }

    async findByIdWithPassword(id: string): Promise<UserDocument | null> {
        return User.findById(id).select('+password');
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return User.findOne({ email });
    }

    async findByProviderId(
        provider: string,
        providerId: string
    ): Promise<UserDocument | null> {
        return User.findOne({ authProvider: provider, providerId });
    }

    async create(data: Partial<UserDocument>): Promise<UserDocument> {
        return User.create(data);
    }

    async updateById(
        id: string,
        data: UpdateQuery<UserDocument>
    ): Promise<UserDocument | null> {
        return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async deleteById(id: string): Promise<UserDocument | null> {
        return User.findByIdAndDelete(id);
    }

    async findAll(
        filter: FilterQuery<UserDocument>,
        page: number,
        limit: number
    ): Promise<{ users: UserDocument[]; total: number }> {
        const [users, total] = await Promise.all([
            User.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            User.countDocuments(filter),
        ]);
        return { users, total };
    }

    async addToWishlist(userId: string, courseId: string): Promise<UserDocument | null> {
        return User.findByIdAndUpdate(
            userId,
            { $addToSet: { wishlist: courseId } },
            { new: true }
        );
    }

    async removeFromWishlist(userId: string, courseId: string): Promise<UserDocument | null> {
        return User.findByIdAndUpdate(
            userId,
            { $pull: { wishlist: courseId } },
            { new: true }
        );
    }

    async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
        await User.findByIdAndUpdate(userId, { refreshToken });
    }

    async clearRefreshToken(userId: string): Promise<void> {
        await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
    }
}

export const userRepository = new UserRepository();