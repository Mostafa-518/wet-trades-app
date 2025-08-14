
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit } from 'lucide-react';
import { Subcontractor } from '@/types/subcontractor';

interface SubcontractorDetailHeaderProps {
  subcontractor: Subcontractor;
  onBack: () => void;
  onEdit: (subcontractor: Subcontractor) => void;
}

export function SubcontractorDetailHeader({ subcontractor, onBack, onEdit }: SubcontractorDetailHeaderProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Subcontractors
      </Button>
      <div className="flex-1">
        <h1 className="text-3xl font-bold">{subcontractor.companyName}</h1>
        <p className="text-muted-foreground">Representative: {subcontractor.representativeName}</p>
      </div>
      <div className="flex items-center gap-2">
        {getStatusBadge(subcontractor.status)}
        <Button variant="outline" onClick={() => onEdit(subcontractor)} className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Edit
        </Button>
      </div>
    </div>
  );
}
