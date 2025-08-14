
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SubcontractResponsibilitiesProps {
  responsibilities: string[];
}

export function SubcontractResponsibilities({ responsibilities }: SubcontractResponsibilitiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Responsibilities</CardTitle>
      </CardHeader>
      <CardContent>
        {responsibilities.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {responsibilities.map(resp => (
              <Badge key={resp} variant="secondary" className="px-3 py-1">
                {resp}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No responsibilities assigned yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
