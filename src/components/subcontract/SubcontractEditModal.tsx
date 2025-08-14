
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Subcontract } from '@/types/subcontract';
import { SubcontractEditForm } from './SubcontractEditForm';

interface SubcontractEditModalProps {
  subcontract: Subcontract;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<Subcontract>) => Promise<void>;
}

export function SubcontractEditModal({ subcontract, open, onClose, onSave }: SubcontractEditModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Edit Subcontract</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <SubcontractEditForm
            subcontract={subcontract}
            onSave={onSave}
            onClose={onClose}
          />
        </CardContent>
      </Card>
    </div>
  );
}
