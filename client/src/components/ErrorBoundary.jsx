import React from 'react';

/**
 * ErrorBoundary — catches JavaScript errors in child component tree
 * and displays a user-friendly fallback UI instead of crashing.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // In production, this could send to an error reporting service
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary-icon" aria-hidden="true">⚠️</div>
          <h2 className="error-boundary-title">Something went wrong</h2>
          <p className="error-boundary-message">
            {this.state.error?.message || 'An unexpected error occurred in the application.'}
          </p>
          <button className="btn btn-primary" onClick={this.handleReset}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
