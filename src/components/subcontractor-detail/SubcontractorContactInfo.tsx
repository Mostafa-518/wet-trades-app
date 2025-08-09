
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, User } from 'lucide-react';
import { Subcontractor } from '@/types/subcontractor';

interface SubcontractorContactInfoProps {
  subcontractor: Subcontractor;
}

export function SubcontractorContactInfo({ subcontractor }: SubcontractorContactInfoProps) {
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
            <span>{subcontractor.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{subcontractor.email}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
