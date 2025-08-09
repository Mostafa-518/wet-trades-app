
import { useQuery } from '@tanstack/react-query';
import { tradeService } from '@/services';
import { TradeFormData } from '@/types/trade';
import { useToast } from '@/hooks/use-toast';

export function useTrades() {
  const { toast } = useToast();

  const { data: tradesRaw = [], refetch: refetchTrades, isLoading: tradesLoading } = useQuery({
    queryKey: ['trades'],
    queryFn: () => tradeService.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  const addTrade = async (data: TradeFormData): Promise<void> => {
    try {
      await tradeService.create({
        name: data.name,
        category: data.category,
        description: data.description
      });
      refetchTrades();
      toast({
        title: "Success",
        description: "Trade created successfully",
      });
    } catch (error) {
      console.error('Error adding trade:', error);
      toast({
        title: "Error",
        description: "Failed to add trade",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTrade = async (id: string, data: TradeFormData): Promise<void> => {
    try {
      await tradeService.update(id, {
        name: data.name,
        category: data.category,
        description: data.description
      });
      refetchTrades();
      toast({
        title: "Success",
        description: "Trade updated successfully",
      });
    } catch (error) {
      console.error('Error updating trade:', error);
      toast({
        title: "Error",
        description: "Failed to update trade",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTrade = async (id: string): Promise<void> => {
    try {
      await tradeService.delete(id);
      refetchTrades();
      toast({
        title: "Success",
        description: "Trade deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting trade:', error);
      toast({
        title: "Error",
        description: "Failed to delete trade",
        variant: "destructive"
      });
      throw error;
    }
  };

  const bulkDeleteTrades = async (ids: string[]): Promise<void> => {
    try {
      await Promise.all(ids.map(id => tradeService.delete(id)));
      refetchTrades();
      toast({
        title: "Success",
        description: `${ids.length} trades deleted successfully`,
      });
    } catch (error) {
      console.error('Error bulk deleting trades:', error);
      toast({
        title: "Error",
        description: "Failed to delete trades",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    trades: tradesRaw.map(t => ({
      ...t,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      created_at: t.created_at,
      updated_at: t.updated_at
    })),
    addTrade,
    updateTrade,
    deleteTrade,
    bulkDeleteTrades,
    isLoading: tradesLoading
  };
}
