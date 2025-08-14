
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface StepperNavigationProps {
  currentStep: number;
  stepsCount: number;
  isSaving: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSave: () => void;
}

export function StepperNavigation({
  currentStep,
  stepsCount,
  isSaving,
  onPrev,
  onNext,
  onSave,
}: StepperNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <Button
        variant="outline"
        onClick={onPrev}
        disabled={currentStep === 1 || isSaving}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Previous
      </Button>

      {currentStep < stepsCount ? (
        <Button onClick={onNext} className="flex items-center gap-2" disabled={isSaving}>
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button onClick={onSave} className="bg-green-600 hover:bg-green-700" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Subcontract"}
        </Button>
      )}
    </div>
  );
}
