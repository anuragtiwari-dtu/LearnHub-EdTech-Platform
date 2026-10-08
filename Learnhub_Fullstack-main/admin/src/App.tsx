import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LayoutDashboard, BookOpen, Users, Tags, CreditCard, Menu, X, GraduationCap, LogOut, Loader2, MessageSquare } from 'lucide-react';
import Dashboard from '@/pages/Dashboard';
import ManageCourses from '@/pages/ManageCourses';
import ManageUsers from '@/pages/ManageUsers';
import ManageCategories from '@/pages/ManageCategories';
import ManageOrders from '@/pages/ManageOrders';
import ManageContacts from '@/pages/ManageContacts';
import Login from '@/pages/Login';
import { cn } from '@/lib/utils';
import { authAPI } from '@/services/api';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 2 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: BookOpen, label: 'Courses', path: '/courses' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: Tags, label: 'Categories', path: '/categories' },
    { icon: CreditCard, label: 'Orders', path: '/orders' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
];

function AdminLayout({ user, onLogout }: { user: any; onLogout: () => void }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className={cn(
                'border-r bg-card transition-all duration-300 flex-shrink-0 flex flex-col',
                sidebarOpen ? 'w-64' : 'w-16'
            )}>
                <div className="h-16 flex items-center px-4 border-b">
                    <GraduationCap className="h-6 w-6 text-primary flex-shrink-0" />
                    {sidebarOpen && <span className="ml-2 font-bold text-lg">LearnHub</span>}
                </div>
                <nav className="p-2 space-y-1 flex-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                                location.pathname === item.path ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                            )}
                        >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            {sidebarOpen && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* User info + Logout */}
                <div className="border-t p-3">
                    {sidebarOpen ? (
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                            <button
                                onClick={onLogout}
                                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                title="Logout"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onLogout}
                            className="w-full flex justify-center p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b flex items-center px-4 gap-4 flex-shrink-0">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1">
                        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                    <span className="text-sm text-muted-foreground">Admin Panel</span>
                </header>
                <main className="flex-1 p-6 overflow-auto">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/courses" element={<ManageCourses />} />
                        <Route path="/users" element={<ManageUsers />} />
                        <Route path="/categories" element={<ManageCategories />} />
                        <Route path="/orders" element={<ManageOrders />} />
                        <Route path="/messages" element={<ManageContacts />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

function AppContent() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Try to restore session
        authAPI.getMe()
            .then((res) => {
                const userData = res.data?.user;
                if (userData?.role === 'admin') {
                    setUser(userData);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleLogin = (userData: any) => {
        setUser(userData);
    };

    const handleLogout = async () => {
        try {
            await authAPI.logout();
        } catch {}
        setUser(null);
        queryClient.clear();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <AdminLayout user={user} onLogout={handleLogout} />
        </BrowserRouter>
    );
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AppContent />
        </QueryClientProvider>
    );
}