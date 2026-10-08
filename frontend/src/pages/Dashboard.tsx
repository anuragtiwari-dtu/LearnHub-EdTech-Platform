import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Award, Clock, TrendingUp, Play, Heart, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { userAPI, progressAPI, paymentAPI } from '@/services/endpoints';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/services/endpoints';
import { formatDuration } from '@/lib/utils';

export default function Dashboard() {
    const { user, logout: storeLogout } = useAuthStore();
    const navigate = useNavigate();

    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: userAPI.getDashboard,
    });

    const { data: ordersData } = useQuery({
        queryKey: ['user-orders'],
        queryFn: () => paymentAPI.getOrders({ page: 1, limit: 5 }),
    });

    const handleLogout = async () => {
        try { await authAPI.logout(); } catch { } finally {
            storeLogout();
            navigate('/');
        }
    };

    const stats = dashboardData?.data?.stats;
    const recentProgress = dashboardData?.data?.recentProgress || [];
    const orders = ordersData?.data || [];

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
                        {stats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { icon: BookOpen, value: stats.enrolledCount, label: 'Enrolled Courses', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                                    { icon: Award, value: stats.completedCount, label: 'Completed', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
                                    { icon: TrendingUp, value: stats.inProgressCount, label: 'In Progress', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
                                    { icon: Clock, value: `${stats.totalHoursSpent}h`, label: 'Hours Spent', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
                                ].map((stat, i) => (
                                    <Card key={i}>
                                        <CardContent className="p-4 flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                                                <stat.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold">{stat.value}</div>
                                                <div className="text-xs text-muted-foreground">{stat.label}</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Enrolled Courses */}
                        <div>
                            <h2 className="font-heading text-xl font-bold mb-4">Continue Learning</h2>
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <Card key={i}><CardContent className="p-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
                                    ))}
                                </div>
                            ) : recentProgress.length === 0 ? (
                                <Card className="p-12 text-center">
                                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="font-semibold mb-2">No courses yet</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Start exploring courses and begin your learning journey</p>
                                    <Link to="/courses"><Button>Browse Courses</Button></Link>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {recentProgress.map((progress: any) => (
                                        <Link key={progress._id} to={`/learn/${typeof progress.course === 'object' ? progress.course._id : progress.course}`}>
                                            <Card className="hover:border-primary/30 transition-colors">
                                                <CardContent className="p-4 flex gap-4">
                                                    <img
                                                        src={typeof progress.course === 'object' ? (progress.course.thumbnail || `https://picsum.photos/seed/${progress.course._id}/120/80`) : ''}
                                                        alt=""
                                                        className="w-28 h-20 rounded-lg object-cover flex-shrink-0"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-sm truncate">
                                                            {typeof progress.course === 'object' ? progress.course.title : 'Course'}
                                                        </h3>
                                                        <div className="mt-2">
                                                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                                <span>{progress.progressPercentage}% complete</span>
                                                            </div>
                                                            <Progress value={progress.progressPercentage} className="h-1.5" />
                                                        </div>
                                                        <Button size="sm" className="mt-2 h-7 text-xs">
                                                            <Play className="mr-1 h-3 w-3" /> Continue
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Orders */}
                        {orders.length > 0 && (
                            <div>
                                <h2 className="font-heading text-xl font-bold mb-4">Recent Purchases</h2>
                                <Card>
                                    <div className="divide-y">
                                        {orders.slice(0, 5).map((order: any) => (
                                            <div key={order._id} className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {typeof order.course === 'object' && (
                                                        <img src={order.course.thumbnail || ''} alt="" className="h-10 w-10 rounded object-cover" />
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-sm">{typeof order.course === 'object' ? order.course.title : 'Course'}</div>
                                                        <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                <Badge variant={order.status === 'completed' ? 'success' : 'secondary'} className="capitalize">
                                                    {order.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        )}
        </div>
    );
}