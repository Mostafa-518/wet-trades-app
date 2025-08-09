import React, { memo, useMemo, useCallback } from 'react';
import { ImportPreviewDialog } from './ImportPreviewDialog';
import { SubcontractorsTableHeader } from './subcontractors/SubcontractorsTableHeader';
import { SubcontractorsTableSearch } from './subcontractors/SubcontractorsTableSearch';
import { SubcontractorsTableActions } from './subcontractors/SubcontractorsTableActions';
import { SubcontractorsTableContent } from './subcontractors/SubcontractorsTableContent';
import { useSubcontractorsTable } from '@/hooks/useSubcontractorsTable';
import { useSubcontractorsImport } from '@/hooks/useSubcontractorsImport';
import { Subcontractor } from '@/types/subcontractor';

interface SubcontractorsTableProps {
  onCreateNew?: () => void;
  onViewDetail: (subcontractorId: string) => void;
  onEdit?: (subcontractor: Subcontractor) => void;
  onDelete?: (subcontractorId: string) => void;
}

const SubcontractorsTable = memo(function SubcontractorsTable({ onCreateNew, onViewDetail, onEdit, onDelete }: SubcontractorsTableProps) {
  const {
    searchTerm,
    setSearchTerm,
    searchBy,
    setSearchBy,
    selectedIds,
    filteredSubcontractors,
    allSelected,
    toggleAll,
    toggleOne,
    handleBulkDelete
  } = useSubcontractorsTable();

  const {
    showImportDialog,
    setShowImportDialog,
    importData,
    setImportData,
    handleFileUpload,
    handleImport,
    downloadTemplate
  } = useSubcontractorsImport();

  // Memoize import columns to prevent re-creation
  const importColumns = useMemo(() => [
    { key: 'companyName' as keyof import('@/types/subcontractor').SubcontractorFormData, label: 'Company Name' },
    { key: 'representativeName' as keyof import('@/types/subcontractor').SubcontractorFormData, label: 'Representative Name' },
    { key: 'commercialRegistration' as keyof import('@/types/subcontractor').SubcontractorFormData, label: 'Commercial Registration' },
    { key: 'taxCardNo' as keyof import('@/types/subcontractor').SubcontractorFormData, label: 'Tax Card No.' },
    { key: 'phone' as keyof import('@/types/subcontractor').SubcontractorFormData, label: 'Phone Contact' },
    { key: 'email' as keyof import('@/types/subcontractor').SubcontractorFormData, label: 'Mail' }
  ], []);

  // Memoize handlers
  const handleCloseImport = useCallback(() => {
    setShowImportDialog(false);
    setImportData([]);
  }, [setShowImportDialog, setImportData]);

  return (
    <div className="space-y-4">
      <SubcontractorsTableHeader
        onCreateNew={onCreateNew}
        onFileUpload={handleFileUpload}
        onDownloadTemplate={downloadTemplate}
      />

      <SubcontractorsTableSearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchBy={searchBy}
        setSearchBy={setSearchBy}
      />

      <SubcontractorsTableActions
        selectedCount={selectedIds.size}
        onBulkDelete={handleBulkDelete}
      />

      <SubcontractorsTableContent
        filteredSubcontractors={filteredSubcontractors}
        selectedIds={selectedIds}
        allSelected={allSelected}
        onToggleAll={toggleAll}
        onToggleOne={toggleOne}
        onViewDetail={onViewDetail}
        onEdit={onEdit}
        onDelete={onDelete}
        searchTerm={searchTerm}
      />

      <ImportPreviewDialog
        open={showImportDialog}
        onClose={handleCloseImport}
        data={importData}
        columns={importColumns}
        onImport={handleImport}
      />
    </div>
  );
});

export { SubcontractorsTable };
