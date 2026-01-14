'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Example of code splitting with dynamic imports
 * This pattern should be used for heavy components that aren't needed immediately
 */

// Loading component
const LoadingFallback = () => (
    <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
    </div>
);

/**
 * Dynamically import heavy components
 * These components will be loaded only when needed
 */

// Example: Heavy chart component
export const DynamicChart = dynamic(
    () => import('@/components/charts/Chart').catch(() => ({ default: () => <div>Chart not available</div> })),
    {
        loading: () => <LoadingFallback />,
        ssr: false, // Disable SSR for client-only components
    }
);

// Example: Heavy editor component
export const DynamicEditor = dynamic(
    () => import('@/components/editor/Editor').catch(() => ({ default: () => <div>Editor not available</div> })),
    {
        loading: () => <LoadingFallback />,
        ssr: false,
    }
);

// Example: Heavy video player
export const DynamicVideoPlayer = dynamic(
    () => import('@/components/video/VideoPlayer').catch(() => ({ default: () => <div>Video player not available</div> })),
    {
        loading: () => <LoadingFallback />,
        ssr: false,
    }
);

/**
 * Helper function to create dynamic components
 * @param {Function} importFunc - Import function
 * @param {object} options - Dynamic import options
 * @returns {Component}
 */
export function createDynamicComponent(importFunc, options = {}) {
    return dynamic(importFunc, {
        loading: () => <LoadingFallback />,
        ssr: false,
        ...options,
    });
}
