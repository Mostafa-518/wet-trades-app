
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';

interface SubcontractTableEmptyProps {
  searchTerm: string;
  showAdvancedSearch: boolean;
}

export function SubcontractTableEmpty({ 
  searchTerm, 
  showAdvancedSearch 
}: SubcontractTableEmptyProps) {
  return (
    <TableRow>
      <TableCell colSpan={12} className="text-center py-8">
        <div className="text-muted-foreground">
          {searchTerm || showAdvancedSearch ? 'No subcontracts found matching your search.' : 'No subcontracts found.'}
        </div>
      </TableCell>
    </TableRow>
  );
}
