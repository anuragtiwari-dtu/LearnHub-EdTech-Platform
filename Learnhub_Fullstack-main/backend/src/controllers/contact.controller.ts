import { Request, Response } from 'express';
import { emailService } from '../services/email.service';
import { asyncHandler, AppError } from '../../../shared/utils';
import { contactSchema } from '../../../shared/types';
import { Contact } from '../models/Contact';

export const submitContact = asyncHandler(async (req: Request, res: Response) => {
    const data = contactSchema.parse(req.body);
    const contact = await Contact.create(data);
    await emailService.sendContactForm(data as any);
    res.json({ success: true, message: 'Message sent successfully', data: contact });
});

export const getContacts = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const [contacts, total] = await Promise.all([
        Contact.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        Contact.countDocuments()
    ]);
    
    res.json({ success: true, data: contacts, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
});

export const updateContactStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    if (!['unread', 'read', 'replied'].includes(status)) {
        throw new AppError(400, 'Invalid status');
    }
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!contact) throw new AppError(404, 'Contact not found');
    res.json({ success: true, data: contact });
});