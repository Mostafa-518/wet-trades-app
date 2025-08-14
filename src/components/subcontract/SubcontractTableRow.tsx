
import React, { memo, useCallback, useMemo } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { TableSelectionCheckbox } from '@/components/TableSelectionCheckbox';
import { SubcontractTableActions } from './SubcontractTableActions';
import { Subcontract } from '@/types/subcontract';
import { 
  formatCurrency, 
  calculateTotalWithoutWastage, 
  formatResponsibilities, 
  formatDate 
} from './SubcontractTableHelpers';

interface SubcontractTableRowProps {
  contract: Subcontract;
  isSelected: boolean;
  getProjectName: (projectId: string) => string;
  getSubcontractorName: (subcontractorId: string) => string;
  onToggleOne: (id: string) => void;
  onViewDetail: (contractId: string) => void;
  onEdit: (subcontract: Subcontract) => void;
  onDelete: (id: string) => Promise<void>;
}

const SubcontractTableRow = memo(function SubcontractTableRow({
  contract,
  isSelected,
  getProjectName,
  getSubcontractorName,
  onToggleOne,
  onViewDetail,
  onEdit,
  onDelete
}: SubcontractTableRowProps) {
  // Memoize computed values
  const projectName = useMemo(() => getProjectName(contract.project), [getProjectName, contract.project]);
  const subcontractorName = useMemo(() => getSubcontractorName(contract.subcontractor), [getSubcontractorName, contract.subcontractor]);
  const formattedDate = useMemo(() => formatDate(contract.dateOfIssuing), [contract.dateOfIssuing]);
  const formattedResponsibilities = useMemo(() => formatResponsibilities(contract.responsibilities), [contract.responsibilities]);
  const totalValue = useMemo(() => formatCurrency(contract.totalValue ?? 0), [contract.totalValue]);

  // Memoize callbacks
  const handleToggle = useCallback(() => onToggleOne(contract.id), [onToggleOne, contract.id]);
  const handleView = useCallback(() => onViewDetail(contract.id), [onViewDetail, contract.id]);
  const handleEdit = useCallback(() => onEdit(contract), [onEdit, contract]);
  const handleDelete = useCallback(async () => {
    try {
      await onDelete(contract.id);
    } catch {
      // toast already handled
    }
  }, [onDelete, contract.id]);
  if (contract.tradeItems && contract.tradeItems.length > 0) {
    // Render multiple rows for each trade item
    return (
      <>
        {contract.tradeItems.map((item, idx) => (
          <TableRow 
            key={`${contract.id}-${item.id}`}
            className="cursor-pointer hover:bg-muted/50"
            onClick={handleView}
          >
            {idx === 0 && (
              <>
                <TableCell rowSpan={contract.tradeItems.length} onClick={e => e.stopPropagation()}>
                  <TableSelectionCheckbox
                    checked={isSelected}
                    onCheckedChange={handleToggle}
                    ariaLabel={`Select contract ${contract.contractId}`}
                  />
                </TableCell>
                <TableCell rowSpan={contract.tradeItems.length} className="font-medium text-blue-600">
                  {contract.contractId}
                </TableCell>
                <TableCell rowSpan={contract.tradeItems.length}>
                  {formattedDate}
                </TableCell>
                <TableCell rowSpan={contract.tradeItems.length}>
                  {projectName}
                </TableCell>
                <TableCell rowSpan={contract.tradeItems.length}>
                  {subcontractorName}
                </TableCell>
              </>
            )}
            {/* Trades, Items, QTY, Rate, Total (without wastage) */}
            <TableCell>{item.trade || '-'}</TableCell>
            <TableCell>{item.item || '-'}</TableCell>
            <TableCell className="text-right">{item.quantity ?? '-'} {item.unit || ''}</TableCell>
            <TableCell className="text-right">{formatCurrency(item.unitPrice ?? 0)}</TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(calculateTotalWithoutWastage(item.quantity ?? 0, item.unitPrice ?? 0))}
            </TableCell>
            {idx === 0 && (
              <>
                <TableCell rowSpan={contract.tradeItems.length}>
                  {formattedResponsibilities}
                </TableCell>
                <TableCell rowSpan={contract.tradeItems.length} onClick={(e) => e.stopPropagation()}>
                  <SubcontractTableActions
                    contractId={contract.id}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </TableCell>
              </>
            )}
          </TableRow>
        ))}
      </>
    );
  }

  // Single row for contracts without trade items
  return (
    <TableRow 
      key={contract.id}
      className="cursor-pointer hover:bg-muted/50"
      onClick={handleView}
    >
      <TableCell onClick={e => e.stopPropagation()}>
        <TableSelectionCheckbox
          checked={isSelected}
          onCheckedChange={handleToggle}
          ariaLabel={`Select contract ${contract.contractId}`}
        />
      </TableCell>
      <TableCell className="font-medium text-blue-600">{contract.contractId}</TableCell>
      <TableCell>{formattedDate}</TableCell>
      <TableCell>{projectName}</TableCell>
      <TableCell>{subcontractorName}</TableCell>
      <TableCell className="text-muted-foreground">-</TableCell>
      <TableCell className="text-muted-foreground">-</TableCell>
      <TableCell className="text-muted-foreground">-</TableCell>
      <TableCell className="text-muted-foreground">-</TableCell>
      <TableCell className="text-right font-medium">{totalValue}</TableCell>
      <TableCell>{formattedResponsibilities}</TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <SubcontractTableActions
          contractId={contract.id}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </TableCell>
    </TableRow>
  );
});

export { SubcontractTableRow };
