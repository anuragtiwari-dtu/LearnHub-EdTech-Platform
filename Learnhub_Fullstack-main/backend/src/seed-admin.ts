import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { User } from './models/User';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const ADMIN_EMAIL = 'admin@learnhub.com';
const ADMIN_PASSWORD = 'Admin@123';

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log('✅ Connected to MongoDB');

        const existing = await User.findOne({ email: ADMIN_EMAIL });
        if (existing) {
            // Ensure role is admin
            if (existing.role !== 'admin') {
                existing.role = 'admin';
                await existing.save();
                console.log('✅ Existing user promoted to admin');
            } else {
                console.log('ℹ️  Admin user already exists');
            }
        } else {
            await User.create({
                name: 'Admin',
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                role: 'admin',
                isEmailVerified: true,
                authProvider: 'local',
            });
            console.log('✅ Admin user created');
        }

        console.log(`\n📧 Email:    ${ADMIN_EMAIL}`);
        console.log(`🔑 Password: ${ADMIN_PASSWORD}\n`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

seedAdmin();
