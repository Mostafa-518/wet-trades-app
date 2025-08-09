
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SubcontractDescriptionProps {
  description: string;
}

export function SubcontractDescription({ description }: SubcontractDescriptionProps) {
  if (!description) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Description</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}
