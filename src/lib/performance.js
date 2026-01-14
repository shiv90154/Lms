/**
 * Performance monitoring utilities
 */

/**
 * Measure component render time
 */
export function measureRenderTime(componentName, callback) {
    if (typeof window === 'undefined') return callback();

    const startTime = performance.now();
    const result = callback();
    const endTime = performance.now();

    console.log(`[Performance] ${componentName} rendered in ${(endTime - startTime).toFixed(2)}ms`);

    return result;
}

/**
 * Report Web Vitals
 */
export function reportWebVitals(metric) {
    if (process.env.NODE_ENV === 'development') {
        console.log('[Web Vitals]', metric);
    }

    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
        // Example: Send to Google Analytics
        // window.gtag?.('event', metric.name, {
        //   value: Math.round(metric.value),
        //   metric_id: metric.id,
        //   metric_value: metric.value,
        //   metric_delta: metric.delta,
        // });
    }
}

/**
 * Debounce function for performance optimization
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for performance optimization
 */
export function throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Check if device has slow connection
 */
export function isSlowConnection() {
    if (typeof navigator === 'undefined' || !navigator.connection) {
        return false;
    }

    const connection = navigator.connection;
    return connection.saveData ||
        connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g';
}

/**
 * Get device memory (if available)
 */
export function getDeviceMemory() {
    if (typeof navigator === 'undefined' || !navigator.deviceMemory) {
        return null;
    }
    return navigator.deviceMemory;
}

/**
 * Check if device is low-end
 */
export function isLowEndDevice() {
    const memory = getDeviceMemory();
    return memory !== null && memory < 4;
}

/**
 * Adaptive loading based on device capabilities
 */
export function shouldLoadHighQuality() {
    return !isSlowConnection() && !isLowEndDevice();
}
