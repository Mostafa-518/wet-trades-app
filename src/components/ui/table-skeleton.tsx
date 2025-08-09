import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  showHeader?: boolean;
  className?: string;
}

/**
 * Skeleton loading component for tables that mimics the actual table structure
 */
export function TableSkeleton({ 
  columns, 
  rows = 5, 
  showHeader = true, 
  className 
}: TableSkeletonProps) {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
      )}
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columns }).map((_, index) => (
                <TableHead key={index}>
                  <Skeleton className="h-4 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton 
                      className={`h-4 ${
                        colIndex === 0 ? 'w-8' : // First column (checkbox)
                        colIndex === columns - 1 ? 'w-20' : // Last column (actions)
                        'w-full'
                      }`} 
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/**
 * Specialized skeleton for subcontract tables
 */
export function SubcontractTableSkeleton() {
  return (
    <TableSkeleton 
      columns={12} 
      rows={5} 
      showHeader={true}
      className="mt-4"
    />
  );
}

/**
 * Specialized skeleton for project tables
 */
export function ProjectTableSkeleton() {
  return (
    <TableSkeleton 
      columns={5} 
      rows={5} 
      showHeader={true}
      className="mt-4"
    />
  );
}

/**
 * Specialized skeleton for subcontractor tables
 */
export function SubcontractorTableSkeleton() {
  return (
    <TableSkeleton 
      columns={6} 
      rows={5} 
      showHeader={true}
      className="mt-4"
    />
  );
}