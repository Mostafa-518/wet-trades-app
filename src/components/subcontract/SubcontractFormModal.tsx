
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { FormData } from '@/types/subcontract';
import { StepperProgress } from '@/components/subcontract/StepperProgress';
import { StepperNavigation } from '@/components/subcontract/StepperNavigation';

interface SubcontractFormModalProps {
  formData: FormData;
  currentStep: number;
  steps: string[];
  isSaving: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSave: () => void;
  children: React.ReactNode;
}

export function SubcontractFormModal({
  formData,
  currentStep,
  steps,
  isSaving,
  onClose,
  onPrev,
  onNext,
  onSave,
  children
}: SubcontractFormModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Create New {formData.contractType === 'ADD' ? 'Addendum' : 'Subcontract'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <StepperProgress steps={steps} currentStep={currentStep} />
        </CardHeader>
        <CardContent className="space-y-6">
          {children}
          <StepperNavigation
            currentStep={currentStep}
            stepsCount={steps.length}
            isSaving={isSaving}
            onPrev={onPrev}
            onNext={onNext}
            onSave={onSave}
          />
        </CardContent>
      </Card>
    </div>
  );
}
