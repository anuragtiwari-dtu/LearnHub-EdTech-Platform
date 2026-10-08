import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Grid3X3, List, ChevronLeft, ChevronRight, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { courseAPI, categoryAPI } from '@/services/endpoints';
import { formatPrice, calculateDiscount, formatDuration, getLevelColor } from '@/lib/utils';

export default function Courses() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);

    const page = Number(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const level = searchParams.get('level') || '';
    const sort = searchParams.get('sort') || 'newest';
    const isFree = searchParams.get('isFree') || '';

    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryAPI.getAll,
    });

    const { data: coursesData, isLoading } = useQuery({
        queryKey: ['courses', page, search, category, level, sort, isFree],
        queryFn: () => courseAPI.getAll({ page, limit: 12, search, category, level, sort, isFree: isFree || undefined }),
    });

    const courses = coursesData?.data || [];
    const meta = coursesData?.meta;
    const categories = categoriesData?.data || [];

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) params.set(key, value);
        else params.delete(key);
        if (key !== 'page') params.delete('page');
        setSearchParams(params);
    };

    return (
        <div className="py-4">
            <div className="container-max">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
                        Explore <span className="gradient-text">Courses</span>
                    </h1>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search courses..."
                                className="pl-10"
                                value={search}
                                onChange={(e) => updateFilter('search', e.target.value)}
                            />
                        </div>
                        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                            <Filter className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <Card className="mb-8 p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Category</label>
                                <select
                                    className="w-full h-10 rounded-lg border bg-background px-3 text-sm"
                                    value={category}
                                    onChange={(e) => updateFilter('category', e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((cat: any) => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Level</label>
                                <select
                                    className="w-full h-10 rounded-lg border bg-background px-3 text-sm"
                                    value={level}
                                    onChange={(e) => updateFilter('level', e.target.value)}
                                >
                                    <option value="">All Levels</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Price</label>
                                <select
                                    className="w-full h-10 rounded-lg border bg-background px-3 text-sm"
                                    value={isFree}
                                    onChange={(e) => updateFilter('isFree', e.target.value)}
                                >
                                    <option value="">All Prices</option>
                                    <option value="true">Free</option>
                                    <option value="false">Paid</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Sort By</label>
                                <select
                                    className="w-full h-10 rounded-lg border bg-background px-3 text-sm"
                                    value={sort}
                                    onChange={(e) => updateFilter('sort', e.target.value)}
                                >
                                    <option value="newest">Newest</option>
                                    <option value="popular">Most Popular</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                </select>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Category Quick Tabs - Horizontal Scroll on Mobile */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide snap-x md:flex-wrap md:overflow-visible md:snap-none">
                    <Button
                        variant={category === '' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateFilter('category', '')}
                        className="rounded-full flex-shrink-0 snap-start h-8 text-xs sm:h-9 sm:text-sm"
                    >
                        All Courses
                    </Button>
                    {categories.map((cat: any) => (
                        <Button
                            key={cat._id}
                            variant={category === cat._id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateFilter('category', cat._id)}
                            className="rounded-full flex-shrink-0 snap-start h-8 text-xs sm:h-9 sm:text-sm"
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>

                {/* Course Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Card key={i} className="overflow-hidden">
                                <Skeleton className="h-32 sm:h-48 w-full" />
                                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                                    <Skeleton className="h-3 w-12 sm:h-4 sm:w-20" />
                                    <Skeleton className="h-4 w-3/4 sm:h-5" />
                                    <Skeleton className="h-3 w-full sm:h-4" />
                                    <Skeleton className="h-4 w-12 sm:h-5 sm:w-16" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-muted-foreground mb-4">No courses found</p>
                        <Button variant="outline" onClick={() => setSearchParams({})}>Clear Filters</Button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                            {courses.map((course: any) => (
                                <Link key={course._id} to={`/courses/${course.slug}`}>
                                    <Card className="overflow-hidden group h-full hover:border-primary/30 transition-all duration-300">
                                        <div className="relative h-32 sm:h-48 overflow-hidden">
                                            <img
                                                src={course.thumbnail || `https://picsum.photos/seed/${course._id}/400/250`}
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1">
                                                <Badge className={`${getLevelColor(course.level)} text-[10px] sm:text-xs h-5 sm:h-6 px-1.5 sm:px-2.5`}>{course.level}</Badge>
                                                {course.isFree && <Badge variant="success" className="text-[10px] sm:text-xs h-5 sm:h-6 px-1.5 sm:px-2.5">Free</Badge>}
                                            </div>
                                        </div>
                                        <CardContent className="p-3 sm:p-4">
                                            <div className="text-[10px] sm:text-xs text-muted-foreground mb-1 sm:mb-2 truncate">
                                                {typeof course.category === 'object' ? course.category.name : ''}
                                            </div>
                                            <h3 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2 group-hover:text-primary transition-colors h-8 sm:h-10">
                                                {course.title}
                                            </h3>
                                            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">
                                                <span className="flex items-center gap-0.5 sm:gap-1"><Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />{formatDuration(course.totalDuration)}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-0.5 sm:gap-1"><Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-amber-400 text-amber-400" />{course.rating}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="font-bold text-xs sm:text-base">
                                                    {course.isFree ? (
                                                        <span className="text-emerald-600">Free</span>
                                                    ) : (
                                                        <div className="flex flex-col sm:flex-row sm:items-center">
                                                            <span>{formatPrice(course.discountPrice ?? course.price)}</span>
                                                            {course.discountPrice !== undefined && course.discountPrice < course.price && (
                                                                <span className="text-[10px] sm:text-sm text-muted-foreground line-through sm:ml-2">{formatPrice(course.price)}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {meta && meta.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={page <= 1}
                                    onClick={() => updateFilter('page', String(page - 1))}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                                    <Button
                                        key={p}
                                        variant={p === page ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => updateFilter('page', String(p))}
                                    >
                                        {p}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={page >= meta.totalPages}
                                    onClick={() => updateFilter('page', String(page + 1))}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}