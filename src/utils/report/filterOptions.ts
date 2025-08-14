
import { SubcontractWithDetails, FilterOptions } from '@/types/report';

export function generateFilterOptions(subcontracts: SubcontractWithDetails[]): FilterOptions {
  const months = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const years = [...new Set(subcontracts
    .map(s => s.date_of_issuing ? new Date(s.date_of_issuing).getFullYear().toString() : '2024')
    .filter(Boolean)
  )].sort();
  
  const locations = [...new Set(subcontracts
    .map(s => s.projects?.location)
    .filter(Boolean)
  )];
  
  const trades = [...new Set(subcontracts
    .flatMap(s => s.subcontract_trade_items?.map(item => item.trade_items?.trades?.name))
    .filter(Boolean)
  )];
  
  const projectNames = [...new Set(subcontracts
    .map(s => s.projects?.name)
    .filter(Boolean)
  )];
  
  const projectCodes = [...new Set(subcontracts
    .map(s => s.projects?.code)
    .filter(Boolean)
  )];

  const facilities = [...new Set(subcontracts
    .flatMap(s => s.subcontract_responsibilities?.map(resp => resp.responsibilities?.name))
    .filter(Boolean)
  )];

  return {
    months,
    years: ['All', ...years],
    locations: ['All', ...locations],
    trades: ['All', ...trades],
    projectNames: ['All', ...projectNames],
    projectCodes: ['All', ...projectCodes],
    presentDataOptions: ['By Project', 'By Location'],
    facilities: ['All', ...facilities]
  };
}
