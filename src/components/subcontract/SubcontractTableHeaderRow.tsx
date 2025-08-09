
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TableSelectionCheckbox } from '@/components/TableSelectionCheckbox';

interface SubcontractTableHeaderRowProps {
  allSelected: boolean;
  onToggleAll: () => void;
}

export function SubcontractTableHeaderRow({ 
  allSelected, 
  onToggleAll 
}: SubcontractTableHeaderRowProps) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>
          <TableSelectionCheckbox 
            checked={allSelected} 
            onCheckedChange={onToggleAll} 
            ariaLabel="Select all subcontracts"
          />
        </TableHead>
        <TableHead>Contract ID</TableHead>
        <TableHead>Date of Issuing</TableHead>
        <TableHead>Project Name</TableHead>
        <TableHead>Subcontractor Company</TableHead>
        <TableHead>Trades</TableHead>
        <TableHead>Items</TableHead>
        <TableHead>QTY</TableHead>
        <TableHead>Rate</TableHead>
        <TableHead>Total Amount</TableHead>
        <TableHead>Responsibilities</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
