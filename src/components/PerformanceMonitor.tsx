import React, { memo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
}

interface PerformanceMonitorProps {
  componentName: string;
  children: React.ReactNode;
  showMetrics?: boolean;
}

/**
 * Performance monitoring component that tracks render counts and times
 * Only shows metrics in development mode
 */
const PerformanceMonitor = memo(function PerformanceMonitor({ 
  componentName, 
  children, 
  showMetrics = false 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0
  });

  useEffect(() => {
    const startTime = performance.now();
    
    setMetrics(prev => {
      const newRenderCount = prev.renderCount + 1;
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      const averageRenderTime = ((prev.averageRenderTime * prev.renderCount) + renderTime) / newRenderCount;
      
      return {
        renderCount: newRenderCount,
        lastRenderTime: renderTime,
        averageRenderTime
      };
    });
  });

  // Only show metrics in development and when explicitly enabled
  const shouldShowMetrics = process.env.NODE_ENV === 'development' && showMetrics;

  return (
    <>
      {children}
      {shouldShowMetrics && (
        <Card className="mt-4 border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-800">
              Performance Metrics: {componentName}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4 text-xs text-yellow-700">
              <div>
                <span className="font-medium">Renders:</span>
                <div className="text-lg font-bold">{metrics.renderCount}</div>
              </div>
              <div>
                <span className="font-medium">Last Render:</span>
                <div className="text-lg font-bold">{metrics.lastRenderTime.toFixed(2)}ms</div>
              </div>
              <div>
                <span className="font-medium">Avg Render:</span>
                <div className="text-lg font-bold">{metrics.averageRenderTime.toFixed(2)}ms</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
});

export { PerformanceMonitor };