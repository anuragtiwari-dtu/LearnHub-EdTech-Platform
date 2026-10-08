import { lazy, Suspense, ComponentType } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { initializeTheme } from '@/store/themeStore';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/services/endpoints';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import GuestRoute from '@/components/GuestRoute';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

// Lazy-loaded pages
const Home = lazy(() => import('@/pages/Home'));
const Courses = lazy(() => import('@/pages/Courses'));
const CourseDetails = lazy(() => import('@/pages/CourseDetails'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const Cart = lazy(() => import('@/pages/Cart'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const DashboardWishlist = lazy(() => import('@/pages/DashboardWishlist'));
const DashboardOrders = lazy(() => import('@/pages/DashboardOrders'));
const DashboardSettings = lazy(() => import('@/pages/DashboardSettings'));
const DashboardLayout = lazy(() => import('@/components/layout/DashboardLayout'));
const CoursePlayer = lazy(() => import('@/pages/CoursePlayer'));
const Contact = lazy(() => import('@/pages/Contact'));
const About = lazy(() => import('@/pages/About'));
const Blog = lazy(() => import('@/pages/Blog'));

function PageLoader() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Loading...</p>
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
    const { setUser } = useAuthStore();

    useEffect(() => {
        initializeTheme();
        const fetchUser = async () => {
            try {
                const result = await authAPI.getMe();
                setUser(result.data?.user as any);
            } catch {
                setUser(null);
            }
        };
        fetchUser();
    }, []);

    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Public layout with navbar/footer */}
                    <Route element={<Layout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/courses/:slug" element={<CourseDetails />} />
                        <Route element={<GuestRoute />}>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                        </Route>
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/blog" element={<Blog />} />
                        {/* Protected Routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/cart" element={<Cart />} />

                            {/* Dashboard sub-routes with shared sidebar */}
                            <Route element={<DashboardLayout />}>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/dashboard/wishlist" element={<DashboardWishlist />} />
                                <Route path="/dashboard/orders" element={<DashboardOrders />} />
                                <Route path="/dashboard/settings" element={<DashboardSettings />} />
                            </Route>
                        </Route>
                    </Route>

                    {/* Full-screen course player (no nav/footer) */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/learn/:courseId" element={<CoursePlayer />} />
                    </Route>

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
                <AppContent />
                <Toaster position="bottom-right" toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#333',
                        color: '#fff',
                    },
                }} />
            </ErrorBoundary>
        </QueryClientProvider>
    );
}