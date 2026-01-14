'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

/**
 * Lazy loading image component with intersection observer
 * Improves performance by loading images only when they're in viewport
 */
export function LazyImage({
    src,
    alt,
    width,
    height,
    className = '',
    priority = false,
    placeholder = 'blur',
    blurDataURL,
    ...props
}) {
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        if (priority) {
            setIsInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '50px', // Start loading 50px before image enters viewport
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            if (imgRef.current) {
                observer.unobserve(imgRef.current);
            }
        };
    }, [priority]);

    return (
        <div ref={imgRef} className={className}>
            {isInView ? (
                <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    priority={priority}
                    placeholder={placeholder}
                    blurDataURL={blurDataURL}
                    {...props}
                />
            ) : (
                <div
                    className="bg-muted animate-pulse"
                    style={{
                        width: width || '100%',
                        height: height || '100%',
                        aspectRatio: width && height ? `${width}/${height}` : undefined,
                    }}
                />
            )}
        </div>
    );
}
