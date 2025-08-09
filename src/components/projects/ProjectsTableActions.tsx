
import React from 'react';
import { Button } from '@/components/ui/button';

interface ProjectsTableActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
}

export function ProjectsTableActions({ selectedCount, onBulkDelete }: ProjectsTableActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="mb-2 flex items-center gap-2">
      <span>{selectedCount} selected</span>
      <Button
        variant="destructive"
        size="sm"
        onClick={onBulkDelete}
        className="ml-2"
      >
        Delete Selected
      </Button>
    </div>
  );
}
