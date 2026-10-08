import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { env } from './config/env';
import { connectDB } from './config/db';
import routes from './routes';
import { errorHandler, notFound } from './middlewares/errorHandler';

const app = express();

// Security middleware
app.use(helmet());
app.use(
    cors({
        origin: [env.FRONTEND_URL, env.ADMIN_URL],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// Rate limiting (skip in development for admin SPA workflows)
if (env.NODE_ENV === 'production') {
    app.use(
        rateLimit({
            windowMs: env.RATE_LIMIT_WINDOW_MS,
            max: env.RATE_LIMIT_MAX,
            message: { success: false, message: 'Too many requests, please try again later.' },
            standardHeaders: true,
            legacyHeaders: false,
        })
    );
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Sanitization
app.use(mongoSanitize());

// Compression
app.use(compression());

// Logging
if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// API routes
app.use(`/api/v1`, routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
    await connectDB();
    const server = app.listen(env.PORT, () => {
        console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received. Shutting down gracefully...');
        server.close(() => {
            console.log('Process terminated');
        });
    });
};

startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

export default app;