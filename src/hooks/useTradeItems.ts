
import { useQuery } from '@tanstack/react-query';
import { tradeItemService } from '@/services';
import { TradeItemFormData } from '@/types/trade';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export function useTradeItems() {
  const { toast } = useToast();

  const { data: tradeItemsRaw = [], refetch: refetchTradeItems, isLoading: tradeItemsLoading } = useQuery({
    queryKey: ['tradeItems'],
    queryFn: () => tradeItemService.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  // Setup real-time subscription for trade items
  useRealtimeSubscription({
    table: 'trade_items',
    queryKeys: [['tradeItems']],
  });

  const addTradeItem = async (data: TradeItemFormData): Promise<void> => {
    try {
      await tradeItemService.create({
        trade_id: data.trade_id,
        name: data.name,
        unit: data.unit,
        description: data.description
      });
      refetchTradeItems();
      toast({
        title: "Success",
        description: "Trade item created successfully",
      });
    } catch (error) {
      console.error('Error adding trade item:', error);
      toast({
        title: "Error",
        description: "Failed to add trade item",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTradeItem = async (id: string, data: TradeItemFormData): Promise<void> => {
    try {
      await tradeItemService.update(id, {
        trade_id: data.trade_id,
        name: data.name,
        unit: data.unit,
        description: data.description
      });
      refetchTradeItems();
      toast({
        title: "Success",
        description: "Trade item updated successfully",
      });
    } catch (error) {
      console.error('Error updating trade item:', error);
      toast({
        title: "Error",
        description: "Failed to update trade item",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTradeItem = async (id: string): Promise<void> => {
    try {
      await tradeItemService.delete(id);
      refetchTradeItems();
      toast({
        title: "Success",
        description: "Trade item deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting trade item:', error);
      toast({
        title: "Error",
        description: "Failed to delete trade item",
        variant: "destructive"
      });
      throw error;
    }
  };

  const bulkDeleteTradeItems = async (ids: string[]): Promise<void> => {
    try {
      await Promise.all(ids.map(id => tradeItemService.delete(id)));
      refetchTradeItems();
      toast({
        title: "Success",
        description: `${ids.length} trade items deleted successfully`,
      });
    } catch (error) {
      console.error('Error bulk deleting trade items:', error);
      toast({
        title: "Error",
        description: "Failed to delete trade items",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    tradeItems: tradeItemsRaw.map(ti => ({
      ...ti,
      createdAt: ti.created_at,
      updatedAt: ti.updated_at,
      created_at: ti.created_at,
      updated_at: ti.updated_at
    })),
    addTradeItem,
    updateTradeItem,
    deleteTradeItem,
    bulkDeleteTradeItems,
    isLoading: tradeItemsLoading
  };
}
