import mongoose from 'mongoose';
import { env } from '../config/env';

// Override env for test
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/learnhub-test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-for-jest';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-jest';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.PORT = '5555';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.ADMIN_URL = 'http://localhost:5174';

export const connectTestDB = async (): Promise<void> => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI as string);
    }
};

export const disconnectTestDB = async (): Promise<void> => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }
};

export const clearTestDB = async (): Promise<void> => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};