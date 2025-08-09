
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, FileText, Building2 } from 'lucide-react';

interface SubcontractorOverviewCardsProps {
  totalContractValue: number;
  totalProjects: number;
  currentProjects: number;
}

export function SubcontractorOverviewCards({ 
  totalContractValue, 
  totalProjects, 
  currentProjects 
}: SubcontractorOverviewCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalContractValue)}
              </div>
              <div className="text-sm text-muted-foreground">Total Contract Value</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {totalProjects}
              </div>
              <div className="text-sm text-muted-foreground">Total Projects</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {currentProjects}
              </div>
              <div className="text-sm text-muted-foreground">Active Projects</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
