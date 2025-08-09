
import React, { memo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Project } from '@/types/project';
import { TableSelectionCheckbox } from '@/components/TableSelectionCheckbox';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/PaginationControls';

interface ProjectsTableContentProps {
  filteredProjects: Project[];
  selectedIds: Set<string>;
  allSelected: boolean;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onViewDetail: (projectId: string) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}

// Memoized project row component
const ProjectRow = memo(function ProjectRow({ 
  project, 
  isSelected, 
  onToggleOne, 
  onViewDetail, 
  onEdit, 
  onDelete 
}: {
  project: Project;
  isSelected: boolean;
  onToggleOne: (id: string) => void;
  onViewDetail: (id: string) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (id: string) => void;
}) {
  const handleToggle = useCallback(() => onToggleOne(project.id), [onToggleOne, project.id]);
  const handleView = useCallback(() => onViewDetail(project.id), [onViewDetail, project.id]);
  const handleEdit = useCallback(() => onEdit?.(project), [onEdit, project]);
  const handleDelete = useCallback(() => onDelete?.(project.id), [onDelete, project.id]);

  return (
    <TableRow key={project.id}>
      <TableCell>
        <TableSelectionCheckbox
          checked={isSelected}
          onCheckedChange={handleToggle}
          ariaLabel={`Select project ${project.name}`}
        />
      </TableCell>
      <TableCell className="font-medium">{project.name}</TableCell>
      <TableCell>{project.code}</TableCell>
      <TableCell>{project.location}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleView}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
});

const ProjectsTableContent = memo(function ProjectsTableContent({
  filteredProjects,
  selectedIds,
  allSelected,
  onToggleAll,
  onToggleOne,
  onViewDetail,
  onEdit,
  onDelete
}: ProjectsTableContentProps) {
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    hasNextPage,
    hasPreviousPage,
    totalItems,
    itemsPerPage,
  } = usePagination({ data: filteredProjects, itemsPerPage: 5 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects ({filteredProjects.length})</CardTitle>
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
                  ariaLabel="Select all projects"
                />
              </TableHead>
              <TableHead>Project Name</TableHead>
              <TableHead>Project Code</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                isSelected={selectedIds.has(project.id)}
                onToggleOne={onToggleOne}
                onViewDetail={onViewDetail}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No projects found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        
      </CardContent>
    </Card>
  );
});

export { ProjectsTableContent };
