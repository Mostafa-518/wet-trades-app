import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type DatabaseEvent = 'INSERT' | 'UPDATE' | 'DELETE';

interface RealtimeSubscriptionConfig {
  table: string;
  queryKeys: string[][];
  events?: DatabaseEvent[];
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export function useRealtimeSubscription({
  table,
  queryKeys,
  events = ['INSERT', 'UPDATE', 'DELETE'],
  onInsert,
  onUpdate,
  onDelete
}: RealtimeSubscriptionConfig) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // Create a unique channel name for this subscription
    const channelName = `realtime-${table}-${Date.now()}`;
    
    console.log(`Setting up real-time subscription for table: ${table}`);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table
        },
        (payload) => {
          console.log(`Real-time event for ${table}:`, payload);
          
          // Invalidate relevant queries to trigger refetch
          queryKeys.forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey });
          });

          // Call specific event handlers
          switch (payload.eventType) {
            case 'INSERT':
              onInsert?.(payload);
              break;
            case 'UPDATE':
              onUpdate?.(payload);
              break;
            case 'DELETE':
              onDelete?.(payload);
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log(`Real-time subscription status for ${table}:`, status);
      });

    channelRef.current = channel;

    // Cleanup function
    return () => {
      console.log(`Cleaning up real-time subscription for table: ${table}`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, queryClient, onInsert, onUpdate, onDelete]);

  return {
    isConnected: channelRef.current?.state === 'joined'
  };
}