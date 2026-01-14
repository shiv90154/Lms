# Performance Optimization Guide

This document outlines the performance optimization strategies implemented in the LMS Platform.

## Table of Contents

1. [Caching Strategies](#caching-strategies)
2. [Code Splitting](#code-splitting)
3. [Image Optimization](#image-optimization)
4. [ISR (Incremental Static Regeneration)](#isr)
5. [Performance Monitoring](#performance-monitoring)
6. [Best Practices](#best-practices)

## Caching Strategies

### In-Memory Caching

The application uses an in-memory cache for API responses and computed data:

```javascript
import { cache, cachedFetch } from '@/lib/cache';

// Cache a value
cache.set('key', value, 5 * 60 * 1000); // 5 minutes TTL

// Get a cached value
const value = cache.get('key');

// Use cached fetch
const data = await cachedFetch('/api/endpoint', {}, 5 * 60 * 1000);
```

### HTTP Caching

Static assets are cached with appropriate headers:

- **Images**: 1 year cache (`max-age=31536000, immutable`)
- **Static files**: 1 year cache (`max-age=31536000, immutable`)
- **API responses**: No cache (`no-store, must-revalidate`)

## Code Splitting

### Dynamic Imports

Use dynamic imports for heavy components:

```javascript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
    loading: () => <LoadingSkeleton />,
    ssr: false,
});
```

### Route-Based Splitting

Next.js automatically splits code by routes. Each page is a separate bundle.

### Component-Based Splitting

Split large components into smaller chunks:

```javascript
import { createDynamicComponent } from '@/components/ui/dynamic-component';

const Chart = createDynamicComponent(() => import('./Chart'));
```

## Image Optimization

### Next.js Image Component

Always use the Next.js Image component for automatic optimization:

```javascript
import Image from 'next/image';

<Image
    src="/image.jpg"
    alt="Description"
    width={800}
    height={600}
    priority={false} // Set to true for above-the-fold images
/>
```

### Lazy Loading Images

Use the LazyImage component for images below the fold:

```javascript
import { LazyImage } from '@/components/ui/lazy-image';

<LazyImage
    src="/image.jpg"
    alt="Description"
    width={800}
    height={600}
/>
```

### Image Formats

The application automatically serves images in modern formats:
- WebP for browsers that support it
- AVIF for even better compression
- Fallback to original format

## ISR (Incremental Static Regeneration)

### Configuration

Pages are configured with revalidation periods:

```javascript
// Revalidate every hour
export const revalidate = 3600;

export default function Page() {
    // Page content
}
```

### Revalidation Periods

- **Blog posts**: 1 hour (3600 seconds)
- **Current affairs**: 1 hour (3600 seconds)
- **Courses**: 1 day (86400 seconds)
- **Books**: 1 day (86400 seconds)

### On-Demand Revalidation

Trigger revalidation programmatically:

```javascript
import { revalidatePath } from 'next/cache';

// In API route
export async function POST(request) {
    // Update data
    await updateData();
    
    // Revalidate the page
    revalidatePath('/blogs/[slug]');
    
    return Response.json({ revalidated: true });
}
```

## Performance Monitoring

### Web Vitals

The application monitors Core Web Vitals:

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FCP (First Contentful Paint)**: < 1.8s
- **TTFB (Time to First Byte)**: < 600ms

### Usage

Performance monitoring is automatic. Metrics are logged in development and sent to analytics in production.

```javascript
import { usePerformance } from '@/hooks/usePerformance';

function MyComponent() {
    usePerformance(); // Automatically monitors Web Vitals
    
    return <div>Content</div>;
}
```

### Custom Metrics

Track custom performance metrics:

```javascript
import { reportPerformanceMetrics } from '@/lib/performance-monitor';

const startTime = performance.now();
// ... do work
const endTime = performance.now();

reportPerformanceMetrics({
    name: 'custom_operation',
    value: endTime - startTime,
    id: 'unique-id',
});
```

## Best Practices

### 1. Minimize Bundle Size

- Use dynamic imports for large dependencies
- Remove unused dependencies
- Use tree-shaking friendly imports

```javascript
// Good
import { Button } from '@/components/ui/button';

// Bad
import * as UI from '@/components/ui';
```

### 2. Optimize Fonts

- Use `font-display: swap` for custom fonts
- Preload critical fonts
- Use system fonts when possible

### 3. Reduce JavaScript Execution

- Defer non-critical JavaScript
- Use Web Workers for heavy computations
- Minimize third-party scripts

### 4. Optimize CSS

- Remove unused CSS
- Use CSS modules for scoping
- Minimize CSS-in-JS runtime

### 5. Database Queries

- Use indexes for frequently queried fields
- Implement pagination for large datasets
- Cache database query results

### 6. API Optimization

- Implement response caching
- Use compression (gzip/brotli)
- Minimize payload size
- Use GraphQL for flexible data fetching

### 7. Prefetching

Prefetch resources for better navigation:

```javascript
import { prefetchPage } from '@/lib/performance-monitor';

// Prefetch next page
prefetchPage('/next-page');
```

### 8. Debouncing and Throttling

Use debouncing for search inputs and throttling for scroll events:

```javascript
import { debounce, throttle } from '@/lib/performance-monitor';

const handleSearch = debounce((query) => {
    // Search logic
}, 300);

const handleScroll = throttle(() => {
    // Scroll logic
}, 100);
```

## Performance Checklist

- [ ] Images are optimized and lazy-loaded
- [ ] Code is split by routes and components
- [ ] ISR is configured for static pages
- [ ] Caching is implemented for API responses
- [ ] Web Vitals are monitored
- [ ] Fonts are optimized
- [ ] Third-party scripts are minimized
- [ ] Database queries are optimized
- [ ] Bundle size is minimized
- [ ] Performance budget is set

## Monitoring Tools

### Development

- Chrome DevTools Performance tab
- Lighthouse CI
- Next.js built-in analytics

### Production

- Google Analytics (Web Vitals)
- Vercel Analytics
- Custom performance monitoring

## Resources

- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)
- [Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Code Splitting](https://nextjs.org/docs/advanced-features/dynamic-import)
