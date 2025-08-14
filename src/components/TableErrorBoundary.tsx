import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface TableErrorBoundaryProps {
  children: React.ReactNode;
  tableName?: string;
  onRetry?: () => void;
}

function TableErrorFallback({ tableName, onRetry }: { tableName?: string; onRetry?: () => void }) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <Card className="my-4">
      <CardContent className="p-8 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
        <h3 className="font-medium mb-2">Table Error</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {tableName ? `The ${tableName} table` : 'This table'} failed to load. Please try refreshing.
        </p>
        <Button 
          onClick={handleRetry}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

export function TableErrorBoundary({ children, tableName, onRetry }: TableErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={<TableErrorFallback tableName={tableName} onRetry={onRetry} />}>
      {children}
    </ErrorBoundary>
  );
}