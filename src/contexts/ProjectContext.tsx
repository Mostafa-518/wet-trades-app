
import React, { createContext, useContext } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { Project, ProjectFormData } from '@/types/project';

interface ProjectContextType {
  projects: Project[];
  addProject: (data: ProjectFormData) => Promise<void>;
  updateProject: (id: string, data: ProjectFormData) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    isLoading
  } = useProjects();

  const value: ProjectContextType = {
    projects: projects || [],
    addProject: async (data: ProjectFormData) => {
      await addProject(data);
    },
    updateProject: async (id: string, data: ProjectFormData) => {
      await updateProject(id, data);
    },
    deleteProject: async (id: string) => {
      await deleteProject(id);
    },
    isLoading
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
}
