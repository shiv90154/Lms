'use client';

import { useEffect, useRef, useState } from 'react';
import { LoadingSpinner } from './loading-spinner';

export default function LazyLoad({
    children,
    placeholder = <LoadingSpinner />,
    threshold = 0.1,
    rootMargin = '50px',
}) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {
                threshold,
                rootMargin,
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [threshold, rootMargin]);

    return (
        <div ref={ref}>
            {isVisible ? children : placeholder}
        </div>
    );
}
