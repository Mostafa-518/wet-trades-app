
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Responsibility } from '@/types/responsibility';

interface ResponsibilityDetailViewProps {
  responsibilityId: string;
  onBack: () => void;
  onEdit: (responsibility: Responsibility) => void;
}

export function ResponsibilityDetailView({ responsibilityId, onBack, onEdit }: ResponsibilityDetailViewProps) {
  const { responsibilities } = useData();
  const responsibility = responsibilities.find(r => r.id === responsibilityId);

  if (!responsibility) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Responsibility Not Found</h2>
        <p className="text-muted-foreground">The requested responsibility could not be found.</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Responsibilities
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{responsibility.name}</h1>
        </div>
        <Button onClick={() => onEdit(responsibility)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Responsibility Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Category</h3>
              <Badge variant="outline" className="text-md">
                {responsibility.category}
              </Badge>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Status</h3>
              <Badge variant={responsibility.isActive ? "default" : "secondary"}>
                {responsibility.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Description</h3>
              <p className="text-md">{responsibility.description}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Created</h3>
              <p>{new Date(responsibility.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-1">Last Updated</h3>
              <p>{new Date(responsibility.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
