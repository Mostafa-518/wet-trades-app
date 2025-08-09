
import React from 'react';
import { Subcontract } from '@/types/subcontract';
import { usePersistentFormState } from '@/hooks/persistent-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SubcontractTableSummaryProps {
  filteredData: Subcontract[];
}

interface SummarySettings {
  showCurrency: boolean;
  compactView: boolean;
}

export function SubcontractTableSummary({ filteredData }: SubcontractTableSummaryProps) {
  // Persistent settings for this component
  const {
    formValues: settings,
    getSwitchProps
  } = usePersistentFormState<SummarySettings>({
    showCurrency: true,
    compactView: false
  }, {
    customKey: 'subcontract-summary-settings'
  });

  const formatCurrency = (amount: number) => {
    if (!settings.showCurrency) {
      return amount.toLocaleString();
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalValue = filteredData.reduce((sum, item) => sum + item.totalValue, 0);
  const activeContracts = filteredData.filter(item => item.status === 'active').length;

  if (settings.compactView) {
    return (
      <Card className="p-2">
        <CardContent className="p-2">
          <div className="flex justify-between items-center text-sm">
            <span>{filteredData.length} Contracts</span>
            <span className="font-semibold text-green-600">{formatCurrency(totalValue)}</span>
            <span>{activeContracts} Active</span>
            <div className="flex items-center gap-2">
              <Switch {...getSwitchProps('compactView')} />
              <Label className="text-xs">Compact</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Contract Summary</span>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Switch {...getSwitchProps('showCurrency')} />
              <Label>Show Currency</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch {...getSwitchProps('compactView')} />
              <Label>Compact View</Label>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{filteredData.length}</div>
            <div className="text-sm text-muted-foreground">Total Contracts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalValue)}
            </div>
            <div className="text-sm text-muted-foreground">Total Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {activeContracts}
            </div>
            <div className="text-sm text-muted-foreground">Active Contracts</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
