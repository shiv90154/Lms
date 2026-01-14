'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/ui/toast';

export function useErrorHandler() {
    const { toast } = useToast();

    const handleError = useCallback((error, customMessage) => {
        console.error('Error:', error);

        let errorMessage = customMessage || 'An unexpected error occurred';

        if (error.response) {
            // API error response
            errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
        } else if (error.message) {
            // JavaScript error
            errorMessage = error.message;
        }

        toast({
            type: 'error',
            title: 'Error',
            message: errorMessage,
        });

        return errorMessage;
    }, [toast]);

    const handleSuccess = useCallback((message) => {
        toast({
            type: 'success',
            title: 'Success',
            message,
        });
    }, [toast]);

    return { handleError, handleSuccess };
}
