'use client';

import { useEffect } from 'react';
import { usePerformance } from '@/hooks/usePerformance';

/**
 * Performance monitoring component
 * Tracks Web Vitals and reports metrics
 */
export default function PerformanceMonitor() {
    usePerformance();

    useEffect(() => {
        // Log page load performance in development
        if (process.env.NODE_ENV === 'development') {
            window.addEventListener('load', () => {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

                console.log('Page Load Time:', `${pageLoadTime}ms`);
            });
        }
    }, []);

    // This component doesn't render anything
    return null;
}
