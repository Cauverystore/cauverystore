import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('💥 Uncaught error:', error, errorInfo);
    // Optional: send to external logging system
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-4 py-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            🚨 Something Went Wrong
          </h1>
          <p className="mb-6 text-base md:text-lg max-w-xl">
            An unexpected error occurred. Please try refreshing the page, or contact support if the issue persists.
          </p>
          <button
            onClick={this.handleReload}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
          >
            🔄 Reload Page
          </button>

          {this.state.error && (
            <pre className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 text-sm text-left rounded-lg max-w-2xl overflow-auto border border-gray-200 dark:border-gray-700">
              <code className="whitespace-pre-wrap break-words">
                {this.state.error.message}
              </code>
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
