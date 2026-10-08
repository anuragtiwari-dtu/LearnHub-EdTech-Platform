import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Eye, Search, ChevronLeft, ChevronRight, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { adminAPI } from '@/services/api';
import { formatPrice } from '@/lib/utils';

interface CourseForm {
    title: string;
    description: string;
    shortDescription: string;
    thumbnail: string;
    category: string;
    level: string;
    price: number;
    discountPrice: number;
    isFree: boolean;
    status: string;
    language: string;
    tags: string;
    requirements: string;
    learningOutcomes: string;
}

const defaultForm: CourseForm = {
    title: '',
    description: '',
    shortDescription: '',
    thumbnail: '',
    category: '',
    level: 'beginner',
    price: 0,
    discountPrice: 0,
    isFree: false,
    status: 'draft',
    language: 'English',
    tags: '',
    requirements: '',
    learningOutcomes: '',
};

export default function ManageCourses() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<CourseForm>(defaultForm);
    const [viewCourse, setViewCourse] = useState<any>(null);
    const [error, setError] = useState('');
    const queryClient = useQueryClient();

    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (statusFilter) params.set('status', statusFilter);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-courses', page, statusFilter],
        queryFn: () => adminAPI.getCourses(params.toString()),
    });

    const { data: catData } = useQuery({
        queryKey: ['categories'],
        queryFn: adminAPI.getPublicCategories,
    });

    const createMutation = useMutation({
        mutationFn: (courseData: any) => adminAPI.createCourse(courseData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            closeDialog();
        },
        onError: (err: any) => setError(err.response?.data?.message || 'Failed to create course'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => adminAPI.updateCourse(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            closeDialog();
        },
        onError: (err: any) => setError(err.response?.data?.message || 'Failed to update course'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminAPI.deleteCourse(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });

    const courses = data?.data || [];
    const meta = data?.meta;
    const categories = catData?.data || [];

    const filteredCourses = search
        ? (courses as any[]).filter((c: any) =>
            c.title.toLowerCase().includes(search.toLowerCase())
        )
        : courses;

    const closeDialog = () => {
        setDialogOpen(false);
        setEditingId(null);
        setForm(defaultForm);
        setError('');
    };

    const openCreate = () => {
        setEditingId(null);
        setForm(defaultForm);
        setError('');
        setDialogOpen(true);
    };

    const openEdit = (course: any) => {
        setEditingId(course._id);
        setForm({
            title: course.title || '',
            description: course.description || '',
            shortDescription: course.shortDescription || '',
            thumbnail: course.thumbnail || '',
            category: typeof course.category === 'object' ? course.category._id : course.category || '',
            level: course.level || 'beginner',
            price: course.price || 0,
            discountPrice: course.discountPrice || 0,
            isFree: course.isFree || false,
            status: course.status || 'draft',
            language: course.language || 'English',
            tags: (course.tags || []).join(', '),
            requirements: (course.requirements || []).join('\n'),
            learningOutcomes: (course.learningOutcomes || []).join('\n'),
        });
        setError('');
        setDialogOpen(true);
    };

    const openView = (course: any) => {
        setViewCourse(course);
        setViewDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const courseData: any = {
            title: form.title,
            description: form.description,
            shortDescription: form.shortDescription,
            thumbnail: form.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
            category: form.category,
            level: form.level,
            price: form.isFree ? 0 : Number(form.price),
            discountPrice: form.isFree ? 0 : Number(form.discountPrice) || undefined,
            isFree: form.isFree,
            status: form.status,
            language: form.language,
            tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
            requirements: form.requirements.split('\n').map((r) => r.trim()).filter(Boolean),
            learningOutcomes: form.learningOutcomes.split('\n').map((o) => o.trim()).filter(Boolean),
        };

        if (editingId) {
            updateMutation.mutate({ id: editingId, data: courseData });
        } else {
            createMutation.mutate(courseData);
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Manage Courses</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {meta ? `${meta.total} total courses` : 'Loading...'}
                    </p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Add Course
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-10"
                        placeholder="Search courses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="h-10 rounded-lg border bg-background px-3 text-sm"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                </select>
            </div>

            {/* Courses Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left text-sm font-medium">Course</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Enrollments</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                        <p className="text-sm text-muted-foreground mt-2">Loading courses...</p>
                                    </td>
                                </tr>
                            ) : (filteredCourses as any[]).length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center">
                                        <p className="text-muted-foreground">No courses found</p>
                                        <Button variant="outline" size="sm" className="mt-3" onClick={openCreate}>
                                            <Plus className="mr-1 h-3 w-3" /> Create your first course
                                        </Button>
                                    </td>
                                </tr>
                            ) : (
                                (filteredCourses as any[]).map((course: any) => (
                                    <tr key={course._id} className="border-b hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={course.thumbnail || `https://picsum.photos/seed/${course._id}/60/40`}
                                                    alt=""
                                                    className="h-10 w-14 rounded object-cover flex-shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <div className="font-medium text-sm line-clamp-1">{course.title}</div>
                                                    <div className="text-xs text-muted-foreground capitalize">{course.level} • {course.language || 'English'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {typeof course.category === 'object' ? course.category?.name : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium">
                                            {course.isFree ? (
                                                <Badge variant="success">Free</Badge>
                                            ) : (
                                                <div>
                                                    {course.discountPrice ? (
                                                        <>
                                                            <span>{formatPrice(course.discountPrice)}</span>
                                                            <span className="text-xs text-muted-foreground line-through ml-1">
                                                                {formatPrice(course.price)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        formatPrice(course.price)
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">{course.enrollmentCount || 0}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={course.status === 'published' ? 'success' : 'secondary'}>
                                                {course.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" title="View details" onClick={() => openView(course)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => openEdit(course)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive"
                                                    title="Delete"
                                                    disabled={deleteMutation.isPending}
                                                    onClick={() => {
                                                        if (confirm(`Delete "${course.title}"? This action cannot be undone.`))
                                                            deleteMutation.mutate(course._id);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
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
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {meta.totalPages}
                    </span>
                    <Button variant="outline" size="icon" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={closeDialog}>
                <DialogHeader onClose={closeDialog}>
                    {editingId ? 'Edit Course' : 'Create New Course'}
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <DialogContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
                        )}

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Title *</label>
                            <Input
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. Complete Web Development Bootcamp"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Short Description</label>
                            <Input
                                value={form.shortDescription}
                                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                                placeholder="Brief summary shown in course cards"
                                maxLength={300}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Description *</label>
                            <Textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Detailed course description..."
                                rows={4}
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Thumbnail URL</label>
                            <Input
                                value={form.thumbnail}
                                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                            />
                            {form.thumbnail && (
                                <img src={form.thumbnail} alt="preview" className="mt-2 h-20 w-32 object-cover rounded" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Category *</label>
                                <select
                                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    required
                                >
                                    <option value="">Select category</option>
                                    {(categories as any[]).map((cat: any) => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Level</label>
                                <select
                                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                                    value={form.level}
                                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Status</label>
                                <select
                                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Language</label>
                                <Input
                                    value={form.language}
                                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                                    placeholder="English"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isFree}
                                    onChange={(e) => setForm({ ...form, isFree: e.target.checked, price: e.target.checked ? 0 : form.price })}
                                    className="h-4 w-4 rounded border-input accent-primary"
                                />
                                <span className="text-sm font-medium">Free Course</span>
                            </label>
                        </div>

                        {!form.isFree && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Price ($) *</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                                        required={!form.isFree}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Discount Price ($)</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.discountPrice || ''}
                                        onChange={(e) => setForm({ ...form, discountPrice: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Tags</label>
                            <Input
                                value={form.tags}
                                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                placeholder="react, javascript, web development (comma separated)"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Requirements</label>
                            <Textarea
                                value={form.requirements}
                                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                                placeholder="One requirement per line"
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Learning Outcomes</label>
                            <Textarea
                                value={form.learningOutcomes}
                                onChange={(e) => setForm({ ...form, learningOutcomes: e.target.value })}
                                placeholder="One outcome per line"
                                rows={3}
                            />
                        </div>
                    </DialogContent>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingId ? 'Update Course' : 'Create Course'}
                        </Button>
                    </DialogFooter>
                </form>
            </Dialog>

            {/* View Course Dialog */}
            <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)}>
                <DialogHeader onClose={() => setViewDialogOpen(false)}>Course Details</DialogHeader>
                {viewCourse && (
                    <DialogContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                        <div className="flex gap-4">
                            <img
                                src={viewCourse.thumbnail || `https://picsum.photos/seed/${viewCourse._id}/200/120`}
                                alt={viewCourse.title}
                                className="h-24 w-36 rounded-lg object-cover flex-shrink-0"
                            />
                            <div>
                                <h3 className="font-semibold text-lg">{viewCourse.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={viewCourse.status === 'published' ? 'success' : 'secondary'}>
                                        {viewCourse.status}
                                    </Badge>
                                    <Badge variant="secondary" className="capitalize">{viewCourse.level}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                                <p className="text-xs text-muted-foreground">Price</p>
                                <p className="font-semibold">{viewCourse.isFree ? 'Free' : formatPrice(viewCourse.price)}</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                                <p className="text-xs text-muted-foreground">Enrollments</p>
                                <p className="font-semibold">{viewCourse.enrollmentCount || 0}</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                                <p className="text-xs text-muted-foreground">Rating</p>
                                <p className="font-semibold">{viewCourse.rating?.toFixed(1) || '0.0'} ⭐</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                                <p className="text-xs text-muted-foreground">Lessons</p>
                                <p className="font-semibold">{viewCourse.totalLessons || 0}</p>
                            </div>
                        </div>

                        {viewCourse.shortDescription && (
                            <div>
                                <p className="text-sm font-medium mb-1">Short Description</p>
                                <p className="text-sm text-muted-foreground">{viewCourse.shortDescription}</p>
                            </div>
                        )}

                        <div>
                            <p className="text-sm font-medium mb-1">Full Description</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewCourse.description}</p>
                        </div>

                        {viewCourse.tags?.length > 0 && (
                            <div>
                                <p className="text-sm font-medium mb-1">Tags</p>
                                <div className="flex flex-wrap gap-1">
                                    {viewCourse.tags.map((tag: string, i: number) => (
                                        <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {viewCourse.requirements?.length > 0 && (
                            <div>
                                <p className="text-sm font-medium mb-1">Requirements</p>
                                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-0.5">
                                    {viewCourse.requirements.map((r: string, i: number) => (
                                        <li key={i}>{r}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {viewCourse.learningOutcomes?.length > 0 && (
                            <div>
                                <p className="text-sm font-medium mb-1">Learning Outcomes</p>
                                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-0.5">
                                    {viewCourse.learningOutcomes.map((o: string, i: number) => (
                                        <li key={i}>{o}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="text-xs text-muted-foreground pt-2 border-t">
                            Created: {new Date(viewCourse.createdAt).toLocaleString()} •
                            Updated: {new Date(viewCourse.updatedAt).toLocaleString()}
                        </div>
                    </DialogContent>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
                    <Button onClick={() => { setViewDialogOpen(false); openEdit(viewCourse); }}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}