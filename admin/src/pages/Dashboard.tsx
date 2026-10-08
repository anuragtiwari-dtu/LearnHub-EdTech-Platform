import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, DollarSign, ShoppingCart, TrendingUp, Tag, Loader2 } from 'lucide-react';
import { adminAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['stats'],
        queryFn: adminAPI.getStats,
    });
    const { data: revenue, isLoading: revenueLoading } = useQuery({
        queryKey: ['revenue'],
        queryFn: adminAPI.getRevenueStats,
    });
    const { data: recentCourses } = useQuery({
        queryKey: ['admin-courses', 1],
        queryFn: () => adminAPI.getCourses('page=1&limit=5'),
    });
    const { data: recentOrders } = useQuery({
        queryKey: ['admin-orders', 1],
        queryFn: () => adminAPI.getOrders('page=1&limit=5'),
    });
    const { data: catData } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: adminAPI.getCategories,
    });

    const statCards = [
        {
            title: 'Total Students',
            value: stats?.data?.students || 0,
            icon: Users,
            color: 'text-blue-600 bg-blue-100',
            description: 'Registered students',
        },
        {
            title: 'Total Courses',
            value: stats?.data?.courses || 0,
            icon: BookOpen,
            color: 'text-emerald-600 bg-emerald-100',
            description: 'Published courses',
        },
        {
            title: 'Total Revenue',
            value: formatPrice(revenue?.data?.totalRevenue || 0),
            icon: DollarSign,
            color: 'text-amber-600 bg-amber-100',
            description: 'All time earnings',
        },
        {
            title: 'Total Orders',
            value: stats?.data?.orders || 0,
            icon: ShoppingCart,
            color: 'text-purple-600 bg-purple-100',
            description: 'Completed orders',
        },
    ];

    const courses = recentCourses?.data || [];
    const orders = recentOrders?.data || [];
    const categories = catData?.data || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">Overview of your learning platform</p>
            </div>

            {/* Stat Cards */}
            {statsLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, i) => (
                        <Card key={i} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{stat.description}</p>
                                    </div>
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Monthly Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {revenueLoading ? (
                            <div className="h-64 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenue?.data?.monthlyRevenue || []}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="month" className="text-xs" />
                                        <YAxis className="text-xs" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px',
                                            }}
                                            formatter={(value: number) => [formatPrice(value), 'Revenue']}
                                        />
                                        <Bar dataKey="revenue" fill="hsl(24, 95%, 53%)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Categories Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5 text-primary" />
                            Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(categories as any[]).length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">No categories yet</p>
                        ) : (
                            <div className="space-y-3">
                                {(categories as any[]).slice(0, 6).map((cat: any) => (
                                    <div key={cat._id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{cat.icon}</span>
                                            <span className="text-sm font-medium">{cat.name}</span>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">
                                            {cat.courseCount || 0}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Courses */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Recent Courses
                        </CardTitle>
                        <Link to="/courses" className="text-sm text-primary hover:underline font-medium">View All</Link>
                    </CardHeader>
                    <CardContent>
                        {(courses as any[]).length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">No courses yet</p>
                        ) : (
                            <div className="space-y-3">
                                {(courses as any[]).map((course: any) => (
                                    <div key={course._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                        <img
                                            src={course.thumbnail || `https://picsum.photos/seed/${course._id}/48/32`}
                                            alt=""
                                            className="h-8 w-12 rounded object-cover flex-shrink-0"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium line-clamp-1">{course.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {course.enrollmentCount || 0} enrollments •{' '}
                                                {course.isFree ? 'Free' : formatPrice(course.price)}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={course.status === 'published' ? 'success' : 'secondary'}
                                            className="text-xs flex-shrink-0"
                                        >
                                            {course.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-primary" />
                            Recent Orders
                        </CardTitle>
                        <Link to="/orders" className="text-sm text-primary hover:underline font-medium">View All</Link>
                    </CardHeader>
                    <CardContent>
                        {(orders as any[]).length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">No orders yet</p>
                        ) : (
                            <div className="space-y-3">
                                {(orders as any[]).map((order: any) => (
                                    <div key={order._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium">
                                                {order.user?.name || 'Unknown'}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                {order.course?.title || '-'}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-medium">{formatPrice(order.amount || 0)}</p>
                                            <Badge
                                                variant={order.status === 'completed' ? 'success' : order.status === 'failed' ? 'destructive' : 'secondary'}
                                                className="text-xs"
                                            >
                                                {order.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}