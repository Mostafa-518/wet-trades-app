
import { useState } from 'react';
import { FormData } from '@/types/subcontract';

export function useSubcontractForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    project: '',
    subcontractor: '',
    tradeItems: [],
    responsibilities: [],
    pdfFile: null,
    pdfUrl: '',
    dateOfIssuing: undefined,
    contractType: 'subcontract',
    addendumNumber: '',
    parentSubcontractId: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const steps = [
    'Project & Subcontractor',
    'Trade & Items',
    'Responsibilities',
    'Documents & Review'
  ];

  const handleNext = (validateStep: () => boolean) => {
    // Current step validation
    if (validateStep()) {
      // Step validation passed, moving to next step
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else {
      // Step validation failed
    }
  };

  const handlePrev = () => {
    // Moving to previous step
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getTotalAmount = () => {
    const total = formData.tradeItems.reduce((sum, item) => sum + item.total, 0);
    // Calculated total amount
    return total;
  };

  return {
    currentStep,
    formData,
    setFormData,
    isSaving,
    setIsSaving,
    steps,
    handleNext,
    handlePrev,
    getTotalAmount
  };
}
