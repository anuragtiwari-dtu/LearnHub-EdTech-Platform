import mongoose, { Document, Schema } from 'mongoose';
import { PaymentProvider, OrderStatus } from '../../../shared/types';

export interface OrderDocument extends Document {
    user: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    amount: number;
    originalAmount: number;
    discount: number;
    currency: string;
    provider: PaymentProvider;
    providerOrderId: string;
    providerPaymentId: string;
    status: OrderStatus;
    refundReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const orderSchema = new Schema<OrderDocument>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        course: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
            index: true,
        },
        amount: { type: Number, required: true, min: 0 },
        originalAmount: { type: Number, required: true, min: 0 },
        discount: { type: Number, default: 0, min: 0 },
        currency: { type: String, default: 'inr', uppercase: true },
        provider: {
            type: String,
            enum: ['stripe', 'razorpay'],
            required: true,
        },
        providerOrderId: { type: String, required: true, index: true },
        providerPaymentId: { type: String, default: '', index: true },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending',
            index: true,
        },
        refundReason: { type: String },
    },
    { timestamps: true }
);

orderSchema.index({ user: 1, course: 1 }, { unique: true });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<OrderDocument>('Order', orderSchema);