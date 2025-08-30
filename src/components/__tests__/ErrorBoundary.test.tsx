import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme/theme';
import ErrorBoundary from '../ErrorBoundary';
import logger from '../../utils/logger';

// Mock logger to avoid actual console output in tests
jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
}));

const mockedLogger = jest.mocked(logger);

// Test component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Wrapper to provide theme context
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid noise in test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    renderWithTheme(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('displays error UI when child component throws', () => {
    renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
  });

  it('logs error details when error occurs', () => {
    renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(mockedLogger.error).toHaveBeenCalledWith(
      'ErrorBoundary caught error:',
      expect.objectContaining({
        error: 'Test error',
        stack: expect.any(String),
        componentStack: expect.any(String)
      })
    );
  });

  it('shows error details in development mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error details:')).toBeInTheDocument();
    expect(screen.getByText(/Test error/)).toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('hides error details in production mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Error details:')).not.toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('allows clicking Try Again button without crashing', () => {    
    renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error UI should be displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    const tryAgainButton = screen.getByRole('button', { name: 'Try Again' });
    expect(tryAgainButton).toBeInTheDocument();

    // Click Try Again button should not crash the application
    expect(() => {
      fireEvent.click(tryAgainButton);
    }).not.toThrow();
  });

  it('renders custom fallback UI when provided', () => {
    const fallbackUI = <div>Custom error message</div>;

    renderWithTheme(
      <ErrorBoundary fallback={fallbackUI}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('handles multiple error scenarios correctly', () => {
    // First error
    const { rerender } = renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(mockedLogger.error).toHaveBeenCalledTimes(1);

    // Reset and cause another error
    const tryAgainButton = screen.getByRole('button', { name: 'Try Again' });
    fireEvent.click(tryAgainButton);

    rerender(
      <ThemeProvider theme={theme}>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </ThemeProvider>
    );

    // Should handle the second error
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(mockedLogger.error).toHaveBeenCalledTimes(2);
  });

  it('handles errors with different error messages', () => {
    const ThrowCustomError: React.FC = () => {
      throw new Error('Custom error message');
    };

    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    renderWithTheme(
      <ErrorBoundary>
        <ThrowCustomError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Custom error message/)).toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('maintains component structure when no errors occur', () => {
    renderWithTheme(
      <ErrorBoundary>
        <div data-testid="wrapper">
          <span>Child 1</span>
          <span>Child 2</span>
        </div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('wrapper')).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });
});