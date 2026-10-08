import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../../../shared/types';

export interface UserDocument extends Document {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    role: UserRole;
    avatar?: string;
    avatarPublicId?: string;
    isEmailVerified: boolean;
    authProvider: 'local' | 'google' | 'github';
    providerId?: string;
    wishlist: mongoose.Types.ObjectId[];
    refreshToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpiry?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    toJSON(): any;
}

const userSchema = new Schema<UserDocument>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: 100,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            minlength: 6,
            select: false,
        },
        phone: {
            type: String,
            sparse: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ['student', 'admin'],
            default: 'student',
            index: true,
        },
        avatar: { type: String },
        avatarPublicId: { type: String },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        authProvider: {
            type: String,
            enum: ['local', 'google', 'github'],
            default: 'local',
        },
        providerId: { type: String, sparse: true },
        wishlist: [{
            type: Schema.Types.ObjectId,
            ref: 'Course',
        }],
        refreshToken: {
            type: String,
            select: false,
        },
        resetPasswordToken: { type: String, select: false },
        resetPasswordExpiry: { type: Date, select: false },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform(_doc, ret) {
                delete ret.password;
                delete ret.refreshToken;
                delete ret.resetPasswordToken;
                delete ret.resetPasswordExpiry;
                delete (ret as any).__v;
                return ret;
            },
        },
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ email: 1, authProvider: 1 });

export const User = mongoose.model<UserDocument>('User', userSchema);