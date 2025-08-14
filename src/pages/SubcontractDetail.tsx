
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SubcontractDetailView } from '@/components/SubcontractDetailView';
import { SubcontractEditModal } from '@/components/subcontract/SubcontractEditModal';
import { useData } from '@/contexts/DataContext';

export function SubcontractDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subcontracts, updateSubcontract } = useData();
  const [showEditModal, setShowEditModal] = useState(false);

  const handleBack = () => {
    navigate('/subcontracts');
  };

  const handleEdit = () => {
    console.log('Edit button clicked, opening modal');
    setShowEditModal(true);
  };

  const handleSaveEdit = async (subcontractId: string, data: any) => {
    console.log('Saving subcontract edit:', subcontractId, data);
    await updateSubcontract(subcontractId, data);
    setShowEditModal(false);
  };

  if (!id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Contract Not Found</h2>
        <p className="text-muted-foreground">The requested contract could not be found.</p>
      </div>
    );
  }

  // Look for subcontract by database ID instead of contractId
  const subcontract = subcontracts.find(s => s.id === id);

  if (!subcontract) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Contract Not Found</h2>
        <p className="text-muted-foreground">The requested contract could not be found.</p>
      </div>
    );
  }

  return (
    <>
      <SubcontractDetailView
        subcontract={subcontract}
        onBack={handleBack}
        onEdit={handleEdit}
      />
      
      {showEditModal && (
        <SubcontractEditModal
          subcontract={subcontract}
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
}
