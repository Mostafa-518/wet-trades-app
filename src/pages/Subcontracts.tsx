
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SubcontractTable } from '@/components/SubcontractTable';
import { SubcontractStepper } from '@/components/SubcontractStepper';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/contexts/DataContext';
import { PageErrorBoundary } from '@/components/PageErrorBoundary';

function SubcontractsContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showStepper, setShowStepper] = useState(false);
  const [reportFilters, setReportFilters] = useState<any>(null);
  const { addSubcontract } = useData();
  const { toast } = useToast();
  const { profile } = useAuth();
  const canModify = profile?.role !== 'viewer';

  useEffect(() => {
    console.log('Subcontracts page - parsing URL parameters:', location.search);
    
    // Reset filters first to ensure clean state
    setReportFilters(null);
    
    try {
      // Parse URL parameters to extract filters from report page
      const searchParams = new URLSearchParams(location.search);
      const filters: any = {};
      
      if (searchParams.get('month')) {
        filters.month = searchParams.get('month');
        console.log('Found month filter:', filters.month);
      }
      if (searchParams.get('year')) {
        filters.year = searchParams.get('year');
        console.log('Found year filter:', filters.year);
      }
      if (searchParams.get('location')) {
        filters.location = searchParams.get('location');
        console.log('Found location filter:', filters.location);
      }
      if (searchParams.get('trades')) {
        filters.trades = searchParams.get('trades');
        console.log('Found trades filter:', filters.trades);
      }
      if (searchParams.get('projectName')) {
        filters.projectName = decodeURIComponent(searchParams.get('projectName') || '');
        console.log('Found projectName filter:', filters.projectName);
      }
      if (searchParams.get('projectCode')) {
        filters.projectCode = searchParams.get('projectCode');
        console.log('Found projectCode filter:', filters.projectCode);
      }
      if (searchParams.get('facilities')) {
        try {
          // Handle both JSON array format and comma-separated format
          const facilitiesParam = decodeURIComponent(searchParams.get('facilities') || '');
          if (facilitiesParam?.startsWith('[') && facilitiesParam.endsWith(']')) {
            // JSON array format from report page
            filters.facilities = JSON.parse(facilitiesParam);
          } else if (facilitiesParam) {
            // Comma-separated format
            filters.facilities = facilitiesParam.split(',').filter(f => f.trim());
          } else {
            filters.facilities = [];
          }
          console.log('Found facilities filter:', filters.facilities);
        } catch (error) {
          console.error('Error parsing facilities parameter:', error);
          filters.facilities = [];
        }
      }
      
      console.log('Final parsed filters:', filters);
      
      if (Object.keys(filters).length > 0) {
        setReportFilters(filters);
        console.log('Setting report filters:', filters);
      } else {
        console.log('No filters found in URL');
      }
    } catch (error) {
      console.error('Error parsing URL parameters:', error);
      setReportFilters(null);
    }
  }, [location.search]);

  const handleCreateNew = () => {
    console.log('Create new subcontract clicked, canModify:', canModify);
    if (!canModify) {
      console.log('User cannot modify - showing toast');
      toast({
        title: "Access Denied",
        description: "You don't have permission to create subcontracts",
        variant: "destructive"
      });
      return;
    }
    console.log('Opening stepper modal');
    setShowStepper(true);
  };

  const handleViewDetail = (contractId: string) => {
    console.log('Viewing subcontract detail:', contractId);
    navigate(`/subcontracts/${contractId}`);
  };

  const handleSaveSubcontract = async (data: any) => {
    console.log('handleSaveSubcontract called with data:', data);
    try {
      console.log('Calling addSubcontract...');
      await addSubcontract(data);
      console.log('addSubcontract completed successfully');
      setShowStepper(false);
    } catch (error) {
      console.error('Error in handleSaveSubcontract:', error);
      // Error handling is already done in the hook
    }
  };

  console.log('Subcontracts page render - showStepper:', showStepper, 'canModify:', canModify);

  if (showStepper) {
    return (
      <SubcontractStepper
        onSave={handleSaveSubcontract}
        onClose={() => {
          console.log('Closing stepper');
          setShowStepper(false);
        }}
      />
    );
  }

  return (
    <SubcontractTable 
      onCreateNew={canModify ? handleCreateNew : undefined}
      onViewDetail={handleViewDetail}
      reportFilters={reportFilters}
    />
  );
}

export function Subcontracts() {
  return (
    <PageErrorBoundary pageName="Subcontracts">
      <SubcontractsContent />
    </PageErrorBoundary>
  );
}
