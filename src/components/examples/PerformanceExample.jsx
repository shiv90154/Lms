'use client';

import OptimizedImage from '@/components/ui/optimized-image';
import LazyLoad from '@/components/ui/lazy-load';
import { PerformanceWrapper } from '@/components/ui/performance-wrapper';
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Example component demonstrating performance optimization features
 */
export default function PerformanceExample() {
    const { quality, shouldLoadHighRes } = useAdaptiveQuality();

    return (
        <div className="space-y-8">
            {/* Optimized Image with adaptive quality */}
            <Card>
                <CardContent className="p-4">
                    <h3 className="font-semibold mb-4">Optimized Image</h3>
                    <OptimizedImage
                        src="/example-image.jpg"
                        alt="Example"
                        width={800}
                        height={600}
                        quality={quality}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="rounded-lg"
                    />
                </CardContent>
            </Card>

            {/* Lazy loaded content */}
            <Card>
                <CardContent className="p-4">
                    <h3 className="font-semibold mb-4">Lazy Loaded Content</h3>
                    <LazyLoad>
                        <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                            This content was lazy loaded!
                        </div>
                    </LazyLoad>
                </CardContent>
            </Card>

            {/* Performance wrapped component */}
            <PerformanceWrapper>
                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-semibold mb-4">Performance Wrapped</h3>
                        <p className="text-muted-foreground">
                            This component only renders when it enters the viewport.
                            Quality: {quality}, High Res: {shouldLoadHighRes ? 'Yes' : 'No'}
                        </p>
                    </CardContent>
                </Card>
            </PerformanceWrapper>
        </div>
    );
}
