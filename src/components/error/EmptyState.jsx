'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function EmptyState({
    icon: Icon,
    title,
    message,
    action,
    actionLabel,
    className,
}) {
    return (
        <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
            {Icon && (
                <div className="mb-4">
                    <Icon className="h-16 w-16 text-muted-foreground" />
                </div>
            )}

            <h3 className="text-xl font-semibold mb-2">{title}</h3>

            {message && (
                <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
            )}

            {action && actionLabel && (
                <Button onClick={action}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
