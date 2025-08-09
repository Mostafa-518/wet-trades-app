import React, { memo, useMemo, useCallback } from 'react';
import { SubcontractEditModal } from './subcontract/SubcontractEditModal';
import { SubcontractTableHeader } from './subcontract/SubcontractTableHeader';
import { SubcontractTableSearch } from './subcontract/SubcontractTableSearch';
import { SubcontractTableContent } from './subcontract/SubcontractTableContent';
import { SubcontractTableSummary } from './subcontract/SubcontractTableSummary';
import { ImportPreviewDialog } from '@/components/ImportPreviewDialog';
import { SubcontractTableSkeleton } from '@/components/ui/table-skeleton';
import { ImportLoader } from '@/components/ui/loading-spinner';
import { TableErrorBoundary } from '@/components/TableErrorBoundary';
import { useSubcontractTableLogic } from '@/hooks/useSubcontractTableLogic';
import { useSubcontractsImport } from '@/hooks/useSubcontractsImport';

interface SubcontractTableProps {
  onCreateNew?: () => void;
  onViewDetail: (contractId: string) => void;
  reportFilters?: any;
}

const SubcontractTable = memo(function SubcontractTable({ onCreateNew, onViewDetail, reportFilters }: SubcontractTableProps) {
  const {
    subcontracts,
    filteredData,
    searchTerm,
    showAdvancedSearch,
    editingSubcontract,
    selectedIds,
    allSelected,
    isLoading,
    getProjectName,
    getProjectCode,
    getSubcontractorName,
    handleSimpleSearch,
    handleAdvancedSearch,
    handleEdit,
    handleSaveEdit,
    toggleAll,
    toggleOne,
    handleBulkDelete,
    deleteSubcontract,
    setEditingSubcontract,
  } = useSubcontractTableLogic(reportFilters);

  const {
    isImporting,
    importData,
    showPreview,
    setShowPreview,
    handleFileUpload,
    processImport,
    downloadTemplate
  } = useSubcontractsImport();

  // Memoize import columns to prevent re-creation on every render
  const importColumns = useMemo(() => [
    { key: 'Date of Issuing', label: 'Date of Issuing' },
    { key: 'Project Name', label: 'Project Name' },
    { key: 'Subcontractor Company', label: 'Subcontractor Company' },
    { key: 'Type of contract', label: 'Type of Contract' },
    { key: 'Trades', label: 'Trades' },
    { key: 'Items', label: 'Items' },
    { key: 'QTY', label: 'Quantity' },
    { key: 'Rate', label: 'Rate' },
    { key: 'wastage', label: 'Wastage %' },
    { key: 'Responsibilities', label: 'Responsibilities' }
  ], []);

  // Memoize handlers to prevent re-creation
  const handleCloseEdit = useCallback(() => {
    setEditingSubcontract(null);
  }, [setEditingSubcontract]);

  const handleClosePreview = useCallback(() => {
    setShowPreview(false);
  }, [setShowPreview]);

  if (isLoading) {
    return <SubcontractTableSkeleton />;
  }

  return (
    <TableErrorBoundary tableName="Subcontracts" onRetry={() => window.location.reload()}>
      <div className="space-y-4">
        <SubcontractTableHeader 
          onCreateNew={onCreateNew}
          onFileUpload={handleFileUpload}
          onDownloadTemplate={downloadTemplate}
        />
        <SubcontractTableSummary filteredData={filteredData} />


        <SubcontractTableSearch
          searchTerm={searchTerm}
          onSimpleSearch={handleSimpleSearch}
          onAdvancedSearch={handleAdvancedSearch}
          subcontracts={subcontracts}
        />

        <SubcontractTableContent
          filteredData={filteredData}
          selectedIds={selectedIds}
          searchTerm={searchTerm}
          showAdvancedSearch={showAdvancedSearch}
          allSelected={allSelected}
          getProjectName={getProjectName}
          getProjectCode={getProjectCode}
          getSubcontractorName={getSubcontractorName}
          onToggleAll={toggleAll}
          onToggleOne={toggleOne}
          onViewDetail={onViewDetail}
          onEdit={handleEdit}
          onDelete={deleteSubcontract}
          onBulkDelete={handleBulkDelete}
        />

        {/* <SubcontractTableSummary filteredData={filteredData} /> */}

        {editingSubcontract && (
          <SubcontractEditModal
            subcontract={editingSubcontract}
            open={!!editingSubcontract}
            onClose={handleCloseEdit}
            onSave={handleSaveEdit}
          />
        )}

        <ImportPreviewDialog
          open={showPreview}
          onClose={handleClosePreview}
          data={importData}
          columns={importColumns}
          onImport={processImport}
        />

        {isImporting && <ImportLoader />}
      </div>
    </TableErrorBoundary>
  );
});

export { SubcontractTable };
