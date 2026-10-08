import mongoose, { Document, Schema } from 'mongoose';

export interface ProgressDocument extends Document {
    user: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    completedLessons: mongoose.Types.ObjectId[];
    lastAccessedLesson: mongoose.Types.ObjectId;
    progressPercentage: number;
    notes: { lessonId: mongoose.Types.ObjectId; content: string }[];
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const progressSchema = new Schema<ProgressDocument>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        course: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        completedLessons: [{
            type: Schema.Types.ObjectId,
            ref: 'Course.sections.lessons',
        }],
        lastAccessedLesson: {
            type: Schema.Types.ObjectId,
            default: null,
        },
        progressPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        notes: [{
            lessonId: { type: Schema.Types.ObjectId, required: true },
            content: { type: String, default: '' },
        }],
        completedAt: { type: Date },
    },
    { timestamps: true }
);

progressSchema.index({ user: 1, course: 1 }, { unique: true });

export const Progress = mongoose.model<ProgressDocument>('Progress', progressSchema);