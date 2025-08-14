
import { projectService } from '@/services';
import { ProjectFormData } from '@/types/project';
import { useListQuery } from '@/hooks/core/useApiQuery';
import { useCreateMutation, useUpdateMutation, useDeleteMutation } from '@/hooks/core/useApiMutation';
import { queryKeys } from '@/lib/query/keys';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export function useProjects() {
  // Enhanced query with better error handling
  const projectsQuery = useListQuery(
    'projects',
    () => projectService.getAll(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Setup real-time subscription for projects
  useRealtimeSubscription({
    table: 'projects',
    queryKeys: [['projects']],
  });

  // Enhanced mutations with automatic cache invalidation
  const createMutation = useCreateMutation(
    'projects',
    (data: ProjectFormData) => projectService.create({
      name: data.name,
      code: data.code,
      location: data.location
    }),
    {
      successMessage: "Project created successfully",
    }
  );

  const updateMutation = useUpdateMutation(
    'projects',
    ({ id, ...data }: { id: string } & ProjectFormData) => 
      projectService.update(id, {
        name: data.name,
        code: data.code,
        location: data.location
      }),
    {
      successMessage: "Project updated successfully",
    }
  );

  const deleteMutation = useDeleteMutation(
    'projects',
    ({ id }: { id: string }) => projectService.delete(id),
    {
      successMessage: "Project deleted successfully",
    }
  );

  return {
    // Data
    projects: (projectsQuery.data || []).map(p => ({
      ...p,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    })),
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error,
    
    // Actions with enhanced error handling
    addProject: createMutation.mutateAsync,
    updateProject: (id: string, data: ProjectFormData) => 
      updateMutation.mutateAsync({ id, ...data }),
    deleteProject: (id: string) => 
      deleteMutation.mutateAsync({ id }),
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Utilities
    refresh: projectsQuery.refetch,
    asyncState: projectsQuery.asyncState,
  };
}
