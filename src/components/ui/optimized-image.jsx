'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

export default function OptimizedImage({
    src,
    alt,
    className,
    fill,
    width,
    height,
    priority = false,
    quality = 75,
    sizes,
    objectFit = 'cover',
    ...props
}) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    if (hasError) {
        return (
            <div className={cn('bg-muted flex items-center justify-center', className)}>
                <span className="text-muted-foreground text-sm">Failed to load image</span>
            </div>
        );
    }

    return (
        <div className={cn('relative', className)}>
            {isLoading && (
                <Skeleton className={cn('absolute inset-0', className)} />
            )}
            <Image
                src={src}
                alt={alt}
                fill={fill}
                width={!fill ? width : undefined}
                height={!fill ? height : undefined}
                priority={priority}
                quality={quality}
                sizes={sizes}
                className={cn(
                    'transition-opacity duration-300',
                    isLoading ? 'opacity-0' : 'opacity-100',
                    objectFit === 'cover' && 'object-cover',
                    objectFit === 'contain' && 'object-contain'
                )}
                onLoad={handleLoad}
                onError={handleError}
                {...props}
            />
        </div>
    );
}
