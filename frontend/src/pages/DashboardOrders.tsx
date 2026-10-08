import { useQuery } from '@tanstack/react-query';
import { CreditCard, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { paymentAPI } from '@/services/endpoints';
import { formatPrice } from '@/lib/utils';

export default function DashboardOrders() {
    const { data: ordersData, isLoading } = useQuery({
        queryKey: ['user-orders-full'],
        queryFn: () => paymentAPI.getOrders({ page: 1, limit: 50 }),
    });

    const orders = ordersData?.data || [];

    const statusConfig: Record<string, { variant: 'success' | 'secondary' | 'destructive'; label: string }> = {
        completed: { variant: 'success', label: 'Completed' },
        pending: { variant: 'secondary', label: 'Pending' },
        failed: { variant: 'destructive', label: 'Failed' },
        refunded: { variant: 'secondary', label: 'Refunded' },
    };

    return (
        <div className="space-y-6">
            <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-primary" /> Purchase History
            </h1>

            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Card key={i}><CardContent className="p-4"><div className="h-16 bg-muted animate-pulse rounded" /></CardContent></Card>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <Card className="p-12 text-center">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="font-semibold text-lg mb-2">No purchases yet</h2>
                    <p className="text-sm text-muted-foreground">Your purchase history will appear here</p>
                </Card>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-4 py-3 text-left text-sm font-medium">Course</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Provider</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order: any) => {
                                    const sc = statusConfig[order.status] || statusConfig.pending;
                                    return (
                                        <tr key={order._id} className="border-b hover:bg-muted/30">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {typeof order.course === 'object' && (
                                                        <img src={order.course.thumbnail || ''} alt="" className="h-10 w-14 rounded object-cover" />
                                                    )}
                                                    <span className="font-medium text-sm">
                                                        {typeof order.course === 'object' ? order.course.title : 'Course'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-sm">{formatPrice(order.amount)}</td>
                                            <td className="px-4 py-3 text-sm capitalize">{order.provider}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={sc.variant}>{sc.label}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    year: 'numeric', month: 'short', day: 'numeric',
                                                })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}