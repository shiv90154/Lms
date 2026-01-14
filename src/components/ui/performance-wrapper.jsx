'use client';

import { memo } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Skeleton } from './skeleton';

/**
 * Performance wrapper that lazy loads components when they enter viewport
 */
function PerformanceWrapperComponent({
    children,
    fallback = <Skeleton className="h-32 w-full" />,
    threshold = 0.1,
    rootMargin = '50px',
}) {
    const { ref, isVisible } = useIntersectionObserver({
        threshold,
        rootMargin,
        freezeOnceVisible: true,
    });

    return (
        <div ref={ref}>
            {isVisible ? children : fallback}
        </div>
    );
}

export const PerformanceWrapper = memo(PerformanceWrapperComponent);
