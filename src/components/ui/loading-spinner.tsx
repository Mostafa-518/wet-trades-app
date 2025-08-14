import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Enhanced loading spinner component
 */
export function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="relative">
        <div className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${sizeClasses[size]}`}></div>
        <div className={`absolute inset-0 rounded-full border-2 border-muted ${sizeClasses[size]}`}></div>
      </div>
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
}

/**
 * Full page loading component
 */
export function PageLoader({ message = "Loading page..." }: { message?: string }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardContent className="p-8">
          <LoadingSpinner size="lg" text={message} className="py-4" />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Inline loading component for small sections
 */
export function InlineLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="sm" text={text} />
    </div>
  );
}

/**
 * Import processing loader
 */
export function ImportLoader() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-sm">
        <CardContent className="p-8">
          <LoadingSpinner 
            size="lg" 
            text="Processing import..." 
            className="py-4"
          />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-3/4" />
            <Skeleton className="h-2 w-1/2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}