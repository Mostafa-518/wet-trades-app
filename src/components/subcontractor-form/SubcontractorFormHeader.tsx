
import React from 'react';
import { Subcontractor } from '@/types/subcontractor';

interface SubcontractorFormHeaderProps {
  subcontractor?: Subcontractor;
}

export function SubcontractorFormHeader({ subcontractor }: SubcontractorFormHeaderProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold">
        {subcontractor ? 'Edit Subcontractor' : 'Add New Subcontractor'}
      </h2>
      <p className="text-muted-foreground">
        {subcontractor ? 'Update the subcontractor information below.' : 'Fill in the details to add a new subcontractor.'}
      </p>
    </div>
  );
}
