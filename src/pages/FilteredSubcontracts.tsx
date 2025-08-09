import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Eye, Edit } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useSubcontractHelpers } from '@/hooks/subcontract/useSubcontractHelpers';
import { useSubcontractFiltering } from '@/hooks/subcontract/useSubcontractFiltering';
import { formatCurrency, formatDate } from '@/components/subcontract/SubcontractTableHelpers';

export function FilteredSubcontracts() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { subcontracts, projects, subcontractors, isLoading } = useData();
  const { getProjectName, getSubcontractorName } = useSubcontractHelpers();

  // Extract filter parameters from URL
  const projectId = searchParams.get('projectId');
  const subcontractorId = searchParams.get('subcontractorId');
  const month = searchParams.get('month');
  const year = searchParams.get('year');
  const location = searchParams.get('location');
  const trades = searchParams.get('trades');
  const projectName = searchParams.get('projectName');
  const projectCode = searchParams.get('projectCode');
  const facilities = searchParams.get('facilities')?.split(',').filter(Boolean) || [];

  // Build report filters object
  const reportFilters = {
    month: month || 'all',
    year: year || 'all',
    location: location || 'all',
    trades: trades || 'all',
    projectName: projectName || 'all',
    projectCode: projectCode || 'all',
    facilities: facilities
  };

  // Apply filtering
  const filteredSubcontracts = useSubcontractFiltering(subcontracts, reportFilters);

  // Generate header title based on filters
  const getHeaderTitle = () => {
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId);
      return `Subcontracts for Project: ${project?.name || 'Unknown Project'}`;
    }
    if (subcontractorId && subcontractors.length > 0) {
      const subcontractor = subcontractors.find(s => s.id === subcontractorId);
      return `Subcontracts for Subcontractor: ${subcontractor?.companyName || 'Unknown Subcontractor'}`;
    }
    if (projectName && projectName !== 'all') {
      return `Subcontracts for Project: ${projectName}`;
    }
    if (location && location !== 'all') {
      return `Subcontracts for Location: ${location}`;
    }
    if (trades && trades !== 'all') {
      return `Subcontracts for Trade: ${trades}`;
    }
    return 'Filtered Subcontracts';
  };

  const handleViewSubcontract = (subcontractId: string) => {
    navigate(`/subcontracts/${subcontractId}`);
  };

  const handleEditSubcontract = (subcontractId: string) => {
    navigate(`/subcontracts/${subcontractId}?edit=true`);
  };

     const handleClick = () => {
    // This removes the query string and navigates to /report
    navigate('/report', { replace: true });
       window.location.hash = '#/report'; // force hash reset
  window.location.search = ''; // just in case
 };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subcontracts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleClick}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Report
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{getHeaderTitle()}</h1>
            <p className="text-muted-foreground">
              {filteredSubcontracts.length} subcontract{filteredSubcontracts.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      </div>

      {/* Applied Filters Summary */}
      {Object.values(reportFilters).some(filter => 
        Array.isArray(filter) ? filter.length > 0 : filter !== 'all'
      ) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Applied Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {reportFilters.month !== 'all' && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  Month: {reportFilters.month}
                </span>
              )}
              {reportFilters.year !== 'all' && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  Year: {reportFilters.year}
                </span>
              )}
              {reportFilters.location !== 'all' && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  Location: {reportFilters.location}
                </span>
              )}
              {reportFilters.trades !== 'all' && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  Trade: {reportFilters.trades}
                </span>
              )}
              {reportFilters.projectName !== 'all' && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  Project: {reportFilters.projectName}
                </span>
              )}
              {reportFilters.facilities.length > 0 && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  Facilities: {reportFilters.facilities.join(', ')}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subcontracts List */}
      {filteredSubcontracts.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">No subcontracts found for this context.</p>
              <p>Try adjusting your filters or check if data exists for the selected criteria.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSubcontracts.map((subcontract) => (
            <Card key={subcontract.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-lg text-blue-600">
                      {subcontract.contractId}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(subcontract.dateOfIssuing)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium">{getProjectName(subcontract.project)}</p>
                    <p className="text-sm text-muted-foreground">Project</p>
                  </div>
                  
                  <div>
                    <p className="font-medium">{getSubcontractorName(subcontract.subcontractor)}</p>
                    <p className="text-sm text-muted-foreground">Subcontractor</p>
                  </div>
                  
                  <div>
                    <p className="font-medium">{formatCurrency(subcontract.totalValue || 0)}</p>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                  </div>
                  
                  <div className="flex items-center gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewSubcontract(subcontract.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditSubcontract(subcontract.id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
                
                {/* Trade Items Summary */}
                {subcontract.tradeItems && subcontract.tradeItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Trade Items:</p>
                    <div className="flex flex-wrap gap-2">
                      {subcontract.tradeItems.map((item, idx) => (
                        <span 
                          key={idx}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          {item.trade} - {item.item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
