
import { useToast } from '@/hooks/use-toast';
import { FormData } from '@/types/subcontract';

export function useSubcontractValidation() {
  const { toast } = useToast();

  const validateStep = (currentStep: number, formData: FormData) => {
    switch (currentStep) {
      case 1:
        // Validating step 1
        if (!formData.project || !formData.subcontractor) {
          toast({
            title: "Missing Information",
            description: "Please select both project and subcontractor",
            variant: "destructive"
          });
          return false;
        }
        
        // Additional validation for addendum
        if (formData.contractType === 'ADD' && !formData.parentSubcontractId) {
          toast({
            title: "Missing Parent Contract",
            description: "Please select a parent subcontract for this addendum",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 2:
        if (formData.tradeItems.length === 0) {
          toast({
            title: "Missing Information",
            description: "Please add at least one trade item",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 3:
        // Responsibilities are now optional - no validation needed
        return true;
      default:
        return true;
    }
  };

  const validateFinalSave = (formData: FormData) => {
    if (!formData.project || !formData.subcontractor) {
      toast({
        title: "Invalid Data",
        description: "Project and subcontractor must be selected",
        variant: "destructive"
      });
      return false;
    }

    // Additional validation for addendum
    if (formData.contractType === 'ADD' && !formData.parentSubcontractId) {
      toast({
        title: "Invalid Addendum",
        description: "Parent subcontract must be selected for addendum",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  return {
    validateStep,
    validateFinalSave
  };
}
