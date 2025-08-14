
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { TableSelectionCheckbox } from '../TableSelectionCheckbox';
import { Subcontractor } from '@/types/subcontractor';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/PaginationControls';

interface SubcontractorsTableContentProps {
  filteredSubcontractors: Subcontractor[];
  selectedIds: Set<string>;
  allSelected: boolean;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onViewDetail: (id: string) => void;
  onEdit?: (subcontractor: Subcontractor) => void;
  onDelete?: (id: string) => void;
  searchTerm: string;
}

export function SubcontractorsTableContent({
  filteredSubcontractors,
  selectedIds,
  allSelected,
  onToggleAll,
  onToggleOne,
  onViewDetail,
  onEdit,
  onDelete,
  searchTerm
}: SubcontractorsTableContentProps) {
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    hasNextPage,
    hasPreviousPage,
    totalItems,
    itemsPerPage,
  } = usePagination({ data: filteredSubcontractors, itemsPerPage: 5 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subcontractors ({filteredSubcontractors.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <TableSelectionCheckbox 
                  checked={allSelected} 
                  onCheckedChange={onToggleAll} 
                  ariaLabel="Select all subcontractors"
                />
              </TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Representative</TableHead>
              <TableHead>Commercial Registration</TableHead>
              <TableHead>Tax Card No.</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map(sc => (
              <TableRow key={sc.id}>
                <TableCell>
                  <TableSelectionCheckbox 
                    checked={selectedIds.has(sc.id)} 
                    onCheckedChange={() => onToggleOne(sc.id)} 
                    ariaLabel={`Select subcontractor ${sc.companyName}`} 
                  />
                </TableCell>
                <TableCell className="font-medium">{sc.companyName}</TableCell>
                <TableCell>{sc.representativeName}</TableCell>
                <TableCell>{sc.commercialRegistration}</TableCell>
                <TableCell>{sc.taxCardNo}</TableCell>
                <TableCell>{sc.email}</TableCell>
                <TableCell>{sc.phone}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onViewDetail(sc.id)} className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {onEdit && (
                      <Button variant="ghost" size="sm" onClick={() => onEdit(sc)} className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button variant="ghost" size="sm" onClick={() => onDelete(sc.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No subcontractors found matching your search.' : 'No subcontractors found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        
      </CardContent>
    </Card>
  );
}
