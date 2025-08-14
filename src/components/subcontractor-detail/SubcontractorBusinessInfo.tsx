
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { Subcontractor } from '@/types/subcontractor';

interface SubcontractorBusinessInfoProps {
  subcontractor: Subcontractor;
}

export function SubcontractorBusinessInfo({ subcontractor }: SubcontractorBusinessInfoProps) {
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
          <div className="text-muted-foreground">{subcontractor.commercialRegistration}</div>
        </div>
        <div>
          <div className="font-medium">Tax Card No.</div>
          <div className="text-muted-foreground">{subcontractor.taxCardNo}</div>
        </div>
        <div>
          <div className="font-medium">Registration Date</div>
          <div className="text-muted-foreground">{new Date(subcontractor.registrationDate).toLocaleDateString()}</div>
        </div>
      </CardContent>
    </Card>
  );
}
