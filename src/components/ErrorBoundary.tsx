import React, { Component } from 'react';
import type { ReactNode } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import logger from '../utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            padding: 4,
            textAlign: 'center',
            maxWidth: 600,
            margin: '0 auto',
            mt: 4
          }}
        >
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" component="div" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary">
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </Typography>
          </Alert>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box sx={{ textAlign: 'left', mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Error details:
              </Typography>
              <Typography
                component="pre"
                variant="body2"
                sx={{
                  backgroundColor: '#f5f5f5',
                  padding: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.75rem'
                }}
              >
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
                {this.state.errorInfo && (
                  <>
                    {'\n\nComponent Stack:'}
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </Typography>
            </Box>
          )}

          <Button
            variant="contained"
            onClick={this.handleReset}
            sx={{ mt: 3 }}
          >
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
