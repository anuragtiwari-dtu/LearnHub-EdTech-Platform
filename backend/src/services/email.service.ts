import nodemailer from 'nodemailer';
import { env } from '../config/env';

class EmailService {
    private transporter: nodemailer.Transporter | null = null;

    constructor() {
        if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
            this.transporter = nodemailer.createTransport({
                host: env.SMTP_HOST,
                port: env.SMTP_PORT || 587,
                secure: (env.SMTP_PORT || 587) === 465,
                auth: {
                    user: env.SMTP_USER,
                    pass: env.SMTP_PASS,
                },
            });
        }
    }

    async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
        if (!this.transporter) {
            console.log(`📧 Email would be sent to ${to}: ${subject}`);
            return true;
        }

        try {
            await this.transporter.sendMail({
                from: env.EMAIL_FROM || env.SMTP_USER,
                to,
                subject,
                html,
            });
            return true;
        } catch (error) {
            console.error('Email send error:', error);
            return false;
        }
    }

    async sendContactForm(data: { name: string; email: string; subject: string; message: string }) {
        const html = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message}</p>
    `;
        return this.sendEmail(
            env.EMAIL_FROM || 'admin@learnhub.com',
            `Contact: ${data.subject}`,
            html
        );
    }

    async sendWelcomeEmail(to: string, name: string) {
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">Welcome to LearnHub! 🎉</h1>
        <p>Hi ${name},</p>
        <p>Thank you for joining LearnHub — your journey to mastering computer science starts now.</p>
        <a href="${env.FRONTEND_URL}/courses" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 16px 0;">
          Explore Courses
        </a>
        <p>Happy learning!</p>
        <p>The LearnHub Team</p>
      </div>
    `;
        return this.sendEmail(to, 'Welcome to LearnHub!', html);
    }

    async sendPaymentConfirmation(to: string, courseTitle: string, amount: number) {
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">Payment Successful! ✅</h1>
        <p>Your payment of ₹${amount} for <strong>${courseTitle}</strong> has been confirmed.</p>
        <a href="${env.FRONTEND_URL}/dashboard" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 16px 0;">
          Start Learning
        </a>
      </div>
    `;
        return this.sendEmail(to, `Enrolled: ${courseTitle}`, html);
    }
}

export const emailService = new EmailService();