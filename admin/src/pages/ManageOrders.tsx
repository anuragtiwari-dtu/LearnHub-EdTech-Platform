import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Search, ChevronLeft, ChevronRight, Loader2, Receipt, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { adminAPI } from '@/services/api';
import { formatPrice } from '@/lib/utils';

export default function ManageOrders() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [viewOrder, setViewOrder] = useState<any>(null);
    const [viewOpen, setViewOpen] = useState(false);

    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (statusFilter) params.set('status', statusFilter);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-orders', page, statusFilter],
        queryFn: () => adminAPI.getOrders(params.toString()),
    });

    const { data: revenueData } = useQuery({
        queryKey: ['revenue'],
        queryFn: adminAPI.getRevenueStats,
    });

    const orders = data?.data || [];
    const meta = data?.meta;

    const statusConfig: Record<string, { variant: 'success' | 'secondary' | 'destructive' | 'default'; label: string; color: string }> = {
        completed: { variant: 'success', label: 'Completed', color: 'text-emerald-600' },
        pending: { variant: 'secondary', label: 'Pending', color: 'text-amber-600' },
        failed: { variant: 'destructive', label: 'Failed', color: 'text-red-600' },
        refunded: { variant: 'secondary', label: 'Refunded', color: 'text-blue-600' },
    };

    const completedOrders = (orders as any[]).filter((o: any) => o.status === 'completed');
    const pageRevenue = completedOrders.reduce((sum: number, o: any) => sum + (o.amount || 0), 0);

    const summaryCards = [
        {
            title: 'Total Revenue',
            value: formatPrice(revenueData?.data?.totalRevenue || 0),
            icon: TrendingUp,
            color: 'text-emerald-600 bg-emerald-100',
        },
        {
            title: 'Page Revenue',
            value: formatPrice(pageRevenue),
            icon: CreditCard,
            color: 'text-blue-600 bg-blue-100',
        },
        {
            title: 'Orders on Page',
            value: (orders as any[]).length,
            icon: Receipt,
            color: 'text-purple-600 bg-purple-100',
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Manage Orders</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {meta ? `${meta.total} total orders` : 'Loading...'}
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {summaryCards.map((card, i) => (
                    <Card key={i}>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${card.color}`}>
                                <card.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">{card.title}</p>
                                <p className="text-lg font-bold">{card.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <select
                    className="h-10 rounded-lg border bg-background px-3 text-sm"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                >
                    <option value="">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                </select>
            </div>

            {/* Orders Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left text-sm font-medium">Order ID</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Course</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Provider</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                        <p className="text-sm text-muted-foreground mt-2">Loading orders...</p>
                                    </td>
                                </tr>
                            ) : (orders as any[]).length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <Receipt className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                                        <p className="text-muted-foreground">No orders found</p>
                                    </td>
                                </tr>
                            ) : (
                                (orders as any[]).map((order: any) => {
                                    const sc = statusConfig[order.status] || statusConfig.pending;
                                    return (
                                        <tr
                                            key={order._id}
                                            className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                                            onClick={() => { setViewOrder(order); setViewOpen(true); }}
                                        >
                                            <td className="px-4 py-3">
                                                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                                    #{order._id.slice(-8).toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {order.user ? (
                                                    <div>
                                                        <div className="font-medium">{order.user.name}</div>
                                                        <div className="text-xs text-muted-foreground">{order.user.email}</div>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm max-w-[200px]">
                                                <span className="line-clamp-1">
                                                    {order.course?.title || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-sm">
                                                {formatPrice(order.amount || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-sm capitalize">{order.provider}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={sc.variant}>{sc.label}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">Page {page} of {meta.totalPages}</span>
                    <Button variant="outline" size="icon" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Order Detail Dialog */}
            <Dialog open={viewOpen} onClose={() => setViewOpen(false)}>
                <DialogHeader onClose={() => setViewOpen(false)}>Order Details</DialogHeader>
                {viewOrder && (
                    <DialogContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-mono bg-muted px-3 py-1.5 rounded-lg">
                                #{viewOrder._id.slice(-8).toUpperCase()}
                            </span>
                            <Badge variant={(statusConfig[viewOrder.status] || statusConfig.pending).variant}>
                                {(statusConfig[viewOrder.status] || statusConfig.pending).label}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-xs text-muted-foreground">Amount</p>
                                <p className="text-lg font-bold">{formatPrice(viewOrder.amount || 0)}</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-xs text-muted-foreground">Provider</p>
                                <p className="text-lg font-bold capitalize">{viewOrder.provider}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-xs text-muted-foreground mb-1">Customer</p>
                                {viewOrder.user ? (
                                    <>
                                        <p className="font-medium">{viewOrder.user.name}</p>
                                        <p className="text-sm text-muted-foreground">{viewOrder.user.email}</p>
                                    </>
                                ) : <p className="text-sm">-</p>}
                            </div>

                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-xs text-muted-foreground mb-1">Course</p>
                                {viewOrder.course ? (
                                    <p className="font-medium">{viewOrder.course.title}</p>
                                ) : <p className="text-sm">-</p>}
                            </div>
                        </div>

                        {viewOrder.transactionId && (
                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-xs text-muted-foreground">Transaction ID</p>
                                <p className="text-sm font-mono">{viewOrder.transactionId}</p>
                            </div>
                        )}

                        <div className="text-xs text-muted-foreground pt-2 border-t">
                            Created: {new Date(viewOrder.createdAt).toLocaleString()}
                            {viewOrder.updatedAt && ` • Updated: ${new Date(viewOrder.updatedAt).toLocaleString()}`}
                        </div>
                    </DialogContent>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}