import { Category } from '../models/Category';
import { AppError } from '../../../shared/utils';

export class CategoryService {
    async createCategory(data: { name: string; description?: string; icon?: string }) {
        const existing = await Category.findOne({ name: data.name });
        if (existing) {
            throw new AppError(409, 'Category already exists');
        }
        return Category.create(data);
    }

    async updateCategory(id: string, data: Partial<{ name: string; description: string; icon: string; isActive: boolean }>) {
        const category = await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        if (!category) {
            throw new AppError(404, 'Category not found');
        }
        return category;
    }

    async deleteCategory(id: string) {
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            throw new AppError(404, 'Category not found');
        }
        return { message: 'Category deleted' };
    }

    async getAllCategories() {
        return Category.find({ isActive: true }).sort({ name: 1 });
    }

    async getAdminCategories() {
        return Category.find().sort({ createdAt: -1 });
    }

    async getCategoryBySlug(slug: string) {
        const category = await Category.findOne({ slug, isActive: true });
        if (!category) {
            throw new AppError(404, 'Category not found');
        }
        return category;
    }
}

export const categoryService = new CategoryService();