
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, X, Eye } from 'lucide-react';
import { Alert } from '@/types/alert';
import { formatDistance } from 'date-fns';

interface AlertCardProps {
  alert: Alert & {
    projects?: { name: string; code: string } | null;
    subcontractors?: { company_name: string; representative_name: string } | null;
  };
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function AlertCard({ alert, onMarkAsRead, onDismiss }: AlertCardProps) {
  const timeAgo = formatDistance(new Date(alert.created_at), new Date(), { addSuffix: true });

  return (
    <Card className={`${!alert.is_read ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{alert.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {alert.type.replace('_', ' ').toUpperCase()}
                </Badge>
                {alert.projects && (
                  <Badge variant="secondary" className="text-xs">
                    {alert.projects.name}
                  </Badge>
                )}
                <span className="text-xs text-gray-500">{timeAgo}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            {!alert.is_read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(alert.id)}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(alert.id)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {alert.total_amount && (
        <CardContent className="pt-0">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Total Amount: </span>
            EGP {alert.total_amount.toLocaleString()}
            {alert.threshold_amount && (
              <>
                <span className="mx-2">•</span>
                <span className="font-medium">Threshold: </span>
                EGP {alert.threshold_amount.toLocaleString()}
              </>
            )}
          </div>
          {alert.subcontractors && (
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Subcontractor: </span>
              {alert.subcontractors.company_name}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
