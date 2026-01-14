'use client';

import { useState, useCallback } from 'react';

export function useAsync() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (asyncFunction, onSuccess, onError) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await asyncFunction();
            if (onSuccess) {
                onSuccess(result);
            }
            return result;
        } catch (err) {
            const errorMessage = err.message || 'An error occurred';
            setError(errorMessage);
            if (onError) {
                onError(err);
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
    }, []);

    return { isLoading, error, execute, reset };
}
