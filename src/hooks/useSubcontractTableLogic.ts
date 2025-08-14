
import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useSubcontractHelpers } from './subcontract/useSubcontractHelpers';
import { useSubcontractSearch } from './subcontract/useSubcontractSearch';
import { useSubcontractSelection } from './subcontract/useSubcontractSelection';
import { useSubcontractEditing } from './subcontract/useSubcontractEditing';
import { useSubcontractFiltering } from './subcontract/useSubcontractFiltering';

export function useSubcontractTableLogic(reportFilters?: any) {
  const { subcontracts, updateSubcontract, deleteSubcontract, deleteManySubcontracts, isLoading } = useData();
  
  const { getProjectName, getProjectCode, getSubcontractorName } = useSubcontractHelpers();
  
  // Apply report filters if provided - memoize to prevent unnecessary recalculations
  const preFilteredSubcontracts = useSubcontractFiltering(subcontracts, reportFilters);
  
  const {
    searchTerm,
    filteredData,
    handleSimpleSearch,
    handleAdvancedSearch,
  } = useSubcontractSearch(preFilteredSubcontracts);

  const {
    selectedIds,
    allSelected,
    toggleAll,
    toggleOne,
    handleBulkDelete,
  } = useSubcontractSelection(filteredData, deleteManySubcontracts);

  const {
    editingSubcontract,
    showAdvancedSearch,
    handleEdit,
    handleSaveEdit,
    setEditingSubcontract,
    setShowAdvancedSearch,
  } = useSubcontractEditing(updateSubcontract);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    subcontracts: preFilteredSubcontracts,
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
    setShowAdvancedSearch,
  }), [
    preFilteredSubcontracts,
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
    setShowAdvancedSearch,
  ]);
}
