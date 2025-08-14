
import React from 'react';
import { Button } from '@/components/ui/button';

interface SubcontractEditActionsProps {
  onClose: () => void;
}

export function SubcontractEditActions({ onClose }: SubcontractEditActionsProps) {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit">
        Save Changes
      </Button>
    </div>
  );
}
