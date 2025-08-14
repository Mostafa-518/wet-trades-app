
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProjectFormData } from '@/types/project';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onProjectCreated: (projectName: string) => void;
}

export function CreateProjectModal({ open, onClose, onProjectCreated }: CreateProjectModalProps) {
  const { addProject } = useData();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    code: '',
    location: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await addProject(formData);
      toast({
        title: "Project Created",
        description: `${formData.name} has been created successfully`
      });
      onProjectCreated(formData.name);
      setFormData({ 
        name: '', 
        code: '', 
        location: ''
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-code">Project Code *</Label>
            <Input
              id="project-code"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              placeholder="Enter project code"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-location">Location *</Label>
            <Input
              id="project-location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter project location"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Create Project
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
