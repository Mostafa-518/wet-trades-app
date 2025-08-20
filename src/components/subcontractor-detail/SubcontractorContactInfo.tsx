
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, User } from 'lucide-react';
import { Subcontractor } from '@/types/subcontractor';
import { usePermissions } from '@/hooks/usePermissions';
import { logSensitiveDataAccess } from '@/utils/security/dataAccessLogger';

interface SubcontractorContactInfoProps {
  subcontractor: Subcontractor;
}

export function SubcontractorContactInfo({ subcontractor }: SubcontractorContactInfoProps) {
  const { hasPermission } = usePermissions();
  const canViewSensitiveData = hasPermission('manage_users') || hasPermission('manage_subcontractors');

  useEffect(() => {
    // Log access to sensitive contact information
    logSensitiveDataAccess('subcontractors', subcontractor.id, 'view', {
      access_type: 'contact_info_view',
      sensitive_fields: ['email', 'phone']
    });
  }, [subcontractor.id]);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="font-semibold">{subcontractor.representativeName}</div>
          <div className="text-sm text-muted-foreground">Representative</div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>
              {canViewSensitiveData 
                ? (subcontractor.phone || 'Not provided')
                : '•••••••••••'
              }
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>
              {canViewSensitiveData 
                ? (subcontractor.email || 'Not provided')
                : '••••••@••••••.com'
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
