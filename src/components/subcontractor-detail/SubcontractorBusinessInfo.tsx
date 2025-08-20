
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { Subcontractor } from '@/types/subcontractor';
import { usePermissions } from '@/hooks/usePermissions';
import { logSensitiveDataAccess } from '@/utils/security/dataAccessLogger';

interface SubcontractorBusinessInfoProps {
  subcontractor: Subcontractor;
}

export function SubcontractorBusinessInfo({ subcontractor }: SubcontractorBusinessInfoProps) {
  const { hasPermission } = usePermissions();
  const canViewSensitiveData = hasPermission('manage_users') || hasPermission('manage_subcontractors');

  useEffect(() => {
    // Log access to sensitive business information
    logSensitiveDataAccess('subcontractors', subcontractor.id, 'view', {
      access_type: 'business_info_view',
      sensitive_fields: ['commercial_registration', 'tax_card_no']
    });
  }, [subcontractor.id]);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Business Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <div className="font-medium">Commercial Registration</div>
          <div className="text-muted-foreground">
            {canViewSensitiveData 
              ? (subcontractor.commercialRegistration || 'Not provided')
              : '••••••••••••••••'
            }
          </div>
        </div>
        <div>
          <div className="font-medium">Tax Card No.</div>
          <div className="text-muted-foreground">
            {canViewSensitiveData 
              ? (subcontractor.taxCardNo || 'Not provided')
              : '••••••••••••••••'
            }
          </div>
        </div>
        <div>
          <div className="font-medium">Registration Date</div>
          <div className="text-muted-foreground">{new Date(subcontractor.registrationDate).toLocaleDateString()}</div>
        </div>
      </CardContent>
    </Card>
  );
}
