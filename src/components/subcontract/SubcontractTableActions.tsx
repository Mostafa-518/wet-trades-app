
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface SubcontractTableActionsProps {
  contractId: string;
  onView: (contractId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function SubcontractTableActions({ 
  contractId, 
  onView, 
  onEdit, 
  onDelete 
}: SubcontractTableActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" onClick={() => onView(contractId)}>
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onEdit}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
