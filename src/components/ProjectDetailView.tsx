
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, FileText, Building2 } from 'lucide-react';
import { Project } from '@/types/project';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';

interface ProjectDetailViewProps {
  project: Project;
  onBack: () => void;
  onEdit: (project: any) => void;
}

export function ProjectDetailView({ project, onBack, onEdit }: ProjectDetailViewProps) {
  const navigate = useNavigate();
  const { subcontracts, projects, subcontractors } = useData();
  
  // Find subcontracts for this project using project ID
  const projectSubcontracts = subcontracts.filter(subcontract => 
    subcontract.project === project.id
  );

  // Helper function to get project name
  const getProjectName = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    return proj ? proj.name : projectId;
  };

  // Helper function to get subcontractor name
  const getSubcontractorName = (subcontractorId: string) => {
    const subcontractor = subcontractors.find(s => s.id === subcontractorId);
    return subcontractor ? subcontractor.companyName : subcontractorId;
  };

  // Handle subcontract click navigation - use the database ID instead of contractId
  const handleSubcontractClick = (subcontractId: string) => {
    navigate(`/subcontracts/${subcontractId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.code}</p>
          </div>
        </div>
        <Button onClick={() => onEdit(project)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Project
        </Button>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">Project Info</TabsTrigger>
          <TabsTrigger value="subcontracts">Subcontracts ({projectSubcontracts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Project Name</label>
                  <p className="text-lg font-semibold">{project.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Project Code</label>
                  <p className="text-lg font-semibold">{project.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <p className="text-lg font-semibold">{project.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                  <p className="text-lg font-semibold">{new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subcontracts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Project Subcontracts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projectSubcontracts.length > 0 ? (
                <div className="space-y-4">
                  {projectSubcontracts.map(subcontract => (
                    <div 
                      key={subcontract.id} 
                      className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleSubcontractClick(subcontract.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div>
                            <h3 className="font-semibold text-lg text-blue-600 hover:text-blue-800">
                              {getSubcontractorName(subcontract.subcontractor)}
                            </h3>
                            <p className="text-sm text-muted-foreground">Contract ID: {subcontract.contractId}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Trades:</span> {subcontract.tradeItems.map(item => item.trade).join(', ') || 'No trades specified'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Total Value:</span> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(subcontract.totalValue)}
                            </p>
                            {subcontract.responsibilities.length > 0 && (
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Responsibilities:</span> {subcontract.responsibilities.join(', ')}
                              </p>
                            )}
                          </div>
                          {subcontract.startDate && subcontract.endDate && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">Duration:</span> {new Date(subcontract.startDate).toLocaleDateString()} - {new Date(subcontract.endDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            subcontract.status === 'active' ? 'bg-green-100 text-green-800' :
                            subcontract.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            subcontract.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            subcontract.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {subcontract.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No subcontracts found for this project.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Subcontracts will appear here once they are created for this project.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
