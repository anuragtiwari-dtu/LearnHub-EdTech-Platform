import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { userAPI } from '@/services/endpoints';
import { formatPrice, formatDuration, getLevelColor } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export default function DashboardWishlist() {
    const { user, setUser } = useAuthStore();
    const queryClient = useQueryClient();

    const { data: wishlistData, isLoading } = useQuery({
        queryKey: ['wishlist'],
        queryFn: userAPI.getWishlist,
    });

    const removeMutation = useMutation({
        mutationFn: (courseId: string) => userAPI.removeFromWishlist(courseId),
        onSuccess: (_, courseId) => {
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
            if (user) {
                setUser({ ...user, wishlist: user.wishlist?.filter((id: string) => id !== courseId) } as any);
            }
        },
    });

    const wishlist = wishlistData?.data || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
                    <Heart className="h-6 w-6 text-primary" /> My Wishlist
                </h1>
                <span className="text-sm text-muted-foreground">{wishlist.length} courses</span>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}><CardContent className="p-4"><div className="h-24 bg-muted animate-pulse rounded" /></CardContent></Card>
                    ))}
                </div>
            ) : wishlist.length === 0 ? (
                <Card className="p-12 text-center">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="font-semibold text-lg mb-2">Your wishlist is empty</h2>
                    <p className="text-sm text-muted-foreground mb-4">Save courses you're interested in to easily find them later</p>
                    <Link to="/courses"><Button>Browse Courses</Button></Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wishlist.map((course: any) => (
                        <Card key={course._id} className="overflow-hidden group hover:border-primary/30">
                            <CardContent className="p-0 flex">
                                <Link to={`/courses/${course.slug}`} className="flex-shrink-0">
                                    <img
                                        src={course.thumbnail || `https://picsum.photos/seed/${course._id}/200/150`}
                                        alt={course.title}
                                        className="w-36 h-full object-cover"
                                    />
                                </Link>
                                <div className="flex-1 p-4 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge className={`text-[10px] px-1.5 py-0 ${getLevelColor(course.level)}`}>{course.level}</Badge>
                                            {course.isFree && <Badge variant="success" className="text-[10px] px-1.5 py-0">Free</Badge>}
                                        </div>
                                        <Link to={`/courses/${course.slug}`}>
                                            <h3 className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2">{course.title}</h3>
                                        </Link>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(course.totalDuration)}</span>
                                            <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{course.rating}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="font-bold text-sm">
                                            {course.isFree ? 'Free' : formatPrice(course.discountPrice ?? course.price)}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => removeMutation.mutate(course._id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}