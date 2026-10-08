import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function GuestRoute() {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) return null;

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
