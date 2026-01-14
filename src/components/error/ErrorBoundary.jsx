'use client';

import { Component } from 'react';
import ErrorDisplay from './ErrorDisplay';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <ErrorDisplay
                    title="Something went wrong"
                    message={this.state.error?.message || 'An unexpected error occurred'}
                    onRetry={this.handleReset}
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
