
import React from 'react';
import { Button } from '@/components/ui/button';
import { Subcontractor } from '@/types/subcontractor';

interface SubcontractorFormActionsProps {
  subcontractor?: Subcontractor;
  onCancel: () => void;
}

export function SubcontractorFormActions({ subcontractor, onCancel }: SubcontractorFormActionsProps) {
  return (
    <div className="flex gap-4 pt-4">
      <Button type="submit" className="flex-1">
        {subcontractor ? 'Update Subcontractor' : 'Add Subcontractor'}
      </Button>
      <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
        Cancel
      </Button>
    </div>
  );
}
