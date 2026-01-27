import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('client' | 'freelancer')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    // Debug logging
    console.log('[ProtectedRoute]', {
        path: location.pathname,
        isLoading,
        isAuthenticated,
        userRole: user?.role,
        allowedRoles
    });

    if (isLoading) {
        console.log('[ProtectedRoute] Showing loading state');
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                    <p className="text-zinc-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        console.log('[ProtectedRoute] Not authenticated, redirecting to /auth');
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // Check role-based access
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        const redirectPath = user.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard';
        console.log('[ProtectedRoute] Role mismatch, redirecting to', redirectPath);
        return <Navigate to={redirectPath} replace />;
    }

    console.log('[ProtectedRoute] Rendering children');
    return <>{children}</>;
}
