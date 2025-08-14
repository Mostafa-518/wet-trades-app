
import React from 'react';
import { AlertCard } from '@/components/AlertCard';
import { useAlerts } from '@/hooks/useAlerts';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export function Alerts() {
  const { alerts, isLoading, markAsRead, markAsDismissed } = useAlerts();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
    queryClient.invalidateQueries({ queryKey: ['alerts', 'unread-count'] });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Alerts</h2>
          <p className="text-muted-foreground">Loading alerts...</p>
        </div>
      </div>
    );
  }

  const unreadAlerts = alerts.filter(alert => !alert.is_read);
  const readAlerts = alerts.filter(alert => alert.is_read);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alerts</h2>
          <p className="text-muted-foreground">
            System notifications and warnings
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No alerts</h3>
          <p className="text-muted-foreground">You're all caught up! No alerts to display.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {unreadAlerts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Unread Alerts ({unreadAlerts.length})
              </h3>
              <div className="space-y-3">
                {unreadAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onMarkAsRead={markAsRead}
                    onDismiss={markAsDismissed}
                  />
                ))}
              </div>
            </div>
          )}

          {readAlerts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Read Alerts ({readAlerts.length})
              </h3>
              <div className="space-y-3">
                {readAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onMarkAsRead={markAsRead}
                    onDismiss={markAsDismissed}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
