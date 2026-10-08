import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        // In production, send to error tracking service (Sentry, etc.)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                    <div className="text-center max-w-md">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold mb-4 text-foreground">Something went wrong</h1>
                        <p className="text-muted-foreground mb-6">
                            We apologize for the inconvenience. An unexpected error occurred. Please try refreshing the page.
                        </p>
                        {this.state.error && (
                            <pre className="text-xs text-left bg-muted p-3 rounded-lg mb-4 overflow-auto max-h-32 text-destructive">
                                {this.state.error.message}
                            </pre>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}