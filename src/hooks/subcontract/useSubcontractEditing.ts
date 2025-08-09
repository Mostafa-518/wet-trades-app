
import { useState } from 'react';

export function useSubcontractEditing(updateSubcontract: (id: string, data: any) => Promise<void>) {
  const [editingSubcontract, setEditingSubcontract] = useState<any>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const handleEdit = (subcontract: any) => {
    setEditingSubcontract(subcontract);
  };

  const handleSaveEdit = async (id: string, data: any) => {
    await updateSubcontract(id, data);
    setEditingSubcontract(null);
  };

  return {
    editingSubcontract,
    showAdvancedSearch,
    handleEdit,
    handleSaveEdit,
    setEditingSubcontract,
    setShowAdvancedSearch,
  };
}
