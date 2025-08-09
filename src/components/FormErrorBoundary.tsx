import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface FormErrorBoundaryProps {
  children: React.ReactNode;
  formName?: string;
  onRetry?: () => void;
}

function FormErrorFallback({ formName, onRetry }: { formName?: string; onRetry?: () => void }) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          {formName ? `The ${formName} form` : 'This form'} encountered an error. Please try again.
        </span>
        <Button 
          onClick={handleRetry}
          variant="outline"
          size="sm"
          className="ml-4 flex items-center gap-2"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export function FormErrorBoundary({ children, formName, onRetry }: FormErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={<FormErrorFallback formName={formName} onRetry={onRetry} />}>
      {children}
    </ErrorBoundary>
  );
}