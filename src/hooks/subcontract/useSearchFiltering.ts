
import { Subcontract } from '@/types/subcontract';
import { useSubcontractHelpers } from './useSubcontractHelpers';

interface SearchCondition {
  field: string;
  value: string;
}

export function useSearchFiltering() {
  const { getProjectName, getProjectCode, getSubcontractorName } = useSubcontractHelpers();

  const checkBasicFieldsMatch = (item: Subcontract, searchLower: string) => {
    const projectName = getProjectName(item.project);
    const projectCode = getProjectCode(item.project);
    const subcontractorName = getSubcontractorName(item.subcontractor);
    
    return item.contractId.toLowerCase().includes(searchLower) ||
           projectName.toLowerCase().includes(searchLower) ||
           projectCode.toLowerCase().includes(searchLower) ||
           subcontractorName.toLowerCase().includes(searchLower);
  };

  const checkResponsibilitiesMatch = (item: Subcontract, searchLower: string) => {
    return item.responsibilities && item.responsibilities.length > 0 &&
           item.responsibilities.some(resp => 
             resp && resp.toLowerCase().includes(searchLower)
           );
  };

  const checkTradeItemsMatch = (item: Subcontract, searchLower: string) => {
    return item.tradeItems && item.tradeItems.length > 0 && 
           item.tradeItems.some(tradeItem => {
             const tradeMatch = tradeItem.trade && tradeItem.trade.toLowerCase().includes(searchLower);
             const itemMatch = tradeItem.item && tradeItem.item.toLowerCase().includes(searchLower);
             return tradeMatch || itemMatch;
           });
  };

  const evaluateAdvancedCondition = (item: Subcontract, condition: SearchCondition) => {
    const projectName = getProjectName(item.project);
    const projectCode = getProjectCode(item.project);
    const subcontractorName = getSubcontractorName(item.subcontractor);
    const conditionLower = condition.value.toLowerCase();
    
    switch (condition.field) {
      case 'contractId':
        return item.contractId.toLowerCase().includes(conditionLower);
      case 'project':
        return projectName.toLowerCase().includes(conditionLower);
      case 'projectCode':
        return projectCode.toLowerCase().includes(conditionLower);
      case 'subcontractor':
        return subcontractorName.toLowerCase().includes(conditionLower);
      case 'trade':
        return item.tradeItems && item.tradeItems.length > 0 && 
          item.tradeItems.some(tradeItem => 
            tradeItem.trade && tradeItem.trade.toLowerCase().includes(conditionLower)
          );
      case 'item':
        return item.tradeItems && item.tradeItems.length > 0 && 
          item.tradeItems.some(tradeItem => 
            tradeItem.item && tradeItem.item.toLowerCase().includes(conditionLower)
          );
      case 'responsibilities':
        return item.responsibilities && item.responsibilities.length > 0 &&
          item.responsibilities.some(resp => 
            resp && resp.toLowerCase().includes(conditionLower)
          );
      case 'status':
        return item.status.toLowerCase().includes(conditionLower);
      default:
        return false;
    }
  };

  return {
    checkBasicFieldsMatch,
    checkResponsibilitiesMatch,
    checkTradeItemsMatch,
    evaluateAdvancedCondition,
  };
}
