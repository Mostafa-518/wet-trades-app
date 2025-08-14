import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  pageName?: string;
}

function PageErrorFallback({ pageName }: { pageName?: string }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle>Page Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            {pageName ? `The ${pageName} page` : 'This page'} encountered an error and couldn't load properly.
          </p>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => window.location.reload()}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Page
            </Button>
            <Button 
              onClick={() => navigate(-1)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PageErrorBoundary({ children, pageName }: PageErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={<PageErrorFallback pageName={pageName} />}>
      {children}
    </ErrorBoundary>
  );
}