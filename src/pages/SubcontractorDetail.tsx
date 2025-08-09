
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SubcontractorDetailView } from '@/components/SubcontractorDetailView';
import { SubcontractorForm } from '@/components/SubcontractorForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useData } from '@/contexts/DataContext';
import { SubcontractorFormData } from '@/types/subcontractor';
import { useToast } from '@/hooks/use-toast';

export function SubcontractorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subcontractors, updateSubcontractor } = useData();
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();

  const handleBack = () => {
    navigate('/subcontractors');
  };

  const handleEdit = () => {
    console.log('Edit button clicked, opening modal');
    setShowEditModal(true);
  };

  const handleSaveEdit = async (data: SubcontractorFormData) => {
    console.log('Saving subcontractor edit:', id, data);
    if (id) {
      await updateSubcontractor(id, data);
      toast({
        title: "Subcontractor updated",
        description: "The subcontractor has been updated successfully."
      });
      setShowEditModal(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
  };

  if (!id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Subcontractor Not Found</h2>
        <p className="text-muted-foreground">The requested subcontractor could not be found.</p>
      </div>
    );
  }

  const subcontractor = subcontractors.find(s => s.id === id);

  if (!subcontractor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Subcontractor Not Found</h2>
        <p className="text-muted-foreground">The requested subcontractor could not be found.</p>
      </div>
    );
  }

  return (
    <>
      <SubcontractorDetailView
        subcontractor={subcontractor}
        onBack={handleBack}
        onEdit={handleEdit}
      />
      
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <SubcontractorForm
            subcontractor={subcontractor}
            onSubmit={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
