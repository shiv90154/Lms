# UI/UX Implementation Guide

## Overview

This document describes the UI/UX implementation for the Premium LMS System, including responsive design, theme system, loading states, error handling, and performance optimizations.

## Features Implemented

### 1. Responsive Design and Theme System

#### Theme Provider (`src/context/ThemeContext.jsx`)
- Dark/Light mode support with system preference detection
- Persistent theme selection using localStorage
- Smooth theme transitions
- No flash of unstyled content (FOUC)

#### Components
- **ThemeToggle** (`src/components/layout/ThemeToggle.jsx`): Toggle button for switching themes
- **Header** (`src/components/layout/Header.jsx`): Responsive navigation with mobile menu
- **Footer** (`src/components/layout/Footer.jsx`): Responsive footer with links and contact info
- **Container** (`src/components/layout/Container.jsx`): Responsive container with size variants
- **ResponsiveGrid** (`src/components/layout/ResponsiveGrid.jsx`): Adaptive grid layout

#### Usage Example
```jsx
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from '@/components/layout/ThemeToggle';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <ThemeToggle />
    </div>
  );
}
```

### 2. Loading States

#### Components
- **Skeleton** (`src/components/ui/skeleton.jsx`): Base skeleton component
- **LoadingSpinner** (`src/components/ui/loading-spinner.jsx`): Spinner with variants
- **LoadingPage** (`src/components/ui/loading-spinner.jsx`): Full page loading state
- **LoadingOverlay** (`src/components/ui/loading-spinner.jsx`): Modal loading overlay

#### Specialized Skeletons
- **BookCardSkeleton** (`src/components/loading/BookCardSkeleton.jsx`)
- **CourseCardSkeleton** (`src/components/loading/CourseCardSkeleton.jsx`)
- **TableSkeleton** (`src/components/loading/TableSkeleton.jsx`)

#### Usage Example
```jsx
import { LoadingSpinner, LoadingPage } from '@/components/ui/loading-spinner';
import BookCardSkeleton from '@/components/loading/BookCardSkeleton';

function BookList({ isLoading, books }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  
  return <div>{/* Render books */}</div>;
}
```

### 3. Error Handling

#### Components
- **ErrorBoundary** (`src/components/error/ErrorBoundary.jsx`): React error boundary
- **ErrorDisplay** (`src/components/error/ErrorDisplay.jsx`): User-friendly error display
- **NotFound** (`src/components/error/NotFound.jsx`): 404 page component
- **EmptyState** (`src/components/error/EmptyState.jsx`): Empty state display

#### Toast Notifications
- **Toast System** (`src/components/ui/toast.jsx`): Toast notification provider
- Types: success, error, warning, info
- Auto-dismiss with configurable duration

#### Hooks
- **useAsync** (`src/hooks/useAsync.js`): Handle async operations with loading/error states
- **useErrorHandler** (`src/hooks/useErrorHandler.js`): Centralized error handling with toast

#### Usage Example
```jsx
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { useToast } from '@/components/ui/toast';
import { useErrorHandler } from '@/hooks/useErrorHandler';

function MyComponent() {
  const { toast } = useToast();
  const { handleError, handleSuccess } = useErrorHandler();
  
  const handleSubmit = async () => {
    try {
      await submitData();
      handleSuccess('Data saved successfully!');
    } catch (error) {
      handleError(error, 'Failed to save data');
    }
  };
  
  return (
    <ErrorBoundary>
      {/* Your component */}
    </ErrorBoundary>
  );
}
```

### 4. Image Optimization and Performance

#### Components
- **OptimizedImage** (`src/components/ui/optimized-image.jsx`): Image with loading states and error handling
- **LazyLoad** (`src/components/ui/lazy-load.jsx`): Lazy load components on scroll
- **PerformanceWrapper** (`src/components/ui/performance-wrapper.jsx`): Viewport-based rendering

#### Utilities
- **Image Utils** (`src/lib/image-utils.js`):
  - `generateImageSizes()`: Responsive image sizes
  - `getOptimizedImageUrl()`: Cloudinary optimization
  - `preloadImage()`: Preload critical images
  
- **Performance Utils** (`src/lib/performance.js`):
  - `debounce()`: Debounce function calls
  - `throttle()`: Throttle function calls
  - `isSlowConnection()`: Detect slow network
  - `isLowEndDevice()`: Detect low-end devices
  - `shouldLoadHighQuality()`: Adaptive quality decision

#### Hooks
- **useIntersectionObserver** (`src/hooks/useIntersectionObserver.js`): Viewport detection
- **useAdaptiveQuality** (`src/hooks/useAdaptiveQuality.js`): Adaptive image quality

#### Next.js Configuration
Image optimization configured in `next.config.mjs`:
- WebP and AVIF format support
- Responsive device sizes
- Remote pattern allowlist (Cloudinary, Unsplash)
- Compression enabled
- Package import optimization

#### Usage Example
```jsx
import OptimizedImage from '@/components/ui/optimized-image';
import LazyLoad from '@/components/ui/lazy-load';
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality';

function ProductImage({ src, alt }) {
  const { quality } = useAdaptiveQuality();
  
  return (
    <LazyLoad>
      <OptimizedImage
        src={src}
        alt={alt}
        width={800}
        height={600}
        quality={quality}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </LazyLoad>
  );
}
```

## Responsive Breakpoints

The system uses the following breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: 1024px - 1280px
- **Wide**: > 1280px

## Theme Colors

### Light Mode
- Background: `oklch(1 0 0)`
- Foreground: `oklch(0.13 0.028 261.692)`
- Primary: `oklch(0.21 0.034 264.665)`

### Dark Mode
- Background: `oklch(0.13 0.028 261.692)`
- Foreground: `oklch(0.985 0.002 247.839)`
- Primary: `oklch(0.928 0.006 264.531)`

## Best Practices

### 1. Always Use Loading States
```jsx
{isLoading ? <Skeleton /> : <Content />}
```

### 2. Wrap Components in Error Boundaries
```jsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### 3. Use Optimized Images
```jsx
<OptimizedImage src={url} alt={alt} width={800} height={600} />
```

### 4. Lazy Load Below-the-Fold Content
```jsx
<LazyLoad>
  <HeavyComponent />
</LazyLoad>
```

### 5. Provide User Feedback
```jsx
const { toast } = useToast();
toast({ type: 'success', message: 'Action completed!' });
```

## Performance Metrics

The implementation focuses on:
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

## Accessibility

All components follow WCAG 2.1 Level AA guidelines:
- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Color contrast ratios
- Screen reader compatibility

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Testing

To test the implementation:

1. **Theme Switching**: Toggle between light/dark modes
2. **Responsive Design**: Test on different screen sizes
3. **Loading States**: Check skeleton loaders during data fetching
4. **Error Handling**: Trigger errors to see error boundaries
5. **Image Optimization**: Inspect network tab for optimized images
6. **Performance**: Use Lighthouse to measure Core Web Vitals

## Future Enhancements

- [ ] Add animation preferences (reduce motion)
- [ ] Implement progressive web app (PWA) features
- [ ] Add offline support
- [ ] Implement service worker for caching
- [ ] Add more skeleton variants
- [ ] Create storybook for component documentation
