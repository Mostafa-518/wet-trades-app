
import { useQuery } from '@tanstack/react-query';
import { subcontractorService } from '@/services';
import { SubcontractorFormData } from '@/types/subcontractor';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export function useSubcontractors() {
  const { toast } = useToast();

  const { data: subcontractors = [], refetch: refetchSubcontractors, isLoading: subcontractorsLoading } = useQuery({
    queryKey: ['subcontractors'],
    queryFn: () => subcontractorService.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  // Setup real-time subscription for subcontractors
  useRealtimeSubscription({
    table: 'subcontractors',
    queryKeys: [['subcontractors']],
  });

  const addSubcontractor = async (data: SubcontractorFormData): Promise<void> => {
    try {
      await subcontractorService.create({
        company_name: data.companyName,
        representative_name: data.representativeName,
        commercial_registration: data.commercialRegistration,
        tax_card_no: data.taxCardNo,
        email: data.email,
        phone: data.phone
      });
      refetchSubcontractors();
      toast({
        title: "Success",
        description: "Subcontractor created successfully",
      });
    } catch (error) {
      console.error('Error adding subcontractor:', error);
      toast({
        title: "Error",
        description: "Failed to add subcontractor",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateSubcontractor = async (id: string, data: SubcontractorFormData): Promise<void> => {
    try {
      await subcontractorService.update(id, {
        company_name: data.companyName,
        representative_name: data.representativeName,
        commercial_registration: data.commercialRegistration,
        tax_card_no: data.taxCardNo,
        email: data.email,
        phone: data.phone
      });
      refetchSubcontractors();
      toast({
        title: "Success",
        description: "Subcontractor updated successfully",
      });
    } catch (error) {
      console.error('Error updating subcontractor:', error);
      toast({
        title: "Error",
        description: "Failed to update subcontractor",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteSubcontractor = async (id: string): Promise<void> => {
    try {
      await subcontractorService.delete(id);
      refetchSubcontractors();
      toast({
        title: "Success",
        description: "Subcontractor deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting subcontractor:', error);
      toast({
        title: "Error",
        description: "Failed to delete subcontractor",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    subcontractors: subcontractors.map(s => ({
      id: s.id,
      name: s.company_name || 'Unnamed Company',
      companyName: s.company_name || 'Unnamed Company',
      representativeName: s.representative_name || '',
      commercialRegistration: s.commercial_registration || '',
      taxCardNo: s.tax_card_no || '',
      email: s.email || '',
      phone: s.phone || '',
      status: 'active' as const,
      totalProjects: 0,
      currentProjects: 0,
      registrationDate: s.created_at,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    })),
    addSubcontractor,
    updateSubcontractor,
    deleteSubcontractor,
    isLoading: subcontractorsLoading
  };
}
