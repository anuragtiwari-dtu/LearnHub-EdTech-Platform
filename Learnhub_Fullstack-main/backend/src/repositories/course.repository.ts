import { Course, CourseDocument } from '../models/Course';
import { FilterQuery, UpdateQuery } from 'mongoose';
import { CourseFilterInput } from '../../../shared/types';

export class CourseRepository {
    async findById(id: string): Promise<CourseDocument | null> {
        return Course.findById(id).populate('category instructor', 'name slug email avatar');
    }

    async findBySlug(slug: string): Promise<CourseDocument | null> {
        return Course.findOne({ slug }).populate('category instructor', 'name slug email avatar');
    }

    async create(data: Partial<CourseDocument>): Promise<CourseDocument> {
        return Course.create(data);
    }

    async updateById(
        id: string,
        data: UpdateQuery<CourseDocument>
    ): Promise<CourseDocument | null> {
        return Course.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async deleteById(id: string): Promise<CourseDocument | null> {
        return Course.findByIdAndDelete(id);
    }

    async findAll(filter: CourseFilterInput): Promise<{
        courses: CourseDocument[];
        total: number;
    }> {
        const query: FilterQuery<CourseDocument> = { status: 'published' };
        const sortMap: Record<string, any> = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            'price-asc': { price: 1 },
            'price-desc': { price: -1 },
            popular: { enrollmentCount: -1 },
        };

        if (filter.category) {
            query.category = filter.category;
        }
        if (filter.level) {
            query.level = filter.level;
        }
        if (filter.search) {
            query.$text = { $search: filter.search };
        }
        if (filter.isFree !== undefined) {
            query.isFree = filter.isFree;
        }
        if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
            query.price = {};
            if (filter.minPrice !== undefined) query.price.$gte = filter.minPrice;
            if (filter.maxPrice !== undefined) query.price.$lte = filter.maxPrice;
        }

        const sort = filter.sort ? sortMap[filter.sort] || sortMap.newest : sortMap.newest;

        const [courses, total] = await Promise.all([
            Course.find(query)
                .populate('category', 'name slug')
                .populate('instructor', 'name avatar')
                .sort(sort)
                .skip((filter.page - 1) * filter.limit)
                .limit(filter.limit),
            Course.countDocuments(query),
        ]);

        return { courses, total };
    }

    async incrementEnrollment(courseId: string): Promise<void> {
        await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });
    }

    async findPublished(): Promise<CourseDocument[]> {
        return Course.find({ status: 'published' })
            .sort({ enrollmentCount: -1 })
            .populate('category', 'name slug')
            .populate('instructor', 'name avatar')
            .limit(8);
    }

    async countByCategory(categoryId: string): Promise<number> {
        return Course.countDocuments({ category: categoryId, status: 'published' });
    }

    async findAllForAdmin(
        filter: FilterQuery<CourseDocument>,
        page: number,
        limit: number
    ): Promise<{ courses: CourseDocument[]; total: number }> {
        const [courses, total] = await Promise.all([
            Course.find(filter)
                .populate('category', 'name slug')
                .populate('instructor', 'name avatar')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Course.countDocuments(filter),
        ]);
        return { courses, total };
    }
}

export const courseRepository = new CourseRepository();