
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { AdvancedSearch } from './AdvancedSearch';
import { Subcontract } from '@/types/subcontract';

interface SearchCondition {
  field: string;
  value: string;
}

interface SubcontractTableSearchProps {
  searchTerm: string;
  onSimpleSearch: (value: string) => void;
  onAdvancedSearch: (conditions: SearchCondition[]) => void;
  subcontracts: Subcontract[];
}

export function SubcontractTableSearch({ 
  searchTerm, 
  onSimpleSearch, 
  onAdvancedSearch,
  subcontracts
}: SubcontractTableSearchProps) {
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by Contract ID, Project, Project Code, Trade, Item, or Subcontractor..."
            value={searchTerm}
            onChange={(e) => onSimpleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
        >
          Advanced Search
        </Button>
      </div>

      {showAdvancedSearch && (
        <AdvancedSearch onSearch={onAdvancedSearch} subcontracts={subcontracts} />
      )}
    </div>
  );
}
