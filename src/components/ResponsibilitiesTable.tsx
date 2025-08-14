
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Responsibility, ResponsibilitySearchFilters } from '@/types/responsibility';
import { responsibilityCategories } from '@/constants/responsibility';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/PaginationControls';

interface ResponsibilitiesTableProps {
  onCreateNew?: () => void;
  onEdit?: (responsibility: Responsibility) => void;
  onDelete?: (responsibilityId: string) => void;
  onViewDetail: (responsibilityId: string) => void;
}

export function ResponsibilitiesTable({ onCreateNew, onEdit, onDelete, onViewDetail }: ResponsibilitiesTableProps) {
  const { responsibilities } = useData();
  const { toast } = useToast();
  
  const [searchFilters, setSearchFilters] = useState<ResponsibilitySearchFilters>({
    name: '',
    category: '',
    isActive: ''
  });

  const filteredResponsibilities = responsibilities.filter(responsibility => {
    return (
      responsibility.name.toLowerCase().includes(searchFilters.name.toLowerCase()) &&
      (searchFilters.category === '' || searchFilters.category === 'all' || responsibility.category === searchFilters.category) &&
      (searchFilters.isActive === '' || searchFilters.isActive === 'all' || responsibility.isActive.toString() === searchFilters.isActive)
    );
  });

  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    hasNextPage,
    hasPreviousPage,
    totalItems,
    itemsPerPage,
  } = usePagination({ data: filteredResponsibilities, itemsPerPage: 10 });

  const handleFilterChange = (field: keyof ResponsibilitySearchFilters, value: string) => {
    // Convert "all" back to empty string for filtering logic
    const filterValue = value === 'all' ? '' : value;
    setSearchFilters(prev => ({ ...prev, [field]: filterValue }));
  };

  const clearFilters = () => {
    setSearchFilters({ name: '', category: '', isActive: '' });
  };
  
  const handleDelete = (responsibilityId: string) => {
    if (onDelete) {
      onDelete(responsibilityId);
      toast({
        title: "Responsibility deleted",
        description: "The responsibility has been successfully deleted."
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Responsibilities</h1>
          <p className="text-muted-foreground">Manage responsibility types and assignments</p>
        </div>
        {onCreateNew && (
          <Button onClick={onCreateNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Responsibility
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search by name..."
                value={searchFilters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
              />
            </div>
            <div>
              <Select value={searchFilters.category || 'all'} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {responsibilityCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={searchFilters.isActive || 'all'} onValueChange={(value) => handleFilterChange('isActive', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responsibilities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Responsibilities ({filteredResponsibilities.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((responsibility) => (
                <TableRow key={responsibility.id}>
                  <TableCell className="font-medium">{responsibility.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{responsibility.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{responsibility.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={responsibility.isActive ? "default" : "secondary"}>
                      {responsibility.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(responsibility.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetail(responsibility.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(responsibility)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(responsibility.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No responsibilities found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
