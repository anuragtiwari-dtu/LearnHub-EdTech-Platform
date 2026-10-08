import mongoose, { Document, Schema, Types } from 'mongoose';
import { CourseLevel, CourseStatus } from '../../../shared/types';

export interface LessonDocument {
    _id: Types.ObjectId;
    title: string;
    description: string;
    videoUrl: string;
    videoPublicId: string;
    duration: number;
    notes: string;
    order: number;
    isFree: boolean;
}

export interface SectionDocument {
    _id: Types.ObjectId;
    title: string;
    description: string;
    order: number;
    lessons: LessonDocument[];
}

export interface CourseDocument extends Document {
    title: string;
    slug: string;
    description: string;
    shortDescription: string;
    thumbnail: string;
    thumbnailPublicId: string;
    previewVideoUrl: string;
    previewVideoPublicId: string;
    category: Types.ObjectId;
    instructor: Types.ObjectId;
    level: CourseLevel;
    price: number;
    discountPrice?: number;
    isFree: boolean;
    status: CourseStatus;
    sections: SectionDocument[];
    tags: string[];
    requirements: string[];
    learningOutcomes: string[];
    rating: number;
    reviewCount: number;
    enrollmentCount: number;
    totalDuration: number;
    totalLessons: number;
    language: string;
    createdAt: Date;
    updatedAt: Date;
}

const lessonSchema = new Schema<LessonDocument>(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        videoUrl: { type: String, required: true },
        videoPublicId: { type: String, default: '' },
        duration: { type: Number, default: 0 },
        notes: { type: String, default: '' },
        order: { type: Number, required: true },
        isFree: { type: Boolean, default: false },
    },
    { _id: true, timestamps: false }
);

const sectionSchema = new Schema<SectionDocument>(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        order: { type: Number, required: true },
        lessons: [lessonSchema],
    },
    { _id: true, timestamps: false }
);

const courseSchema = new Schema<CourseDocument>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
            text: true,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            index: true,
        },
        description: {
            type: String,
            required: true,
            maxlength: 5000,
            text: true,
        },
        shortDescription: {
            type: String,
            maxlength: 300,
        },
        thumbnail: { type: String, required: true },
        thumbnailPublicId: { type: String, default: '' },
        previewVideoUrl: { type: String, default: '' },
        previewVideoPublicId: { type: String, default: '' },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
            index: true,
        },
        instructor: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        level: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner',
            index: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        discountPrice: {
            type: Number,
            min: 0,
        },
        isFree: {
            type: Boolean,
            default: false,
            index: true,
        },
        status: {
            type: String,
            enum: ['draft', 'published', 'archived'],
            default: 'draft',
            index: true,
        },
        sections: [sectionSchema],
        tags: [{ type: String, lowercase: true, trim: true }],
        requirements: [{ type: String, trim: true }],
        learningOutcomes: [{ type: String, trim: true }],
        rating: { type: Number, default: 0, min: 0, max: 5 },
        reviewCount: { type: Number, default: 0 },
        enrollmentCount: { type: Number, default: 0, index: true },
        totalDuration: { type: Number, default: 0 },
        totalLessons: { type: Number, default: 0 },
        language: { type: String, default: 'English' },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);

courseSchema.pre('save', function (next) {
    if (this.isModified('title')) {
        this.slug =
            this.title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_]+/g, '-')
                .replace(/^-+|-+$/g, '') +
            '-' +
            Date.now().toString(36);
    }
    if (this.isModified('sections')) {
        this.totalLessons = this.sections.reduce(
            (sum, section) => sum + section.lessons.length,
            0
        );
        this.totalDuration = this.sections.reduce(
            (sum, section) =>
                sum + section.lessons.reduce((lSum, lesson) => lSum + lesson.duration, 0),
            0
        );
    }
    if (this.isModified('price')) {
        this.isFree = this.price === 0;
    }
    next();
});

courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ price: 1, isFree: 1 });
courseSchema.index({ enrollmentCount: -1 });
courseSchema.index({ createdAt: -1 });

export const Course = mongoose.model<CourseDocument>('Course', courseSchema);