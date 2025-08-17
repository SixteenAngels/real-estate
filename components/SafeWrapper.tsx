import React, { Component, ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface SafeWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface SafeWrapperState {
  hasError: boolean;
}

export class SafeWrapper extends Component<SafeWrapperProps, SafeWrapperState> {
  constructor(props: SafeWrapperProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): SafeWrapperState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('SafeWrapper caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <LoadingSpinner />;
    }

    return this.props.children;
  }
}

// Hook for safe component rendering
export const useSafeRender = () => {
  const renderSafely = React.useCallback((component: ReactNode, fallback?: ReactNode) => (
    <SafeWrapper fallback={fallback}>
      {component}
    </SafeWrapper>
  ), []);

  return { renderSafely };
};