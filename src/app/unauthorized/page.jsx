'use client';

import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export default function UnauthorizedPage() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-red-600">
                            Access Denied
                        </CardTitle>
                        <CardDescription>
                            You don't have permission to access this resource
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center text-gray-600">
                            <p>
                                Your current role: <span className="font-semibold">{user?.role || 'Unknown'}</span>
                            </p>
                            <p className="mt-2">
                                This page requires different permissions than what your account has.
                            </p>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <Button asChild>
                                <Link href={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}>
                                    Go to Dashboard
                                </Link>
                            </Button>

                            <Button variant="outline" onClick={logout}>
                                Sign out
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}