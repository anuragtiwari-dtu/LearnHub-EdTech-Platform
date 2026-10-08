import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { env } from './config/env';
import { User } from './models/User';
import { Category } from './models/Category';
import { Course } from './models/Course';
import { Review } from './models/Review';
import { Order } from './models/Order';
import { Progress } from './models/Progress';
import bcrypt from 'bcryptjs';

const categories = [
    { name: 'Web Development', description: 'Build modern websites and web applications', icon: '🌐' },
    { name: 'Data Science', description: 'Analyze data and build ML models', icon: '📊' },
    { name: 'Mobile Development', description: 'Create iOS and Android apps', icon: '📱' },
    { name: 'Cloud Computing', description: 'Master AWS, Azure, and GCP', icon: '☁️' },
    { name: 'Cybersecurity', description: 'Protect systems and networks', icon: '🔒' },
    { name: 'Machine Learning', description: 'Build intelligent systems', icon: '🤖' },
    { name: 'DevOps', description: 'CI/CD, containers, and infrastructure', icon: '⚙️' },
    { name: 'Database', description: 'SQL, NoSQL, and database design', icon: '🗄️' },
];

const sampleLessons = (sectionTitle: string, count: number) => {
    return Array.from({ length: count }, (_, i) => ({
        title: `${sectionTitle} - Lesson ${i + 1}`,
        description: `In-depth lesson covering ${sectionTitle.toLowerCase()} topic ${i + 1}`,
        videoUrl: 'https://res.cloudinary.com/demo/video/upload/sample.mp4',
        videoPublicId: '',
        duration: 180 + Math.floor(Math.random() * 600),
        notes: `Key takeaways for lesson ${i + 1}`,
        order: i + 1,
        isFree: i === 0,
    }));
};

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Category.deleteMany({}),
            Course.deleteMany({}),
            Review.deleteMany({}),
            Order.deleteMany({}),
            Progress.deleteMany({}),
        ]);

        // Create Admin
        console.log('👤 Creating admin user...');
        const admin = await User.create({
            name: 'Admin LearnHub',
            email: 'admin@learnhub.com',
            password: 'admin123456',
            role: 'admin',
            isEmailVerified: true,
            authProvider: 'local',
        });

        // Create Students
        console.log('👥 Creating student users...');
        const students = await User.create(
            Array.from({ length: 25 }, (_, i) => ({
                name: `Student ${i + 1}`,
                email: `student${i + 1}@learnhub.com`,
                password: 'student123456',
                role: 'student',
                isEmailVerified: true,
                authProvider: 'local',
            }))
        );

        // Create Categories
        console.log('📂 Creating categories...');
        const createdCategories = await Category.create(categories);

        // Create Courses
        console.log('📚 Creating courses...');
        const courseData = [
            { title: 'Complete React & Next.js Developer', level: 'intermediate', price: 1999, discountPrice: 999, catIndex: 0 },
            { title: 'Python for Data Science Bootcamp', level: 'beginner', price: 1499, discountPrice: 799, catIndex: 1 },
            { title: 'Flutter Mobile App Development', level: 'intermediate', price: 1799, discountPrice: 899, catIndex: 2 },
            { title: 'AWS Solutions Architect Associate', level: 'advanced', price: 2499, discountPrice: 1299, catIndex: 3 },
            { title: 'Ethical Hacking & Penetration Testing', level: 'advanced', price: 2999, discountPrice: 1499, catIndex: 4 },
            { title: 'Deep Learning with TensorFlow', level: 'advanced', price: 2199, discountPrice: 1099, catIndex: 5 },
            { title: 'Docker & Kubernetes Mastery', level: 'intermediate', price: 1699, discountPrice: 849, catIndex: 6 },
            { title: 'MongoDB & PostgreSQL Complete Guide', level: 'beginner', price: 0, catIndex: 7 },
            { title: 'JavaScript Fundamentals', level: 'beginner', price: 0, catIndex: 0 },
            { title: 'Node.js & Express Backend Development', level: 'intermediate', price: 1299, discountPrice: 699, catIndex: 0 },
            { title: 'TypeScript from Zero to Hero', level: 'beginner', price: 499, discountPrice: 299, catIndex: 0 },
            { title: 'MLOps & Production ML Systems', level: 'advanced', price: 3499, discountPrice: 1799, catIndex: 5 },
        ];

        const courses = await Course.create(
            courseData.map((cd, i) => {
                const sectionCount = 3 + Math.floor(Math.random() * 3);
                const sections = Array.from({ length: sectionCount }, (_, si) => {
                    const lessonCount = 4 + Math.floor(Math.random() * 6);
                    return {
                        title: `Section ${si + 1}: ${['Foundations', 'Core Concepts', 'Advanced Topics', 'Projects', 'Best Practices'][si] || 'Bonus'}`,
                        description: `Deep dive into section ${si + 1}`,
                        order: si + 1,
                        lessons: sampleLessons(`Section ${si + 1}`, lessonCount),
                    };
                });

                const totalLessons = sections.reduce((sum, s) => sum + s.lessons.length, 0);
                const totalDuration = sections.reduce(
                    (sum, s) => sum + s.lessons.reduce((ls, l) => ls + l.duration, 0),
                    0
                );

                return {
                    title: cd.title,
                    slug: cd.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36),
                    description: `Comprehensive course on ${cd.title.toLowerCase()}. Learn from industry experts with hands-on projects, real-world examples, and career-ready skills.`,
                    shortDescription: `Master ${cd.title.toLowerCase()} with expert-led instruction.`,
                    thumbnail: `https://picsum.photos/seed/course-${i}/800/450`,
                    thumbnailPublicId: '',
                    previewVideoUrl: 'https://res.cloudinary.com/demo/video/upload/sample.mp4',
                    previewVideoPublicId: '',
                    category: createdCategories[cd.catIndex]._id,
                    instructor: admin._id,
                    level: cd.level,
                    price: cd.price,
                    discountPrice: cd.discountPrice,
                    isFree: cd.price === 0,
                    status: 'published',
                    sections,
                    tags: cd.title.toLowerCase().split(' ').slice(0, 3),
                    requirements: ['Basic computer knowledge', 'Internet connection', 'Determination to learn'],
                    learningOutcomes: [
                        `Build production-grade ${cd.title.split(' ')[1] || ''} applications`,
                        'Understand industry best practices',
                        'Deploy projects to production',
                        'Prepare for technical interviews',
                    ],
                    totalLessons,
                    totalDuration,
                    enrollmentCount: Math.floor(Math.random() * 2000) + 50,
                    rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
                    reviewCount: Math.floor(Math.random() * 200) + 10,
                    language: 'English',
                };
            })
        );

        // Create Reviews
        console.log('⭐ Creating reviews...');
        const reviewComments = [
            'Excellent course! The instructor explains everything clearly.',
            'Best course I have taken on this platform. Highly recommended.',
            'Good content, well-structured curriculum. Learned a lot.',
            'Practical projects really helped me understand the concepts.',
            'The course is comprehensive and up-to-date with industry standards.',
        ];

        const reviewDocs = [];
        for (const course of courses.slice(0, 8)) {
            const reviewCount = 5 + Math.floor(Math.random() * 10);
            for (let r = 0; r < Math.min(reviewCount, students.length); r++) {
                reviewDocs.push({
                    user: students[r]._id,
                    course: course._id,
                    rating: Math.floor(Math.random() * 2) + 4, // 4-5
                    comment: reviewComments[r % reviewComments.length],
                });
            }
        }
        await Review.create(reviewDocs);

        // Create Orders and Progress for some students
        console.log('💰 Creating orders and progress...');
        const orderDocs = [];
        const progressDocs = [];

        for (let s = 0; s < Math.min(10, students.length); s++) {
            const enrolledCount = 1 + Math.floor(Math.random() * 3);
            const studentCourses = courses.sort(() => Math.random() - 0.5).slice(0, enrolledCount);

            for (const course of studentCourses) {
                const amount = course.discountPrice ?? course.price;
                if (amount > 0) {
                    orderDocs.push({
                        user: students[s]._id,
                        course: course._id,
                        amount,
                        originalAmount: course.price,
                        discount: course.price - amount,
                        currency: 'inr',
                        provider: Math.random() > 0.5 ? 'stripe' : 'razorpay',
                        providerOrderId: `order_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                        providerPaymentId: `pay_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                        status: 'completed',
                    });
                }

                const completedLessons = course.sections
                    .flatMap((s) => s.lessons)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, Math.floor(Math.random() * course.totalLessons * 0.7))
                    .map((l) => l._id);

                const progressPercentage = Math.round((completedLessons.length / Math.max(course.totalLessons, 1)) * 100);

                progressDocs.push({
                    user: students[s]._id,
                    course: course._id,
                    completedLessons,
                    lastAccessedLesson: completedLessons[completedLessons.length - 1] || null,
                    progressPercentage,
                    completedAt: progressPercentage === 100 ? new Date() : undefined,
                });
            }
        }

        await Order.create(orderDocs);
        await Progress.create(progressDocs);

        console.log('\n✅ Database seeded successfully!');
        console.log(`   👤 Admin: admin@learnhub.com / admin123456`);
        console.log(`   👥 Students: 25 users (student1@learnhub.com / student123456)`);
        console.log(`   📂 Categories: ${createdCategories.length}`);
        console.log(`   📚 Courses: ${courses.length}`);
        console.log(`   ⭐ Reviews: ${reviewDocs.length}`);
        console.log(`   💰 Orders: ${orderDocs.length}`);
        console.log(`   📈 Progress: ${progressDocs.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();