
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, FileDown } from 'lucide-react';

interface ProjectsTableHeaderProps {
  onCreateNew: (() => void) | undefined;
  onImportClick: () => void;
}

export function ProjectsTableHeader({ onCreateNew, onImportClick }: ProjectsTableHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Projects</h1>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onImportClick}>
          <FileDown className="h-4 w-4 mr-2" />
          Import Excel
        </Button>
        {onCreateNew && (
          <Button onClick={onCreateNew}>
            <FileText className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        )}
      </div>
    </div>
  );
}
