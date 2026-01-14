'use client';

import { useEffect } from 'react';
import { reportPerformanceMetrics } from '@/lib/performance-monitor';

/**
 * Hook to monitor and report Web Vitals performance metrics
 */
export function usePerformance() {
    useEffect(() => {
        // Only run in browser
        if (typeof window === 'undefined') return;

        // Dynamically import web-vitals to avoid SSR issues
        import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
            onCLS(reportPerformanceMetrics);
            onFID(reportPerformanceMetrics);
            onFCP(reportPerformanceMetrics);
            onLCP(reportPerformanceMetrics);
            onTTFB(reportPerformanceMetrics);
            onINP(reportPerformanceMetrics);
        }).catch((error) => {
            console.warn('Failed to load web-vitals:', error);
        });
    }, []);
}

/**
 * Hook to measure component render time
 */
export function useRenderTime(componentName) {
    useEffect(() => {
        const startTime = performance.now();

        return () => {
            const endTime = performance.now();
            const renderTime = endTime - startTime;

            if (process.env.NODE_ENV === 'development') {
                console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
            }
        };
    }, [componentName]);
}
