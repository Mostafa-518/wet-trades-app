
import React from 'react';
import { FormData } from '@/types/subcontract';
import { useData } from '@/contexts/DataContext';

interface ContractTypeSelectorProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export function ContractTypeSelector({ formData, setFormData }: ContractTypeSelectorProps) {
  const { subcontracts } = useData();

  const getAddendumPreview = () => {
    if (formData.contractType === 'ADD' && formData.parentSubcontractId) {
      const parentContract = Array.isArray(subcontracts) 
        ? subcontracts.find(sc => sc.id === formData.parentSubcontractId)
        : null;
      
      if (parentContract) {
        // Find existing addendums for this parent
        const existingAddendums = Array.isArray(subcontracts)
          ? subcontracts.filter(sc => 
              sc.parentSubcontractId === formData.parentSubcontractId && 
              sc.contractType === 'ADD'
            )
          : [];
        
        const nextNumber = (existingAddendums.length + 1).toString().padStart(2, '0');
        return `${parentContract.contractId}-ADD${nextNumber}`;
      }
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <label className="block font-medium mb-1">Type of Contract</label>
        <select
          className="border rounded px-3 py-2 w-full"
          value={formData.contractType}
          onChange={e =>
            setFormData(prev => ({
              ...prev,
              contractType: e.target.value as 'subcontract' | 'ADD',
              ...(e.target.value === 'ADD'
                ? {}
                : { addendumNumber: '', parentSubcontractId: '' })
            }))
          }
        >
          <option value="subcontract">Subcontract</option>
          <option value="ADD">Addendum</option>
        </select>
      </div>
      {formData.contractType === 'ADD' && (
        <div>
          <label className="block font-medium mb-1">Parent Subcontract *</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={formData.parentSubcontractId || ''}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                parentSubcontractId: e.target.value
              }))
            }
            required={formData.contractType === 'ADD'}
          >
            <option value="">Select parent subcontract...</option>
            {Array.isArray(subcontracts)
              ? subcontracts
                  .filter(sc => sc.contractType === 'subcontract') // Only allow "main" contracts
                  .map(sc => (
                    <option key={sc.id} value={sc.id}>
                      {sc.contractId} - {sc.description}
                    </option>
                  ))
              : null}
          </select>
          {getAddendumPreview() && (
            <p className="text-sm text-blue-600 mt-1 font-medium">
              Generated ID will be: {getAddendumPreview()}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Format: [parent-contract-number]-ADDXX (e.g., ID-0504-0001-ADD01)
          </p>
        </div>
      )}
    </div>
  );
}
