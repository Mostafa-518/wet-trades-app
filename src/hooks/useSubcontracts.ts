import { useQuery } from '@tanstack/react-query';
import { subcontractService } from '@/services';
import { Subcontract } from '@/types/subcontract';
import { useToast } from '@/hooks/use-toast';
import { mapSubcontractToFrontend } from '@/utils/subcontract';
import {
  createSubcontractWithTradeItems,
  updateSubcontractWithTradeItems,
  deleteSubcontractWithTradeItems,
  deleteManySubcontractsWithTradeItems
} from '@/services/subcontract';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export function useSubcontracts(trades: any[] = [], tradeItems: any[] = [], responsibilities: any[] = [], projects: any[] = []) {
  const { toast } = useToast();

  const { data: subcontractsRaw = [], refetch: refetchSubcontracts, isLoading: subcontractsLoading } = useQuery({
    queryKey: ['subcontracts'],
    queryFn: async () => {
      console.log('Fetching subcontracts from database...');
      const data = await subcontractService.getWithTradeItems();
      console.log('Raw subcontracts from database:', data);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Setup real-time subscription for subcontracts and related tables
  useRealtimeSubscription({
    table: 'subcontracts',
    queryKeys: [['subcontracts']],
  });

  useRealtimeSubscription({
    table: 'subcontract_trade_items',
    queryKeys: [['subcontracts']],
  });

  useRealtimeSubscription({
    table: 'subcontract_responsibilities',
    queryKeys: [['subcontracts']],
  });

  // Map database fields to frontend expected format
  const subcontracts = subcontractsRaw.map(mapSubcontractToFrontend);

  const addSubcontract = async (data: Partial<Subcontract>) => {
    console.log('Adding subcontract with data:', data);
    try {
      const result = await createSubcontractWithTradeItems(data, trades, tradeItems, toast, responsibilities, subcontracts, projects);
      console.log('Subcontract created successfully, refetching data...');
      await refetchSubcontracts();
      toast({ title: "Success", description: "Subcontract created successfully" });
      return result;
    } catch (error) {
      console.error('Error adding subcontract:', error);
      // Don't show duplicate toast since createSubcontractWithTradeItems already shows error toasts
      throw error;
    }
  };

  const updateSubcontract = async (id: string, data: Partial<Subcontract>) => {
    try {
      await updateSubcontractWithTradeItems(id, data, trades, tradeItems, responsibilities);
      await refetchSubcontracts();
      toast({ title: "Success", description: "Subcontract updated successfully" });
    } catch (error) {
      console.error('Error updating subcontract:', error);
      toast({ title: "Error", description: "Failed to update subcontract", variant: "destructive" });
      throw error;
    }
  };

  const deleteSubcontract = async (id: string) => {
    try {
      await deleteSubcontractWithTradeItems(id);
      await refetchSubcontracts();
      toast({ title: "Success", description: "Subcontract deleted successfully" });
    } catch (error) {
      console.error('Error deleting subcontract:', error);
      toast({ title: "Error", description: "Failed to delete subcontract", variant: "destructive" });
      throw error;
    }
  };

  const deleteManySubcontracts = async (ids: string[]) => {
    try {
      await deleteManySubcontractsWithTradeItems(ids);
      await refetchSubcontracts();
      toast({ title: "Deleted", description: "Subcontracts deleted successfully" });
    } catch (error) {
      console.error('Error bulk deleting subcontracts:', error);
      toast({ title: "Error", description: "Failed to delete selected subcontracts", variant: "destructive" });
      throw error;
    }
  };

  console.log('Final mapped subcontracts:', subcontracts);

  return {
    subcontracts,
    addSubcontract,
    updateSubcontract,
    deleteSubcontract,
    deleteManySubcontracts,
    isLoading: subcontractsLoading
  };
}
