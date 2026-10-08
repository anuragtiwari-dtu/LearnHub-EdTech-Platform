import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, Check, Loader2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { adminAPI } from '@/services/api';

const ICONS = ['📚', '💻', '🎨', '📊', '🔬', '🎵', '📱', '🌐', '🤖', '⚡', '🔧', '📈', '🎯', '🧠', '✏️', '🎓'];

export default function ManageCategories() {
    const queryClient = useQueryClient();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', description: '', icon: '📚' });
    const [error, setError] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: adminAPI.getCategories,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => adminAPI.createCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            closeDialog();
        },
        onError: (err: any) => setError(err.response?.data?.message || 'Failed to create category'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => adminAPI.updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            closeDialog();
        },
        onError: (err: any) => setError(err.response?.data?.message || 'Failed to update category'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminAPI.deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });

    const categories = data?.data || [];

    const closeDialog = () => {
        setDialogOpen(false);
        setEditingId(null);
        setForm({ name: '', description: '', icon: '📚' });
        setError('');
    };

    const openCreate = () => {
        setEditingId(null);
        setForm({ name: '', description: '', icon: '📚' });
        setError('');
        setDialogOpen(true);
    };

    const openEdit = (cat: any) => {
        setEditingId(cat._id);
        setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '📚' });
        setError('');
        setDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (editingId) {
            updateMutation.mutate({ id: editingId, data: form });
        } else {
            createMutation.mutate(form);
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Manage Categories</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {(categories as any[]).length} categories
                    </p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Add Category
                </Button>
            </div>

            {/* Categories Grid */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : (categories as any[]).length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Tag className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground mb-3">No categories yet</p>
                        <Button onClick={openCreate}>
                            <Plus className="mr-1 h-4 w-4" /> Create your first category
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(categories as any[]).map((cat: any) => (
                        <Card key={cat._id} className="group hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                                            {cat.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{cat.name}</h3>
                                            <p className="text-xs text-muted-foreground">{cat.slug}</p>
                                        </div>
                                    </div>
                                    <Badge variant={cat.isActive ? 'success' : 'secondary'} className="text-xs">
                                        {cat.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>

                                {cat.description && (
                                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{cat.description}</p>
                                )}

                                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                                    <span className="text-sm text-muted-foreground">
                                        {cat.courseCount || 0} courses
                                    </span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive"
                                            disabled={deleteMutation.isPending}
                                            onClick={() => {
                                                if (cat.courseCount > 0) {
                                                    alert(`Cannot delete "${cat.name}" — it has ${cat.courseCount} courses. Remove courses first.`);
                                                    return;
                                                }
                                                if (confirm(`Delete category "${cat.name}"?`))
                                                    deleteMutation.mutate(cat._id);
                                            }}
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

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={closeDialog}>
                <DialogHeader onClose={closeDialog}>
                    {editingId ? 'Edit Category' : 'Create New Category'}
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <DialogContent className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
                        )}

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Name *</label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Web Development"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Description</label>
                            <Textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Brief description of this category..."
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Icon</label>
                            <div className="flex flex-wrap gap-2">
                                {ICONS.map((icon) => (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => setForm({ ...form, icon })}
                                        className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                                            form.icon === icon
                                                ? 'bg-primary/20 ring-2 ring-primary scale-110'
                                                : 'bg-muted hover:bg-muted/80'
                                        }`}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2">
                                <Input
                                    value={form.icon}
                                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                                    placeholder="Or type a custom emoji"
                                    className="w-32 text-center"
                                />
                            </div>
                        </div>
                    </DialogContent>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingId ? 'Update Category' : 'Create Category'}
                        </Button>
                    </DialogFooter>
                </form>
            </Dialog>
        </div>
    );
}