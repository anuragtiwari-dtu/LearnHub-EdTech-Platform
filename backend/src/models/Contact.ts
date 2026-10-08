import mongoose, { Document, Schema } from 'mongoose';

export interface ContactDocument extends Document {
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'unread' | 'read' | 'replied';
    createdAt: Date;
    updatedAt: Date;
}

const contactSchema = new Schema<ContactDocument>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        subject: { type: String, required: true, trim: true },
        message: { type: String, required: true },
        status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
    },
    { timestamps: true }
);

export const Contact = mongoose.model<ContactDocument>('Contact', contactSchema);
