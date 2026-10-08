import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Shield, ShieldOff, Trash2, ChevronLeft, ChevronRight, Loader2, UserCircle, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { adminAPI } from '@/services/api';

export default function ManageUsers() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [viewUser, setViewUser] = useState<any>(null);
    const [viewOpen, setViewOpen] = useState(false);
    const queryClient = useQueryClient();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (roleFilter) params.set('role', roleFilter);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', page, debouncedSearch, roleFilter],
        queryFn: () => adminAPI.getUsers(params.toString()),
    });

    const roleMutation = useMutation({
        mutationFn: ({ id, role }: { id: string; role: string }) => adminAPI.updateUserRole(id, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminAPI.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            setViewOpen(false);
        },
    });

    const users = data?.data || [];
    const meta = data?.meta;

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    };

    const getAvatarColor = (name: string) => {
        const colors = [
            'from-orange-500 to-amber-400',
            'from-blue-500 to-cyan-400',
            'from-emerald-500 to-teal-400',
            'from-purple-500 to-pink-400',
            'from-rose-500 to-red-400',
            'from-indigo-500 to-violet-400',
        ];
        const index = (name?.charCodeAt(0) || 0) % colors.length;
        return colors[index];
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Manage Users</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {meta ? `${meta.total} total users` : 'Loading...'}
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-10"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="h-10 rounded-lg border bg-background px-3 text-sm"
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                >
                    <option value="">All Roles</option>
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            {/* Users Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Provider</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Joined</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                        <p className="text-sm text-muted-foreground mt-2">Loading users...</p>
                                    </td>
                                </tr>
                            ) : (users as any[]).length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                (users as any[]).map((user: any) => (
                                    <tr
                                        key={user._id}
                                        className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                                        onClick={() => { setViewUser(user); setViewOpen(true); }}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${getAvatarColor(user.name)} flex items-center justify-center text-white font-semibold text-xs`}>
                                                    {getInitials(user.name)}
                                                </div>
                                                <span className="font-medium text-sm">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm capitalize">{user.authProvider || 'email'}</td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    disabled={roleMutation.isPending}
                                                    onClick={() => {
                                                        const newRole = user.role === 'admin' ? 'student' : 'admin';
                                                        if (confirm(`Change ${user.name}'s role to ${newRole}?`))
                                                            roleMutation.mutate({ id: user._id, role: newRole });
                                                    }}
                                                    title={user.role === 'admin' ? 'Remove admin' : 'Make admin'}
                                                >
                                                    {user.role === 'admin'
                                                        ? <ShieldOff className="h-4 w-4" />
                                                        : <Shield className="h-4 w-4" />
                                                    }
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive"
                                                    disabled={deleteMutation.isPending}
                                                    onClick={() => {
                                                        if (confirm(`Delete user ${user.name}? This cannot be undone.`))
                                                            deleteMutation.mutate(user._id);
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
                    <span className="text-sm text-muted-foreground">Page {page} of {meta.totalPages}</span>
                    <Button variant="outline" size="icon" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* User Detail Dialog */}
            <Dialog open={viewOpen} onClose={() => setViewOpen(false)}>
                <DialogHeader onClose={() => setViewOpen(false)}>User Details</DialogHeader>
                {viewUser && (
                    <DialogContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${getAvatarColor(viewUser.name)} flex items-center justify-center text-white font-bold text-xl`}>
                                {getInitials(viewUser.name)}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">{viewUser.name}</h3>
                                <p className="text-sm text-muted-foreground">{viewUser.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={viewUser.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{viewUser.role}</Badge>
                                    {viewUser.isEmailVerified && <Badge variant="success">Verified</Badge>}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> Email</p>
                                <p className="text-sm font-medium mt-0.5">{viewUser.email}</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Joined</p>
                                <p className="text-sm font-medium mt-0.5">{new Date(viewUser.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-xs text-muted-foreground flex items-center gap-1"><UserCircle className="h-3 w-3" /> Provider</p>
                                <p className="text-sm font-medium mt-0.5 capitalize">{viewUser.authProvider || 'email'}</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="text-sm font-medium mt-0.5">{viewUser.phone || 'Not provided'}</p>
                            </div>
                        </div>

                        {viewUser.wishlist?.length > 0 && (
                            <div>
                                <p className="text-sm font-medium mb-1">Wishlist ({viewUser.wishlist.length} items)</p>
                            </div>
                        )}
                    </DialogContent>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
                    {viewUser && (
                        <Button
                            variant={viewUser.role === 'admin' ? 'outline' : 'default'}
                            onClick={() => {
                                const newRole = viewUser.role === 'admin' ? 'student' : 'admin';
                                if (confirm(`Change role to ${newRole}?`)) {
                                    roleMutation.mutate({ id: viewUser._id, role: newRole });
                                    setViewUser({ ...viewUser, role: newRole });
                                }
                            }}
                        >
                            {viewUser.role === 'admin' ? <ShieldOff className="mr-2 h-4 w-4" /> : <Shield className="mr-2 h-4 w-4" />}
                            {viewUser.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </Button>
                    )}
                </DialogFooter>
            </Dialog>
        </div>
    );
}