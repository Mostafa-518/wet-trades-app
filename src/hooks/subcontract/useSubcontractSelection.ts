
import { useState } from 'react';
import { Subcontract } from '@/types/subcontract';

export function useSubcontractSelection(filteredData: Subcontract[], deleteManySubcontracts: (ids: string[]) => Promise<void>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Select all toggle
  const allSelected = filteredData.length > 0 && filteredData.every(p => selectedIds.has(p.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredData.map(p => p.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleBulkDelete = async () => {
    try {
      await deleteManySubcontracts(Array.from(selectedIds));
      setSelectedIds(new Set());
    } catch (error) {
      // errors are already handled via toast
    }
  };

  return {
    selectedIds,
    allSelected,
    toggleAll,
    toggleOne,
    handleBulkDelete,
  };
}
