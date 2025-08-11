
import React, { useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ResponsibilitiesStepProps {
  selectedResponsibilities: string[];
  onResponsibilitiesChange: (responsibilities: string[]) => void;
  responsibilities: any[];
}

export function ResponsibilitiesStep({ selectedResponsibilities, onResponsibilitiesChange, responsibilities }: ResponsibilitiesStepProps) {
  const [respSearch, setRespSearch] = useState('');
  const toggleResponsibility = (respName: string) => {
    const current = selectedResponsibilities || [];
    const updated = current.includes(respName)
      ? current.filter(r => r !== respName)
      : [...current, respName];
    onResponsibilitiesChange(updated);
  };

  const filteredResponsibilities = useMemo(() => {
    if (!respSearch.trim()) return responsibilities || [];
    const tokens = respSearch.toLowerCase().split(/\s+/).filter(Boolean);
    return (responsibilities || []).filter((resp: any) => tokens.every(tok => (resp.name || '').toLowerCase().includes(tok)));
  }, [responsibilities, respSearch]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Responsibilities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Select Responsibilities (Optional)</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Select responsibilities that apply to this subcontract. You can skip this step if no specific responsibilities are needed.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {(responsibilities || []).map(resp => (
              <Button
                key={resp.id}
                variant={(selectedResponsibilities || []).includes(resp.name) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleResponsibility(resp.name)}
                className="justify-start"
              >
                {resp.name}
              </Button>
            ))}
          </div>
          {(selectedResponsibilities || []).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {(selectedResponsibilities || []).map(resp => (
                <Badge key={resp} variant="secondary">
                  {resp}
                </Badge>
              ))}
            </div>
          )}
          {(selectedResponsibilities || []).length === 0 && (
            <p className="text-sm text-gray-500 mt-3 italic">
              No responsibilities selected. You can proceed without selecting any responsibilities.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
