'use client';

import { useState, useEffect } from 'react';
import { isSlowConnection, isLowEndDevice } from '@/lib/performance';

export function useAdaptiveQuality() {
    const [quality, setQuality] = useState(75);
    const [shouldLoadHighRes, setShouldLoadHighRes] = useState(true);

    useEffect(() => {
        const slowConnection = isSlowConnection();
        const lowEndDevice = isLowEndDevice();

        if (slowConnection || lowEndDevice) {
            setQuality(50);
            setShouldLoadHighRes(false);
        } else {
            setQuality(75);
            setShouldLoadHighRes(true);
        }
    }, []);

    return { quality, shouldLoadHighRes };
}
