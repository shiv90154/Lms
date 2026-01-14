'use client';

import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

export default function ErrorDisplay({
    title = 'Error',
    message = 'Something went wrong',
    onRetry,
    showHomeButton = true,
}) {
    return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
            <div className="max-w-md w-full space-y-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{title}</AlertTitle>
                    <AlertDescription>{message}</AlertDescription>
                </Alert>

                <div className="flex gap-2">
                    {onRetry && (
                        <Button onClick={onRetry} className="flex-1">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    )}
                    {showHomeButton && (
                        <Link href="/" className="flex-1">
                            <Button variant="outline" className="w-full">
                                <Home className="h-4 w-4 mr-2" />
                                Go Home
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
