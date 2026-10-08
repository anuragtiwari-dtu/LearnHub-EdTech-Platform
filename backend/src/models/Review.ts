import mongoose, { Document, Schema } from 'mongoose';

export interface ReviewDocument extends Document {
    user: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema = new Schema<ReviewDocument>(
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
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            maxlength: 500,
        },
    },
    { timestamps: true }
);

reviewSchema.index({ user: 1, course: 1 }, { unique: true });
reviewSchema.index({ course: 1, rating: -1 });

reviewSchema.post('save', async function () {
    const Review = this.constructor as mongoose.Model<ReviewDocument>;
    const stats = await Review.aggregate([
        { $match: { course: this.course } },
        {
            $group: {
                _id: '$course',
                avgRating: { $avg: '$rating' },
                count: { $sum: 1 },
            },
        },
    ]);
    if (stats.length > 0) {
        const Course = mongoose.model('Course');
        await Course.findByIdAndUpdate(this.course, {
            rating: Math.round(stats[0].avgRating * 10) / 10,
            reviewCount: stats[0].count,
        });
    }
});

export const Review = mongoose.model<ReviewDocument>('Review', reviewSchema);