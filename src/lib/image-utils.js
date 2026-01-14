/**
 * Generate responsive image sizes for Next.js Image component
 */
export function generateImageSizes(breakpoints = {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
    wide: 1280,
}) {
    return `(max-width: ${breakpoints.mobile}px) 100vw, (max-width: ${breakpoints.tablet}px) 50vw, (max-width: ${breakpoints.desktop}px) 33vw, 25vw`;
}

/**
 * Get optimized image URL with quality and format parameters
 */
export function getOptimizedImageUrl(url, options = {}) {
    const {
        width,
        height,
        quality = 75,
        format = 'webp',
    } = options;

    // If using external image service (e.g., Cloudinary)
    if (url.includes('cloudinary.com')) {
        const transformations = [];

        if (width) transformations.push(`w_${width}`);
        if (height) transformations.push(`h_${height}`);
        transformations.push(`q_${quality}`);
        transformations.push(`f_${format}`);

        return url.replace('/upload/', `/upload/${transformations.join(',')}/`);
    }

    return url;
}

/**
 * Generate placeholder blur data URL
 */
export function generateBlurDataUrl(width = 10, height = 10) {
    const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    if (!canvas) return '';

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    return canvas.toDataURL();
}

/**
 * Preload critical images
 */
export function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

/**
 * Batch preload multiple images
 */
export async function preloadImages(urls) {
    return Promise.all(urls.map(url => preloadImage(url)));
}
