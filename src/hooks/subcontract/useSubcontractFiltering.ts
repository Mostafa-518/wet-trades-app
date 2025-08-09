
import { useMemo } from 'react';
import { useSubcontractHelpers } from './useSubcontractHelpers';
import { useData } from '@/contexts/DataContext';

export function useSubcontractFiltering(subcontracts: any[], reportFilters?: any) {
  const { getProjectName, getProjectCode, getSubcontractorName } = useSubcontractHelpers();
  const { projects } = useData();

  const filteredSubcontracts = useMemo(() => {
    // Starting filter process
    
    if (!reportFilters) {
      // No report filters, returning all subcontracts
      return subcontracts;
    }
    
    const filtered = subcontracts.map(subcontract => {
      // Processing subcontract
      
      // Month filter
      if (reportFilters.month && reportFilters.month !== 'all' && reportFilters.month !== 'All') {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIndex = monthNames.findIndex(m => m.toLowerCase() === reportFilters.month.toLowerCase());
        
        if (monthIndex !== -1 && (subcontract.dateOfIssuing || subcontract.date_of_issuing)) {
          const dateField = subcontract.dateOfIssuing || subcontract.date_of_issuing;
          const subcontractMonth = new Date(dateField).getMonth();
          if (subcontractMonth !== monthIndex) {
            // Month filter failed
            return null;
          }
          // Month filter passed
        }
      }

      // Year filter
      if (reportFilters.year && reportFilters.year !== 'all' && reportFilters.year !== 'All') {
        if (subcontract.dateOfIssuing || subcontract.date_of_issuing) {
          const dateField = subcontract.dateOfIssuing || subcontract.date_of_issuing;
          const subcontractYear = new Date(dateField).getFullYear().toString();
          if (subcontractYear !== reportFilters.year) {
            // Year filter failed
            return null;
          }
          // Year filter passed
        }
      }

      // Location filter - Enhanced logic
      if (reportFilters.location && reportFilters.location !== 'all' && reportFilters.location !== 'All') {
        // Location filter check
        
        // Get the project for this subcontract
        const projectId = subcontract.project || subcontract.project_id;
        // Getting subcontract project ID
        
        // Find the project and check its location
        const project = projects.find(p => p.id === projectId);
        // Found project
        
        if (!project) {
          // Location filter failed: No project found
          return null;
        }
        
        const projectLocation = project.location;
        // Project location check
        
        if (projectLocation !== reportFilters.location) {
          // Location filter failed
          return null;
        }
        
        // Location filter passed
      }

      // Project name filter
      if (reportFilters.projectName && reportFilters.projectName !== 'all' && reportFilters.projectName !== 'All') {
        const projectId = subcontract.project || subcontract.project_id;
        const projectName = getProjectName(projectId);
        if (projectName !== reportFilters.projectName) {
          // Project name filter failed
          return null;
        }
        // Project name filter passed
      }

      // Project code filter
      if (reportFilters.projectCode && reportFilters.projectCode !== 'all' && reportFilters.projectCode !== 'All') {
        const projectId = subcontract.project || subcontract.project_id;
        const projectCode = getProjectCode(projectId);
        if (projectCode !== reportFilters.projectCode) {
          // Project code filter failed
          return null;
        }
        // Project code filter passed
      }

      // Facilities filter - STRICT: ALL selected facilities must be present
      if (reportFilters.facilities && reportFilters.facilities.length > 0) {
        // Facilities filter - strict mode
        
        // Handle different data structures for responsibilities
        const responsibilities = subcontract.responsibilities || 
                               subcontract.subcontract_responsibilities || 
                               [];
        
        // Subcontract responsibilities check
        
        let responsibilityNames: string[] = [];
        
        if (!responsibilities || !Array.isArray(responsibilities)) {
          // Facilities filter failed: No valid responsibilities array
          return null;
        }
        
        if (responsibilities.length === 0) {
          // Facilities filter failed: Empty responsibilities array
          return null;
        }
        
        // Extract responsibility names from different data structures
        responsibilityNames = responsibilities.map(resp => {
          if (typeof resp === 'string') {
            return resp;
          } else if (typeof resp === 'object' && resp !== null) {
            return resp.name || 
                   (resp.responsibilities && resp.responsibilities.name) ||
                   resp.responsibility || 
                   '';
          }
          return '';
        }).filter(Boolean);
        
        // Extracted responsibility names
        
        // Check each selected facility individually
        for (const selectedFacility of reportFilters.facilities) {
          const isPresent = responsibilityNames.includes(selectedFacility);
          // Checking facility presence
          
          if (!isPresent) {
            // Facilities filter failed: Missing facility
            return null;
          }
        }
        
        // Facilities filter passed: All facilities are present
      }

      // Trade filter - NEW: Filter at trade item level
      if (reportFilters.trades && reportFilters.trades !== 'all' && reportFilters.trades !== 'All') {
        // Trade filter - item level
        
        const tradeItems = subcontract.tradeItems || subcontract.subcontract_trade_items || [];
        
        if (!tradeItems || tradeItems.length === 0) {
          // Trade filter failed: no trade items
          return null;
        }

        // Filter trade items to only include matching trades
        const filteredTradeItems = tradeItems.filter(item => {
          const tradeName = item.trade || 
                           (item.trade_items && item.trade_items.trades && item.trade_items.trades.name) ||
                           (item.tradeItem && item.tradeItem.trade && item.tradeItem.trade.name);
          
          const matches = tradeName && tradeName.toLowerCase().includes(reportFilters.trades.toLowerCase());
          // Trade item matching check
          return matches;
        });

        if (filteredTradeItems.length === 0) {
          // Trade filter failed: no matching trade items
          return null;
        }

        // Trade filter passed
        
        // Return subcontract with only matching trade items
        return {
          ...subcontract,
          tradeItems: filteredTradeItems,
          subcontract_trade_items: filteredTradeItems
        };
      }

      // Subcontract passed all filters
      return subcontract;
    }).filter(Boolean);

    // Filter results summary
    
    return filtered;
  }, [subcontracts, reportFilters, getProjectName, getProjectCode, projects]);

  return filteredSubcontracts;
}
