import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, Clock, Users, BookOpen, Play, CheckCircle, Heart, Share2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { courseAPI, reviewAPI, paymentAPI } from '@/services/endpoints';
import { useAuthStore } from '@/store/authStore';
import { formatPrice, calculateDiscount, formatDuration, getLevelColor } from '@/lib/utils';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { userAPI } from '@/services/endpoints';
import toast from 'react-hot-toast';

export default function CourseDetails() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user, setUser } = useAuthStore();
    const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'razorpay'>('razorpay');
    const { addItem, isInCart } = useCartStore();

    const { data: courseData, isLoading } = useQuery({
        queryKey: ['course', slug],
        queryFn: () => courseAPI.getBySlug(slug!),
        enabled: !!slug,
    });

    const { data: reviewsData } = useQuery({
        queryKey: ['reviews', courseData?.data?._id],
        queryFn: () => reviewAPI.getByCourse(courseData?.data?._id),
        enabled: !!courseData?.data?._id,
    });

    const course = courseData?.data;
    const reviews = reviewsData?.data || [];

    const categoryId = typeof course?.category === 'object' ? course?.category?._id : course?.category;
    const { data: relatedCoursesData } = useQuery({
        queryKey: ['courses', 'related', categoryId],
        queryFn: () => courseAPI.getAll({ category: categoryId, limit: 5 }),
        enabled: !!categoryId,
    });
    const relatedCourses = (relatedCoursesData?.data?.courses || relatedCoursesData?.data || []).filter((c: any) => c._id !== course?._id).slice(0, 3);

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!course) return;
        try {
            const result = await paymentAPI.createOrder(course._id, paymentProvider);
            if (result.data?.isFree) {
                navigate('/dashboard');
                return;
            }
            if (paymentProvider === 'razorpay' && result.data?.razorpayOrderId) {
                const options = {
                    key: result.data.razorpayKey,
                    amount: result.data.amount,
                    currency: result.data.currency,
                    name: 'LearnHub',
                    description: course.title,
                    order_id: result.data.razorpayOrderId,
                    handler: async (response: any) => {
                        await paymentAPI.verifyPayment({
                            provider: 'razorpay',
                            orderId: result.data.orderId,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });
                        navigate('/dashboard');
                    },
                };
                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            }
        } catch (error) {
            console.error('Payment error:', error);
        }
    };

    const handleAddToCart = () => {
        if (!course) return;
        if (isInCart(course._id)) {
            toast('Course is already in your cart', { icon: 'ℹ️' });
            return;
        }
        addItem({
            _id: course._id,
            title: course.title,
            price: course.price,
            discountPrice: course.discountPrice,
            thumbnail: course.thumbnail,
            instructor: course.instructor,
            level: course.level
        });
        toast.success('Added to cart!');
    };

    const handleWishlist = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to add to wishlist');
            navigate('/login');
            return;
        }
        if (!course) return;

        try {
            const isWishlisted = user?.wishlist?.includes(course._id);
            if (isWishlisted) {
                await userAPI.removeFromWishlist(course._id);
                if (user) setUser({ ...user, wishlist: user.wishlist.filter((id: string) => id !== course._id) } as any);
                toast.success('Removed from wishlist');
            } else {
                await userAPI.addToWishlist(course._id);
                if (user) setUser({ ...user, wishlist: [...(user.wishlist || []), course._id] } as any);
                toast.success('Added to wishlist!');
            }
        } catch (error) {
            toast.error('Failed to update wishlist');
        }
    };

    if (isLoading) {
        return (
            <div className="section-padding">
                <div className="container-max">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-64 w-full rounded-xl" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                        <Skeleton className="h-96 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="section-padding text-center">
                <h2 className="text-2xl font-bold">Course not found</h2>
                <Button className="mt-4" onClick={() => navigate('/courses')}>Browse Courses</Button>
            </div>
        );
    }

    const price = course.discountPrice ?? course.price;

    return (
        <div>
            {/* Hero */}
            <section className="relative overflow-hidden bg-muted/30 border-b py-16 lg:py-24">
                {/* Background Design Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] rounded-full bg-primary/10 blur-[100px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[50%] rounded-full bg-secondary/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                </div>

                <div className="container-max relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                        <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="flex flex-wrap gap-2">
                                <Badge className={`${getLevelColor(course.level)} px-3 py-1 text-sm shadow-sm`}>{course.level}</Badge>
                                {course.isFree && <Badge variant="success" className="px-3 py-1 text-sm shadow-sm">Free</Badge>}
                                <Badge variant="secondary" className="px-3 py-1 text-sm shadow-sm bg-background border-muted">
                                    {typeof course.category === 'object' ? course.category.name : ''}
                                </Badge>
                            </div>

                            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                                {course.title}
                            </h1>

                            <p className="text-muted-foreground text-xl leading-relaxed max-w-3xl">
                                {course.shortDescription}
                            </p>

                            <div className="flex flex-wrap items-center gap-6 text-sm text-foreground bg-background/60 backdrop-blur-md p-5 rounded-xl border shadow-sm w-fit">
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                                    <span className="font-bold text-base">{course.rating}</span>
                                    <span className="text-muted-foreground">({course.reviewCount} reviews)</span>
                                </div>
                                <div className="w-px h-6 bg-border hidden sm:block"></div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="h-5 w-5 text-primary" />
                                    <span><strong className="text-foreground">{course.enrollmentCount}</strong> students</span>
                                </div>
                                <div className="w-px h-6 bg-border hidden sm:block"></div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-5 w-5 text-primary" />
                                    <span>{formatDuration(course.totalDuration)}</span>
                                </div>
                                <div className="w-px h-6 bg-border hidden sm:block"></div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    <span>{course.totalLessons} lessons</span>
                                </div>
                            </div>

                            {typeof course.instructor === 'object' && (
                                <div className="flex items-center gap-4 pt-4">
                                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-background">
                                        {course.instructor.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground mb-0.5">Created by</div>
                                        <div className="font-bold text-lg">{course.instructor.name}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pricing Card */}
                        <div className="animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
                            <Card className="h-fit sticky top-24 border-2 shadow-2xl shadow-primary/5 overflow-hidden group">
                                <div className="relative h-56 overflow-hidden bg-muted">
                                    <img
                                        src={course.thumbnail || `https://picsum.photos/seed/${course._id}/600/300`}
                                        alt={course.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                                        <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center shadow-xl backdrop-blur-md cursor-pointer hover:scale-110 hover:bg-primary transition-all">
                                            <Play className="h-8 w-8 text-white ml-1" />
                                        </div>
                                    </div>
                                </div>
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-4xl font-extrabold text-primary">
                                            {course.isFree ? 'Free' : formatPrice(price)}
                                        </span>
                                        {course.discountPrice !== undefined && course.discountPrice < course.price && (
                                            <>
                                                <span className="text-xl text-muted-foreground line-through decoration-muted-foreground/50">{formatPrice(course.price)}</span>
                                                <Badge className="bg-red-500 hover:bg-red-600 text-white shadow-sm ml-auto animate-pulse">
                                                    {calculateDiscount(course.price, course.discountPrice)}% OFF
                                                </Badge>
                                            </>
                                        )}
                                    </div>

                                    <Button size="xl" className="w-full text-lg h-14 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5" onClick={handleAddToCart}>
                                        {isInCart(course._id) ? 'In Cart' : course.isFree ? 'Add to Cart for Free' : 'Add to Cart'}
                                    </Button>

                                    <Button size="lg" variant="outline" className="w-full h-12" onClick={handleWishlist}>
                                        <Heart className={`mr-2 h-5 w-5 ${user?.wishlist?.includes(course?._id) ? 'fill-red-500 text-red-500' : ''}`} />
                                        {user?.wishlist?.includes(course?._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                    </Button>

                                    <p className="text-sm text-center text-muted-foreground font-medium">
                                        30-day money-back guarantee
                                    </p>

                                    <div className="space-y-3 pt-4 border-t">
                                        <h4 className="font-bold text-foreground">This course includes:</h4>
                                        {[
                                            `${course.totalDuration} hours of content`,
                                            `${course.totalLessons} interactive lessons`,
                                            'Certificate of completion',
                                            'Lifetime full access',
                                            'Access on mobile and TV',
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Course Content */}
            <section className="section-padding">
                <div className="container-max max-w-3xl">
                    {/* Course Description */}
                    {course.description && (
                        <div className="mb-10">
                            <h2 className="font-heading text-2xl font-bold mb-6">About This Course</h2>
                            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                {course.description}
                            </div>
                        </div>
                    )}

                    {/* What You'll Learn */}
                    {course.learningOutcomes?.length > 0 && (
                        <div className="mb-10">
                            <h2 className="font-heading text-2xl font-bold mb-6">What You'll Learn</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {course.learningOutcomes.map((outcome: string, i: number) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">{outcome}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Syllabus */}
                    {course.sections?.length > 0 && (
                        <div className="mb-10">
                            <h2 className="font-heading text-2xl font-bold mb-6">Course Syllabus</h2>
                            <div className="space-y-3">
                                {course.sections.map((section: any, si: number) => (
                                    <Card key={si}>
                                        <div className="p-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold">{section.title}</h3>
                                                <span className="text-xs text-muted-foreground">
                                                    {section.lessons.length} lessons
                                                </span>
                                            </div>
                                            <div className="mt-3 space-y-2">
                                                {section.lessons.map((lesson: any, li: number) => (
                                                    <div key={li} className="flex items-center gap-3 py-2 text-sm text-muted-foreground">
                                                        <Play className="h-4 w-4 flex-shrink-0" />
                                                        <span className="flex-1">{lesson.title}</span>
                                                        <span className="text-xs">{formatDuration(lesson.duration)}</span>
                                                        {lesson.isFree && <Badge variant="success" className="text-[10px] px-1.5 py-0">Free</Badge>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Requirements */}
                    {course.requirements?.length > 0 && (
                        <div className="mb-10">
                            <h2 className="font-heading text-2xl font-bold mb-6">Prerequisites</h2>
                            <ul className="space-y-2">
                                {course.requirements.map((req: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Reviews */}
                    <div>
                        <h2 className="font-heading text-2xl font-bold mb-6">Student Reviews</h2>
                        {reviews.length === 0 ? (
                            <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((review: any) => (
                                    <Card key={review._id} className="p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-semibold text-xs">
                                                {typeof review.user === 'object' ? review.user.name?.charAt(0) : 'U'}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">
                                                    {typeof review.user === 'object' ? review.user.name : 'User'}
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {Array.from({ length: review.rating }).map((_, j) => (
                                                        <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Related Courses */}
                    {relatedCourses.length > 0 && (
                        <div className="mt-10 pt-10 border-t">
                            <h2 className="font-heading text-2xl font-bold mb-6">Related Courses</h2>
                            <div className="flex flex-wrap gap-6">
                                {relatedCourses.map((related: any) => (
                                    <Link key={related._id} to={`/courses/${related.slug}`} onClick={() => window.scrollTo(0, 0)} className="w-full sm:w-[350px]">
                                        <Card className="overflow-hidden group h-full hover:border-primary/30">
                                            <div className="relative h-60 overflow-hidden">
                                                <img
                                                    src={related.thumbnail || `https://picsum.photos/seed/${related._id}/400/250`}
                                                    alt={related.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute top-3 left-3 flex gap-2">
                                                    <Badge className={getLevelColor(related.level)}>{related.level}</Badge>
                                                    {related.isFree && <Badge variant="success">Free</Badge>}
                                                </div>
                                            </div>
                                            <CardContent className="p-4">
                                                <div className="text-xs text-muted-foreground mb-2">
                                                    {typeof related.category === 'object' ? related.category.name : 'Course'}
                                                </div>
                                                <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                    {related.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(related.totalDuration)}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{related.rating}</span>
                                                </div>
                                                <div className="font-bold">
                                                    {related.isFree ? (
                                                        <span className="text-emerald-600">Free</span>
                                                    ) : formatPrice(related.discountPrice ?? related.price)}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}