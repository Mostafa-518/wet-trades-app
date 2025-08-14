
import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { Project, ProjectFormData } from '@/types/project';
import { usePersistentFormState } from '@/hooks/persistent-form';

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
}

interface ExtendedProjectFormData extends ProjectFormData {
  saveAsDraft: boolean;
  notifications: boolean;
}

export function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const isEditing = Boolean(project);
  
  const {
    formValues,
    handleChange,
    resetForm,
    getInputProps,
    getSwitchProps
  } = usePersistentFormState<ExtendedProjectFormData>({
    name: '',
    code: '',
    location: '',
    saveAsDraft: false,
    notifications: true
  }, {
    customKey: isEditing ? `project-edit-${project?.id}` : 'project-create',
    excludeFields: isEditing ? ['saveAsDraft'] : [] // Don't persist draft setting when editing
  });

  // Load project data when editing
  useEffect(() => {
    if (project && isEditing) {
      handleChange('name', project.name);
      handleChange('code', project.code);
      handleChange('location', project.location);
    }
  }, [project, isEditing, handleChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract only the project data for submission
    const projectData: ProjectFormData = {
      name: formValues.name,
      code: formValues.code,
      location: formValues.location
    };
    
    onSubmit(projectData);
    
    // Clear form state after successful submission
    if (!isEditing) {
      resetForm();
    }
  };

  const handleCancel = () => {
    // Optionally clear form state when canceling new project creation
    if (!isEditing) {
      resetForm();
    }
    onCancel();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Edit Project' : 'Add New Project'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Project Information</span>
            {!isEditing && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Switch {...getSwitchProps('saveAsDraft')} />
                  <Label>Save as Draft</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch {...getSwitchProps('notifications')} />
                  <Label>Enable Notifications</Label>
                </div>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  required
                  {...getInputProps('name')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Project Code *</Label>
                <Input
                  id="code"
                  placeholder="Enter project code"
                  required
                  {...getInputProps('code')}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="Enter project location"
                  required
                  {...getInputProps('location')}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-6">
              <Button type="submit">
                {isEditing ? 'Update Project' : formValues.saveAsDraft ? 'Save as Draft' : 'Create Project'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              {!isEditing && (
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Clear Form
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
