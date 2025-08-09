
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ProjectSearchFilters } from '@/types/project';
import { usePersistentFormState } from '@/hooks/persistent-form';

interface ProjectsTableFiltersProps {
  searchFilters: ProjectSearchFilters;
  onFilterChange: (field: keyof ProjectSearchFilters, value: string) => void;
  onClearFilters: () => void;
}

export function ProjectsTableFilters({ 
  searchFilters, 
  onFilterChange, 
  onClearFilters 
}: ProjectsTableFiltersProps) {
  // Use persistent form state for filters
  const {
    formValues,
    handleChange,
    resetForm,
    getInputProps
  } = usePersistentFormState(searchFilters, {
    customKey: 'projects-filters',
    syncWithUrl: true, // Allow shareable filter URLs
    debounceMs: 200
  });

  // Sync with parent component when values change
  React.useEffect(() => {
    Object.entries(formValues).forEach(([key, value]) => {
      if (searchFilters[key as keyof ProjectSearchFilters] !== value) {
        onFilterChange(key as keyof ProjectSearchFilters, value as string);
      }
    });
  }, [formValues, searchFilters, onFilterChange]);

  const handleClearFilters = () => {
    resetForm();
    onClearFilters();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Project Name</label>
            <Input
              placeholder="Search by project name..."
              {...getInputProps('name')}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Project Code</label>
            <Input
              placeholder="Search by project code..."
              {...getInputProps('code')}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Location</label>
            <Input
              placeholder="Search by location..."
              {...getInputProps('location')}
            />
          </div>
        </div>
        <div className="mt-4">
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
