
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SubcontractorsTableSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchBy: string;
  setSearchBy: (field: string) => void;
}

export function SubcontractorsTableSearch({ 
  searchTerm, 
  setSearchTerm, 
  searchBy, 
  setSearchBy 
}: SubcontractorsTableSearchProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search subcontractors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <select
        value={searchBy}
        onChange={(e) => setSearchBy(e.target.value)}
        className="px-3 py-2 border border-input bg-background rounded-md text-sm"
      >
        <option value="name">Business Name</option>
        <option value="companyName">Company Name</option>
        <option value="representative">Representative</option>
        <option value="commercialRegistration">Commercial Registration</option>
        <option value="taxCardNo">Tax Card No.</option>
        <option value="email">Email</option>
        <option value="phone">Phone</option>
      </select>
    </div>
  );
}
