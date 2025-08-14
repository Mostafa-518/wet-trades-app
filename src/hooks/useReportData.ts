
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';
import { 
  ReportFilters, 
  SubcontractWithDetails, 
  ReportData 
} from '@/types/report';
import { generateFilterOptions } from '@/utils/report/filterOptions';
import { filterSubcontracts } from '@/utils/report/subcontractFilter';
import { processReportData } from '@/utils/report/reportDataProcessor';
import { usePersistentFormState } from '@/hooks/persistent-form';

const initialFilters: ReportFilters = {
  month: 'all',
  year: 'all',
  location: 'all',
  trades: 'all',
  projectName: 'all',
  projectCode: 'all',
  presentData: 'by-project',
  projectFilterType: 'name',
  facilities: []
};

export function useReportData() {
  // Use persistent form state for filters
  const {
    formValues: filters,
    handleChange,
    resetForm: resetFilters
  } = usePersistentFormState<ReportFilters>(initialFilters, {
    customKey: 'report-filters',
    syncWithUrl: true,
    expirationHours: 24,
    debounceMs: 100
  });

  // Fetch all subcontracts with related data
  const { data: subcontracts = [], isLoading: subcontractsLoading, refetch } = useQuery({
    queryKey: ['report-subcontracts'],
    queryFn: async () => {
      // Fetching subcontracts for report
      const { data, error } = await supabase
        .from('subcontracts')
        .select(`
          *,
          projects(name, code, location),
          subcontractors(company_name),
          subcontract_trade_items(
            quantity,
            unit_price,
            total_price,
            wastage_percentage,
            trade_item_id,
            trade_items(
              name,
              unit,
              trade_id,
              trades(name, category)
            )
          ),
          subcontract_responsibilities(
            responsibility_id,
            responsibilities(name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching subcontracts for report:', error);
        throw error;
      }
      
      // Fetched subcontracts for report
      return data as SubcontractWithDetails[];
    },
  });

  // Get filter options from data
  const filterOptions = useMemo(() => generateFilterOptions(subcontracts), [subcontracts]);

  // Filter subcontracts based on current filters
  const filteredSubcontracts = useMemo(() => 
    filterSubcontracts(subcontracts, filters), 
    [subcontracts, filters]
  );

  // Calculate report data
  const reportData = useMemo((): ReportData => {
    const totalSubcontracts = subcontracts.length;
    const currentSubcontracts = filteredSubcontracts.length;
    const tableData = processReportData(filteredSubcontracts, filters);

    return {
      totalSubcontracts,
      currentSubcontracts,
      filters,
      tableData
    };
  }, [subcontracts, filteredSubcontracts, filters]);

  const updateFilter = (key: keyof ReportFilters, value: string | string[]) => {
    // Updating filter
    
    // Handle special cases for project filter switching
    if (key === 'projectFilterType') {
      if (value === 'name') {
        handleChange('projectCode', 'all');
      } else if (value === 'code') {
        handleChange('projectName', 'all');
      }
    }
    
    // When changing project name, switch to name filter type and reset code
    if (key === 'projectName' && value !== 'all' && value !== 'All') {
      handleChange('projectFilterType', 'name');
      handleChange('projectCode', 'all');
    }
    
    // When changing project code, switch to code filter type and reset name
    if (key === 'projectCode' && value !== 'all' && value !== 'All') {
      handleChange('projectFilterType', 'code');
      handleChange('projectName', 'all');
    }
    
    // Update the filter
    handleChange(key, value);
  };

  return {
    reportData,
    filterOptions,
    updateFilter,
    resetFilters,
    isLoading: subcontractsLoading,
    refetch,
    filteredSubcontracts // Expose filtered subcontracts for graphs
  };
}
