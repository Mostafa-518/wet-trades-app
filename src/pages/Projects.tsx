
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProjectsTable } from '@/components/ProjectsTable';
import { ProjectForm } from '@/components/ProjectForm';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Project, ProjectFormData } from '@/types/project';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

export function Projects() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const { addProject, updateProject, deleteProject } = useData();
  const { toast } = useToast();
  const { profile } = useAuth();
  const { canModify } = usePermissions();

  // Handle edit project state from navigation
  useEffect(() => {
    if (location.state?.editProject) {
      setEditingProject(location.state.editProject);
      setShowForm(true);
      // Clear the state to prevent re-triggering
      navigate('/projects', { replace: true });
    }
  }, [location.state, navigate]);

  const handleCreateNew = () => {
    if (!canModify) return;
    setEditingProject(null);
    setShowForm(true);
  };

  const handleViewDetail = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleEdit = (project: Project) => {
    if (!canModify) return;
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = (projectId: string) => {
    if (!canModify) return;
    deleteProject(projectId);
    toast({
      title: "Project deleted",
      description: "The project has been removed successfully."
    });
  };

  const handleSave = (data: ProjectFormData) => {
    if (editingProject) {
      updateProject(editingProject.id, data);
      toast({
        title: "Project updated",
        description: "The project has been updated successfully."
      });
    } else {
      addProject(data);
      toast({
        title: "Project created",
        description: "A new project has been created successfully."
      });
    }
    setShowForm(false);
    setEditingProject(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  if (showForm) {
    return (
      <ProjectForm
        project={editingProject}
        onSubmit={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <PermissionGuard permission="manage_projects">
      <ProjectsTable 
        onCreateNew={canModify ? handleCreateNew : undefined}
        onViewDetail={handleViewDetail}
        onEdit={canModify ? handleEdit : undefined}
        onDelete={canModify ? handleDelete : undefined}
      />
    </PermissionGuard>
  );
}
