
import { useQuery } from '@tanstack/react-query';
import { responsibilityService } from '@/services';
import { Responsibility } from '@/types/responsibility';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export function useResponsibilities() {
  const { toast } = useToast();

  const { data: responsibilities = [], refetch: refetchResponsibilities, isLoading: responsibilitiesLoading } = useQuery({
    queryKey: ['responsibilities'],
    queryFn: () => responsibilityService.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  // Setup real-time subscription for responsibilities
  useRealtimeSubscription({
    table: 'responsibilities',
    queryKeys: [['responsibilities']],
  });

  const addResponsibility = async (data: Partial<Responsibility>): Promise<void> => {
    try {
      await responsibilityService.create({
        name: data.name!,
        description: data.description,
        category: data.category
      });
      refetchResponsibilities();
      toast({
        title: "Success",
        description: "Responsibility created successfully",
      });
    } catch (error) {
      console.error('Error adding responsibility:', error);
      toast({
        title: "Error",
        description: "Failed to add responsibility",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateResponsibility = async (id: string, data: Partial<Responsibility>): Promise<void> => {
    try {
      await responsibilityService.update(id, {
        name: data.name,
        description: data.description,
        category: data.category
      });
      refetchResponsibilities();
      toast({
        title: "Success",
        description: "Responsibility updated successfully",
      });
    } catch (error) {
      console.error('Error updating responsibility:', error);
      toast({
        title: "Error",
        description: "Failed to update responsibility",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteResponsibility = async (id: string): Promise<void> => {
    try {
      await responsibilityService.delete(id);
      refetchResponsibilities();
      toast({
        title: "Success",
        description: "Responsibility deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting responsibility:', error);
      toast({
        title: "Error",
        description: "Failed to delete responsibility",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    responsibilities: responsibilities.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description || '',
      category: r.category || '',
      isActive: true,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    })),
    addResponsibility,
    updateResponsibility,
    deleteResponsibility,
    isLoading: responsibilitiesLoading
  };
}
