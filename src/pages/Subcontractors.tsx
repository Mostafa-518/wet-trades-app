import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubcontractorsTable } from '@/components/SubcontractorsTable';
import { SubcontractorForm } from '@/components/SubcontractorForm';
import { Subcontractor, SubcontractorFormData } from '@/types/subcontractor';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function Subcontractors() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingSubcontractor, setEditingSubcontractor] = useState<Subcontractor | null>(null);
  
  const { addSubcontractor, updateSubcontractor, deleteSubcontractor } = useData();
  const { toast } = useToast();
  const { profile } = useAuth();
  const canModify = profile?.role !== 'viewer';

  const handleCreateNew = () => {
    if (!canModify) return;
    setEditingSubcontractor(null);
    setShowForm(true);
  };

  const handleViewDetail = (subcontractorId: string) => {
    navigate(`/subcontractors/${subcontractorId}`);
  };

  const handleEdit = (subcontractor: Subcontractor) => {
    if (!canModify) return;
    setEditingSubcontractor(subcontractor);
    setShowForm(true);
  };

  const handleDelete = (subcontractorId: string) => {
    if (!canModify) return;
    deleteSubcontractor(subcontractorId);
    toast({
      title: "Subcontractor deleted",
      description: "The subcontractor has been removed successfully."
    });
  };

  const handleSave = (data: SubcontractorFormData) => {
    if (editingSubcontractor) {
      updateSubcontractor(editingSubcontractor.id, data);
      toast({
        title: "Subcontractor updated",
        description: "The subcontractor has been updated successfully."
      });
    } else {
      addSubcontractor(data);
      toast({
        title: "Subcontractor created",
        description: "A new subcontractor has been created successfully."
      });
    }
    setShowForm(false);
    setEditingSubcontractor(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSubcontractor(null);
  };

  if (showForm) {
    return (
      <SubcontractorForm
        subcontractor={editingSubcontractor}
        onSubmit={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <SubcontractorsTable 
      onCreateNew={canModify ? handleCreateNew : undefined}
      onViewDetail={handleViewDetail}
      onEdit={canModify ? handleEdit : undefined}
      onDelete={canModify ? handleDelete : undefined}
    />
  );
}
