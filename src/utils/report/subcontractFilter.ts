
import { SubcontractWithDetails, ReportFilters } from '@/types/report';


const monthNames = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

const isAll = (value: string | undefined | null) =>
  !value || value.toLowerCase() === 'all';



export function filterSubcontracts(
  subcontracts: SubcontractWithDetails[], 
  filters: ReportFilters
): SubcontractWithDetails[] {
  console.log('=== STARTING FILTER PROCESS ===');
  console.log('Applied filters:', filters);
  console.log('Total subcontracts before filtering:', subcontracts.length);
  
  const filtered = subcontracts.filter(subcontract => {
    console.log(`\n--- Processing Subcontract ${subcontract.contract_number} ---`);
    
    // Month filter
    if (!isAll(filters.month)) {
      if (!subcontract.date_of_issuing) {
        console.log(`❌ Month filter failed: missing date`);
        return false;
      }

      const subcontractMonthName =
        monthNames[new Date(subcontract.date_of_issuing).getMonth()];
      if (subcontractMonthName !== filters.month) {
        console.log(`❌ Month filter failed: expected ${filters.month}, got ${subcontractMonthName}`);
        return false;
      }
    }

    // Year filter
    if (!isAll(filters.year)) {
      if (subcontract.date_of_issuing) {
        const subcontractYear = new Date(subcontract.date_of_issuing).getFullYear().toString();
        if (subcontractYear !== filters.year) {
          console.log(`❌ Year filter failed: expected ${filters.year}, got ${subcontractYear}`);
          return false;
        }
      }
    }

    // Location filter (only active when present data is by location)
    if (filters.presentData === 'by-location' && filters.location !== 'all' && filters.location !== 'All') {
      if (subcontract.projects?.location !== filters.location) {
        console.log(`❌ Location filter failed: expected ${filters.location}, got ${subcontract.projects?.location}`);
        return false;
      }
    }

    // Trade filter
    if (filters.trades !== 'all' && filters.trades !== 'All') {
      const hasMatchingTrade = subcontract.subcontract_trade_items?.some(
        item => item.trade_items?.trades?.name === filters.trades
      );
      if (!hasMatchingTrade) {
        console.log(`❌ Trade filter failed: no matching trade ${filters.trades}`);
        return false;
      }
    }

    // Facilities filter - STRICT AND LOGIC: ALL selected facilities must be present
    if (filters.facilities.length > 0) {
      console.log(`🔍 FACILITIES FILTER - STRICT AND MODE`);
      console.log(`Selected facilities (${filters.facilities.length}):`, filters.facilities);
      
      // Get all responsibility names for this subcontract
      const subcontractFacilities = subcontract.subcontract_responsibilities
        ?.map(resp => resp.responsibilities?.name)
        .filter(name => name != null) || [];
      
      console.log(`Subcontract ${subcontract.contract_number} has facilities:`, subcontractFacilities);
      
      // Check that ALL selected facilities are present (strict AND logic)
      for (const selectedFacility of filters.facilities) {
        const isPresent = subcontractFacilities.includes(selectedFacility);
        console.log(`  - Checking facility "${selectedFacility}": ${isPresent ? '✅ PRESENT' : '❌ MISSING'}`);
        
        if (!isPresent) {
          console.log(`❌ FACILITIES FILTER FAILED: Missing facility "${selectedFacility}"`);
          return false;
        }
      }
      
      console.log(`✅ FACILITIES FILTER PASSED: All ${filters.facilities.length} facilities are present`);
    }

    // Project name filter (only active when present data is by project and projectFilterType is 'name')
    if (filters.presentData === 'by-project' && filters.projectFilterType === 'name' && filters.projectName !== 'all' && filters.projectName !== 'All') {
      if (subcontract.projects?.name !== filters.projectName) {
        console.log(`❌ Project name filter failed: expected ${filters.projectName}, got ${subcontract.projects?.name}`);
        return false;
      }
    }

    // Project code filter (only active when present data is by project and projectFilterType is 'code')
    if (filters.presentData === 'by-project' && filters.projectFilterType === 'code' && filters.projectCode !== 'all' && filters.projectCode !== 'All') {
      if (subcontract.projects?.code !== filters.projectCode) {
        console.log(`❌ Project code filter failed: expected ${filters.projectCode}, got ${subcontract.projects?.code}`);
        return false;
      }
    }

    console.log(`✅ Subcontract ${subcontract.contract_number} passed all filters`);
    return true;
  });

  console.log('\n=== FILTER RESULTS ===');
  console.log('Filtered subcontracts count:', filtered.length);
  console.log('Filtered subcontract IDs:', filtered.map(s => s.contract_number));
  console.log('=== END FILTER PROCESS ===\n');
  
  return filtered;
}
