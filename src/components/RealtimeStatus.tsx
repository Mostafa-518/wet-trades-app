import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { RealtimeChannel } from '@supabase/supabase-js';

export function RealtimeStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('CLOSED');

  useEffect(() => {
    let statusChannel: RealtimeChannel;

    const setupStatusSubscription = () => {
      statusChannel = supabase
        .channel('realtime-status')
        .subscribe((status) => {
          console.log('Real-time connection status:', status);
          setConnectionStatus(status);
          setIsConnected(status === 'SUBSCRIBED');
        });
    };

    setupStatusSubscription();

    return () => {
      if (statusChannel) {
        supabase.removeChannel(statusChannel);
      }
    };
  }, []);

  if (!isConnected && connectionStatus !== 'CLOSED') {
    return (
      <Badge variant="outline" className="text-orange-600 border-orange-200">
        Connecting...
      </Badge>
    );
  }

  return (
    <Badge 
      variant={isConnected ? "default" : "destructive"}
      className={isConnected ? "bg-green-100 text-green-800 border-green-200" : ""}
    >
      {isConnected ? "Live Updates Active" : "Offline"}
    </Badge>
  );
}