
import React from 'react';

interface StepperProgressProps {
  steps: string[];
  currentStep: number;
}

export function StepperProgress({ steps, currentStep }: StepperProgressProps) {
  return (
    <div className="flex items-center justify-between mt-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            index + 1 <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            {index + 1}
          </div>
          <div className={`ml-2 text-sm ${index + 1 === currentStep ? 'font-medium' : 'text-muted-foreground'}`}>
            {step}
          </div>
          {index < steps.length - 1 && (
            <div className={`mx-4 h-0.5 w-8 ${index + 1 < currentStep ? 'bg-primary' : 'bg-muted'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
