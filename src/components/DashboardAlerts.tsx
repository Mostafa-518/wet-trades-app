
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Eye } from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';
import { useNavigate } from 'react-router-dom';

export function DashboardAlerts() {
  const { alerts, unreadCount, markAsRead } = useAlerts();
  const navigate = useNavigate();

  const recentAlerts = alerts.slice(0, 3); // Show only 3 most recent alerts

  if (unreadCount === 0) {
    return null; // Don't show the component if no unread alerts
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          System Alerts
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/alerts')}
        >
          View All ({unreadCount})
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border ${
              !alert.is_read ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{alert.title}</h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {alert.message}
                </p>
                {alert.total_amount && (
                  <p className="text-xs text-gray-500 mt-1">
                    Amount: EGP {alert.total_amount.toLocaleString()}
                  </p>
                )}
              </div>
              {!alert.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsRead(alert.id)}
                  className="h-6 w-6 p-0 ml-2"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
        {alerts.length > 3 && (
          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/alerts')}
              className="text-xs"
            >
              View {alerts.length - 3} more alerts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
