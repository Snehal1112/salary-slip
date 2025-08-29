import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import logger from '../utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorInfo {
  error: Error;
  errorInfo: { componentStack: string };
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logger.error('ErrorBoundary caught error:', event.error);
      setHasError(true);
      setErrorInfo({
        error: event.error,
        errorInfo: { componentStack: event.filename || 'Unknown' }
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('ErrorBoundary caught promise rejection:', event.reason);
      setHasError(true);
      setErrorInfo({
        error: new Error(event.reason),
        errorInfo: { componentStack: 'Promise rejection' }
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleReset = () => {
    setHasError(false);
    setErrorInfo(null);
  };

  if (hasError) {
    if (fallback) {
      return <>{fallback}</>;
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

        {process.env.NODE_ENV === 'development' && errorInfo && (
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
              {errorInfo.error.message}
              {'\n\n'}
              {errorInfo.error.stack}
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          onClick={handleReset}
          sx={{ mt: 3 }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ErrorBoundary;
