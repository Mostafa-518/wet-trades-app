
import { useData } from '@/contexts/DataContext';

export function useSubcontractHelpers() {
  const { projects, subcontractors } = useData();

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : projectId;
  };

  const getProjectCode = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.code : '';
  };

  const getSubcontractorName = (subcontractorId: string) => {
    const subcontractor = subcontractors.find(s => s.id === subcontractorId);
    return subcontractor ? subcontractor.companyName : subcontractorId;
  };

  return {
    getProjectName,
    getProjectCode,
    getSubcontractorName,
  };
}
