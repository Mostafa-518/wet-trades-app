
import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

export function useSubcontractorsTable() {
  const { subcontractors, deleteSubcontractor } = useData();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('companyName');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredSubcontractors = subcontractors.filter(subcontractor => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    switch (searchBy) {
      case 'companyName':
        return subcontractor.companyName.toLowerCase().includes(term);
      case 'commercialRegistration':
        return subcontractor.commercialRegistration.toLowerCase().includes(term);
      case 'taxCardNo':
        return subcontractor.taxCardNo.toLowerCase().includes(term);
      case 'representative':
        return subcontractor.representativeName.toLowerCase().includes(term);
      case 'email':
        return subcontractor.email.toLowerCase().includes(term);
      case 'phone':
        return subcontractor.phone.toLowerCase().includes(term);
      default:
        return true;
    }
  });

  const allSelected = filteredSubcontractors.length > 0 && filteredSubcontractors.every(s => selectedIds.has(s.id));

  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredSubcontractors.map(s => s.id)));
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
      for (const id of selectedIds) {
        await deleteSubcontractor(id);
      }
      toast({ title: "Deleted", description: "Subcontractors deleted successfully" });
      setSelectedIds(new Set());
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete selected subcontractors", variant: "destructive" });
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    searchBy,
    setSearchBy,
    selectedIds,
    setSelectedIds,
    filteredSubcontractors,
    allSelected,
    toggleAll,
    toggleOne,
    handleBulkDelete
  };
}
