
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Plus } from 'lucide-react';

interface SubcontractTableHeaderProps {
  onCreateNew?: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
}

export function SubcontractTableHeader({ 
  onCreateNew, 
  onFileUpload, 
  onDownloadTemplate 
}: SubcontractTableHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Subcontracts</h2>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onDownloadTemplate} className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Download Template
        </Button>
        <div className="relative">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={onFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="excel-upload"
          />
          <Button variant="outline" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Import from Excel
          </Button>
        </div>
        {onCreateNew && (
          <Button onClick={onCreateNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Subcontract
          </Button>
        )}
      </div>
    </div>
  );
}
