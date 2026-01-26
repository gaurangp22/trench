import { Component, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
                    <div className="max-w-lg w-full bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                        <h1 className="text-xl font-bold text-red-400 mb-4">Something went wrong</h1>
                        <pre className="text-sm text-red-300 whitespace-pre-wrap overflow-auto max-h-64 bg-black/50 p-4 rounded-lg">
                            {this.state.error?.message}
                            {'\n\n'}
                            {this.state.error?.stack}
                        </pre>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
