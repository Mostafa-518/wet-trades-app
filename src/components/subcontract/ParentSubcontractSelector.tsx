
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { Subcontract } from '@/types/subcontract';
import { formatCurrency } from '@/utils/currency';

interface ParentSubcontractSelectorProps {
  subcontracts: Subcontract[];
  value: string;
  onChange: (parentId: string) => void;
  getProjectName: (projectId: string) => string;
  getSubcontractorName: (subcontractorId: string) => string;
  className?: string;
}

export function ParentSubcontractSelector({
  subcontracts,
  value,
  onChange,
  getProjectName,
  getSubcontractorName,
  className = ''
}: ParentSubcontractSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Filter out addendum contracts and only show regular subcontracts
  const parentCandidates = useMemo(() => {
    return subcontracts.filter(contract => 
      contract.contractType === 'subcontract' || !contract.contractType
    );
  }, [subcontracts]);

  // Filter contracts based on search term
  const filteredContracts = useMemo(() => {
    if (!searchTerm.trim()) return parentCandidates;
    const tokens = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
    return parentCandidates.filter(contract => {
      const contractNumber = contract.contractId || '';
      const supplierName = getSubcontractorName(contract.subcontractor) || '';
      const projectName = getProjectName(contract.project) || '';
      const contractDate = contract.dateOfIssuing || '';
      const totalAmount = (contract.totalValue?.toString()) || '';
      const hay = `${contractNumber} ${supplierName} ${projectName} ${contractDate} ${totalAmount}`.toLowerCase();
      return tokens.every(t => hay.includes(t));
    });
  }, [parentCandidates, searchTerm, getProjectName, getSubcontractorName]);

  const selectedContract = parentCandidates.find(contract => contract.id === value);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Label htmlFor="parent-contract">Parent Subcontract</Label>
      <div className="relative">
        <Input
          id="parent-contract"
          placeholder="Search by contract number, supplier, project, date, or amount..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pr-10"
        />
        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Selected contract display */}
      {selectedContract && (
        <Card className="mt-2 bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-blue-900">{selectedContract.contractId}</div>
                <div className="text-sm text-blue-700">
                  {getSubcontractorName(selectedContract.subcontractor)} • {getProjectName(selectedContract.project)}
                </div>
                <div className="text-sm text-blue-600">
                  {formatDate(selectedContract.dateOfIssuing)} • {formatCurrency(selectedContract.totalValue || 0)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setSearchTerm('');
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Change
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dropdown results */}
      {isOpen && searchTerm && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredContracts.length === 0 ? (
            <div className="p-3 text-center text-muted-foreground">
              No matching contracts found
            </div>
          ) : (
            filteredContracts.map((contract) => (
              <button
                key={contract.id}
                type="button"
                className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                onClick={() => {
                  onChange(contract.id);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
              >
                <div className="font-medium">{contract.contractId}</div>
                <div className="text-sm text-muted-foreground">
                  {getSubcontractorName(contract.subcontractor)} • {getProjectName(contract.project)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(contract.dateOfIssuing)} • {formatCurrency(contract.totalValue || 0)}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
