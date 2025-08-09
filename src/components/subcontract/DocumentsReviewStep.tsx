
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload } from 'lucide-react';
import { FormData } from '@/types/subcontract';
import { formatCurrency } from '@/utils/currency';
import { useSubcontractHelpers } from '@/hooks/subcontract/useSubcontractHelpers';

interface DocumentsReviewStepProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  totalAmount: number;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  renderExtraFields?: React.ReactNode; // Allow for extra UI (for date of issuing, etc.)
}

export function DocumentsReviewStep({
  formData,
  setFormData,
  totalAmount,
  onFileUpload,
  renderExtraFields,
}: DocumentsReviewStepProps) {
  const { getProjectName, getSubcontractorName } = useSubcontractHelpers();

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="pdf">Upload Contract PDF</Label>
        <div className="mt-2">
          <Input
            type="file"
            accept=".pdf"
            onChange={onFileUpload}
            className="hidden"
            id="pdf-upload"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('pdf-upload')?.click()}
            className="w-full flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {formData.pdfFile ? formData.pdfFile.name : 'Choose PDF file...'}
          </Button>
        </div>
      </div>

      {renderExtraFields && (
        <div>{renderExtraFields}</div>
      )}

      {/* Review Summary */}
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-semibold">Contract Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div><strong>Project:</strong> {getProjectName(formData.project)}</div>
          <div><strong>Subcontractor:</strong> {getSubcontractorName(formData.subcontractor)}</div>
          <div><strong>Total Items:</strong> {formData.tradeItems.length}</div>
          <div className="md:col-span-2"><strong>Contract Total:</strong> <span className="text-lg font-semibold text-primary">{formatCurrency(totalAmount)}</span></div>
        </div>
        
        <div>
          <strong>Trade Items:</strong>
          <div className="mt-2 space-y-1">
            {formData.tradeItems.map(item => (
              <div key={item.id} className="text-sm bg-muted p-2 rounded">
                {item.trade} - {item.item}: {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.total)}
              </div>
            ))}
          </div>
        </div>

        <div>
          <strong>Responsibilities:</strong>
          <div className="flex flex-wrap gap-1 mt-1">
            {formData.responsibilities.map(resp => (
              <Badge key={resp} variant="outline" className="text-xs">
                {resp}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
