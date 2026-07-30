import { Component } from 'react';
import { toast } from 'sonner';
import { createLogger } from '@/lib/logger';

const log = createLogger('error-boundary');

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    log.error('Error caught by boundary', error, { meta: { componentStack: errorInfo?.componentStack } });
    toast.error('Something went wrong. Please refresh the page.');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex min-h-screen items-center justify-center p-4'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-red-600 mb-2'>Something went wrong</h2>
            <p className='text-muted-foreground mb-4'>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className='bg-app-primary text-white px-4 py-2 rounded-lg hover:bg-app-primary/90'
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

export default ErrorBoundary;