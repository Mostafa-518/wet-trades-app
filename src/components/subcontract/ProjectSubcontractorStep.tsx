
import React, { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { FormData } from '@/types/subcontract';
import { useData } from '@/contexts/DataContext';
import { CreateProjectModal } from './CreateProjectModal';
import { CreateSubcontractorModal } from './CreateSubcontractorModal';

interface ProjectSubcontractorStepProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export function ProjectSubcontractorStep({ formData, setFormData }: ProjectSubcontractorStepProps) {
  const { projects, subcontractors } = useData();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showSubcontractorModal, setShowSubcontractorModal] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [subcontractorSearch, setSubcontractorSearch] = useState('');

  // Filter out projects and subcontractors with empty or invalid IDs
  const validProjects = projects.filter(project => project.id && project.name && project.id.trim() !== '' && project.name.trim() !== '');
  const validSubcontractors = subcontractors.filter(sub => sub.id && sub.companyName && sub.id.trim() !== '' && sub.companyName.trim() !== '');

  // Filter projects based on search (by name or code)
  const filteredProjects = useMemo(() => {
    if (!projectSearch.trim()) return validProjects;
    const searchLower = projectSearch.toLowerCase();
    return validProjects.filter(project => 
      project.name.toLowerCase().includes(searchLower) ||
      project.code.toLowerCase().includes(searchLower)
    );
  }, [validProjects, projectSearch]);

  // Filter subcontractors based on search (by name, commercial registration, or tax card)
  const filteredSubcontractors = useMemo(() => {
    if (!subcontractorSearch.trim()) return validSubcontractors;
    const searchLower = subcontractorSearch.toLowerCase();
    return validSubcontractors.filter(sub => 
      sub.companyName.toLowerCase().includes(searchLower) ||
      (sub.commercialRegistration && sub.commercialRegistration.toLowerCase().includes(searchLower)) ||
      (sub.taxCardNo && sub.taxCardNo.toLowerCase().includes(searchLower))
    );
  }, [validSubcontractors, subcontractorSearch]);

  const handleProjectCreated = (projectName: string) => {
    // Find the project by name to get its ID
    const project = validProjects.find(p => p.name === projectName);
    if (project) {
      setFormData(prev => ({ ...prev, project: project.id }));
    }
  };

  const handleSubcontractorCreated = (subcontractorName: string) => {
    // Find the subcontractor by name to get its ID
    const subcontractor = validSubcontractors.find(s => s.companyName === subcontractorName);
    if (subcontractor) {
      setFormData(prev => ({ ...prev, subcontractor: subcontractor.id }));
    }
  };

  const selectedProject = validProjects.find(p => p.id === formData.project);
  const selectedSubcontractor = validSubcontractors.find(s => s.id === formData.subcontractor);

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="project">Select Project</Label>
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by project name or code..."
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select 
            value={formData.project} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, project: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a project...">
                {selectedProject ? selectedProject.name : "Choose a project..."}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {filteredProjects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-muted-foreground">{project.code} • {project.location}</div>
                  </div>
                </SelectItem>
              ))}
              {filteredProjects.length === 0 && projectSearch && (
                <div className="px-2 py-3 text-sm text-muted-foreground">
                  No projects found matching "{projectSearch}"
                </div>
              )}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowProjectModal(true)}
            className="w-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Project
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="subcontractor">Select Subcontractor</Label>
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, commercial registration, or tax card..."
              value={subcontractorSearch}
              onChange={(e) => setSubcontractorSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select 
            value={formData.subcontractor} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, subcontractor: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a subcontractor...">
                {selectedSubcontractor ? selectedSubcontractor.companyName : "Choose a subcontractor..."}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {filteredSubcontractors.map(sub => (
                <SelectItem key={sub.id} value={sub.id}>
                  <div>
                    <div className="font-medium">{sub.companyName}</div>
                    <div className="text-sm text-muted-foreground">
                      {sub.representativeName} • {sub.phone}
                      {sub.commercialRegistration && ` • CR: ${sub.commercialRegistration}`}
                      {sub.taxCardNo && ` • Tax: ${sub.taxCardNo}`}
                    </div>
                  </div>
                </SelectItem>
              ))}
              {filteredSubcontractors.length === 0 && subcontractorSearch && (
                <div className="px-2 py-3 text-sm text-muted-foreground">
                  No subcontractors found matching "{subcontractorSearch}"
                </div>
              )}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowSubcontractorModal(true)}
            className="w-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Subcontractor
          </Button>
        </div>
      </div>

      <CreateProjectModal
        open={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onProjectCreated={handleProjectCreated}
      />

      <CreateSubcontractorModal
        open={showSubcontractorModal}
        onClose={() => setShowSubcontractorModal(false)}
        onSubcontractorCreated={handleSubcontractorCreated}
      />
    </div>
  );
}
