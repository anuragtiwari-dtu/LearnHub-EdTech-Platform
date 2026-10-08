import { Request, Response } from 'express';
import { categoryService } from '../services/category.service';
import { asyncHandler, AppError } from '../../../shared/utils';

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const result = await categoryService.deleteCategory(req.params.id);
    res.json({ success: true, message: result.message });
});

export const getAllCategories = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await categoryService.getAllCategories();
    res.json({ success: true, data: categories });
});

export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.getCategoryBySlug(req.params.slug);
    res.json({ success: true, data: category });
});

export const getAdminCategories = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await categoryService.getAdminCategories();
    res.json({ success: true, data: categories });
});