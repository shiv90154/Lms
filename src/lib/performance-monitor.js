/**
 * Performance Monitoring Utilities
 * Provides tools for monitoring and optimizing application performance
 */

/**
 * Measure and log page load performance
 */
export function measurePageLoad() {
    if (typeof window === 'undefined') return;

    // Wait for page to fully load
    window.addEventListener('load', () => {
        // Use Performance API to get metrics
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const connectTime = perfData.responseEnd - perfData.requestStart;
        const renderTime = perfData.domComplete - perfData.domLoading;

        console.log('Performance Metrics:', {
            pageLoadTime: `${pageLoadTime}ms`,
            connectTime: `${connectTime}ms`,
            renderTime: `${renderTime}ms`,
        });

        // Report to analytics if available
        if (window.gtag) {
            window.gtag('event', 'timing_complete', {
                name: 'page_load',
                value: pageLoadTime,
                event_category: 'Performance',
            });
        }
    });
}

/**
 * Measure component render time
 */
export function measureRenderTime(componentName, callback) {
    const startTime = performance.now();
    const result = callback();
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
    }

    return result;
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
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImages() {
    if (typeof window === 'undefined') return;

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    const images = document.querySelectorAll('img.lazy');
    images.forEach(img => imageObserver.observe(img));
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(resources) {
    if (typeof window === 'undefined') return;

    resources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        if (resource.type) link.type = resource.type;
        document.head.appendChild(link);
    });
}

/**
 * Prefetch next page resources
 */
export function prefetchPage(url) {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
}

/**
 * Monitor Core Web Vitals
 */
export function monitorWebVitals(onPerfEntry) {
    if (typeof window === 'undefined') return;

    if (onPerfEntry && onPerfEntry instanceof Function) {
        import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
            getCLS(onPerfEntry);
            getFID(onPerfEntry);
            getFCP(onPerfEntry);
            getLCP(onPerfEntry);
            getTTFB(onPerfEntry);
        }).catch(() => {
            // web-vitals not available, skip monitoring
        });
    }
}

/**
 * Cache API responses in memory
 */
class MemoryCache {
    constructor(ttl = 5 * 60 * 1000) { // Default 5 minutes
        this.cache = new Map();
        this.ttl = ttl;
    }

    set(key, value) {
        const expiresAt = Date.now() + this.ttl;
        this.cache.set(key, { value, expiresAt });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    has(key) {
        return this.get(key) !== null;
    }

    clear() {
        this.cache.clear();
    }

    delete(key) {
        this.cache.delete(key);
    }
}

export const memoryCache = new MemoryCache();

/**
 * Cached fetch wrapper
 */
export async function cachedFetch(url, options = {}, cacheTTL = 5 * 60 * 1000) {
    const cacheKey = `${url}-${JSON.stringify(options)}`;

    // Check memory cache first
    const cached = memoryCache.get(cacheKey);
    if (cached) {
        return cached;
    }

    // Fetch and cache
    const response = await fetch(url, options);
    const data = await response.json();

    memoryCache.set(cacheKey, data);

    return data;
}

/**
 * Optimize bundle size by code splitting
 */
export function dynamicImport(importFunc) {
    return importFunc();
}

/**
 * Report performance metrics to analytics
 */
export function reportPerformanceMetrics(metric) {
    if (typeof window === 'undefined') return;

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log('Performance Metric:', metric);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production' && window.gtag) {
        window.gtag('event', metric.name, {
            value: Math.round(metric.value),
            event_category: 'Web Vitals',
            event_label: metric.id,
            non_interaction: true,
        });
    }
}
