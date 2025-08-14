
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertService } from '@/services/alertService';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export function useAlerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertService.getWithDetails(),
    staleTime: 0, // Always consider data stale for immediate refresh
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['alerts', 'unread-count'],
    queryFn: () => alertService.getUnreadCount(),
    staleTime: 0, // Always consider data stale for immediate refresh
  });

  // Setup real-time subscription for alerts (replaces polling)
  useRealtimeSubscription({
    table: 'alerts',
    queryKeys: [['alerts'], ['alerts', 'unread-count']],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => alertService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alerts', 'unread-count'] });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to mark alert as read", 
        variant: "destructive" 
      });
    },
  });

  const markAsDismissedMutation = useMutation({
    mutationFn: (id: string) => alertService.markAsDismissed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alerts', 'unread-count'] });
      toast({ title: "Alert dismissed" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to dismiss alert", 
        variant: "destructive" 
      });
    },
  });

  return {
    alerts,
    unreadCount,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAsDismissed: markAsDismissedMutation.mutate,
  };
}
