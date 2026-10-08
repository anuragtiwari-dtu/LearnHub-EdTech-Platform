import { Order, OrderDocument } from '../models/Order';
import { FilterQuery } from 'mongoose';

export class OrderRepository {
    async findById(id: string): Promise<OrderDocument | null> {
        return Order.findById(id).populate('user course', 'name email title slug');
    }

    async findByProviderOrderId(providerOrderId: string): Promise<OrderDocument | null> {
        return Order.findOne({ providerOrderId });
    }

    async create(data: Partial<OrderDocument>): Promise<OrderDocument> {
        return Order.create(data);
    }

    async updateById(
        id: string,
        data: Partial<OrderDocument>
    ): Promise<OrderDocument | null> {
        return Order.findByIdAndUpdate(id, data, { new: true });
    }

    async findByUser(
        userId: string,
        page: number,
        limit: number
    ): Promise<{ orders: OrderDocument[]; total: number }> {
        const [orders, total] = await Promise.all([
            Order.find({ user: userId })
                .populate('course', 'title thumbnail slug')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Order.countDocuments({ user: userId }),
        ]);
        return { orders, total };
    }

    async findByUserAndCourse(
        userId: string,
        courseId: string
    ): Promise<OrderDocument | null> {
        return Order.findOne({ user: userId, course: courseId, status: 'completed' });
    }

    async getRevenueStats(): Promise<{
        totalRevenue: number;
        totalOrders: number;
        monthlyRevenue: { month: string; revenue: number; count: number }[];
    }> {
        const totalStats = await Order.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    totalOrders: { $sum: 1 },
                },
            },
        ]);

        const monthlyStats = await Order.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
        ]);

        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push({
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                name: d.toLocaleString('default', { month: 'short' }),
            });
        }

        const monthlyRevenue = months.map(m => {
            const stat = monthlyStats.find(s => s._id.year === m.year && s._id.month === m.month);
            return {
                month: m.name,
                revenue: stat ? stat.revenue : 0,
                count: stat ? stat.count : 0,
            };
        });

        return {
            totalRevenue: totalStats[0]?.totalRevenue || 0,
            totalOrders: totalStats[0]?.totalOrders || 0,
            monthlyRevenue,
        };
    }

    async findAll(
        filter: FilterQuery<OrderDocument>,
        page: number,
        limit: number
    ): Promise<{ orders: OrderDocument[]; total: number }> {
        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate('user', 'name email')
                .populate('course', 'title slug')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Order.countDocuments(filter),
        ]);
        return { orders, total };
    }
}

export const orderRepository = new OrderRepository();