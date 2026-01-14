import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ className, size = 'default' }) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        default: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <Loader2 className={cn('animate-spin text-primary', sizeClasses[size], className)} />
    );
}

export function LoadingPage({ message = 'Loading...' }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">{message}</p>
        </div>
    );
}

export function LoadingOverlay({ message = 'Loading...' }) {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-foreground font-medium">{message}</p>
            </div>
        </div>
    );
}
