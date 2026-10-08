import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, Clock, Heart, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/services/endpoints';
import { cn } from '@/lib/utils';

export default function DashboardLayout() {
    const { user, logout: storeLogout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try { await authAPI.logout(); } catch { } finally {
            storeLogout();
            navigate('/');
        }
    };

    const navItems = [
        { path: '/dashboard', label: 'My Courses', icon: BookOpen },
        { path: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
        { path: '/dashboard/orders', label: 'Purchase History', icon: Clock },
        { path: '/dashboard/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="section-padding bg-muted/20 min-h-screen">
            <div className="container-max">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardContent className="p-6 text-center">
                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <h2 className="font-heading font-bold text-lg">{user?.name}</h2>
                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                                <Badge variant="secondary" className="mt-2 capitalize">{user?.role}</Badge>

                                <div className="mt-6 space-y-1">
                                    {navItems.map((item) => (
                                        <Link key={item.path} to={item.path}>
                                            <Button 
                                                variant="ghost" 
                                                className={cn(
                                                    "w-full justify-start", 
                                                    location.pathname === item.path && "bg-accent/10 text-primary font-medium"
                                                )} 
                                                size="sm"
                                            >
                                                <item.icon className="mr-2 h-4 w-4" /> {item.label}
                                            </Button>
                                        </Link>
                                    ))}

                                    {/* Mobile-only Navigation Links */}
                                    <div className="lg:hidden pt-4 mt-4 border-t space-y-1">
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-3 mb-2 text-left">Main Menu</p>
                                        {[
                                            { path: '/', label: 'Home', icon: () => <span className="mr-2 h-4 w-4">🏠</span> },
                                            { path: '/courses', label: 'All Courses', icon: () => <span className="mr-2 h-4 w-4">📚</span> },
                                            { path: '/blog', label: 'Blog', icon: () => <span className="mr-2 h-4 w-4">📝</span> },
                                            { path: '/about', label: 'About Us', icon: () => <span className="mr-2 h-4 w-4">ℹ️</span> },
                                            { path: '/contact', label: 'Contact', icon: () => <span className="mr-2 h-4 w-4">📧</span> },
                                        ].map((item) => (
                                            <Link key={item.path} to={item.path}>
                                                <Button variant="ghost" className="w-full justify-start" size="sm">
                                                    <item.icon /> {item.label}
                                                </Button>
                                            </Link>
                                        ))}
                                    </div>

                                    <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 pt-4" size="sm" onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" /> Logout
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}
