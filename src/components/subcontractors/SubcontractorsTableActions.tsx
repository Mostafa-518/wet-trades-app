
import React from 'react';
import { Button } from '@/components/ui/button';

interface SubcontractorsTableActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
}

export function SubcontractorsTableActions({ selectedCount, onBulkDelete }: SubcontractorsTableActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="p-2 bg-red-50 border-b flex items-center gap-2">
      <span className="font-medium">{selectedCount} selected</span>
      <Button variant="destructive" size="sm" onClick={onBulkDelete}>
        Delete Selected
      </Button>
    </div>
  );
}
