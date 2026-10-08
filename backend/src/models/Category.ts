import mongoose, { Document, Schema } from 'mongoose';

export interface CategoryDocument extends Document {
    name: string;
    slug: string;
    description: string;
    icon: string;
    courseCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const categorySchema = new Schema<CategoryDocument>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 100,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            index: true,
        },
        description: {
            type: String,
            default: '',
            maxlength: 500,
        },
        icon: {
            type: String,
            default: '📚',
        },
        courseCount: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

categorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

export const Category = mongoose.model<CategoryDocument>('Category', categorySchema);