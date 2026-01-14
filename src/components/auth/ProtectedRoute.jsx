'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Protected Route wrapper component
 */
export default function ProtectedRoute({
    children,
    requiredRole = null,
    fallback = null,
    redirectTo = '/auth/login'
}) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/verify', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);

                // Check role if required
                if (requiredRole && data.user.role !== requiredRole) {
                    router.push('/unauthorized');
                    return;
                }

                setIsAuthenticated(true);
            } else {
                router.push(redirectTo);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            router.push(redirectTo);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return fallback || <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return null; // Router will handle redirect
    }

    return children;
}

/**
 * Admin-only protected route
 */
export function AdminRoute({ children, ...props }) {
    return (
        <ProtectedRoute requiredRole="admin" redirectTo="/unauthorized" {...props}>
            {children}
        </ProtectedRoute>
    );
}

/**
 * Student-only protected route
 */
export function StudentRoute({ children, ...props }) {
    return (
        <ProtectedRoute requiredRole="student" {...props}>
            {children}
        </ProtectedRoute>
    );
}

/**
 * Loading spinner component
 */
function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
}