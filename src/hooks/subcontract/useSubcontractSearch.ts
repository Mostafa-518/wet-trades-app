
import { useState, useEffect } from 'react';
import { Subcontract } from '@/types/subcontract';
import { useSearchFiltering } from './useSearchFiltering';
import { useTradeItemFiltering } from './useTradeItemFiltering';

interface SearchCondition {
  field: string;
  value: string;
}

export function useSubcontractSearch(subcontracts: Subcontract[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(subcontracts);
  const [advancedSearchConditions, setAdvancedSearchConditions] = useState<SearchCondition[]>([]);
  
  const {
    checkBasicFieldsMatch,
    checkResponsibilitiesMatch,
    checkTradeItemsMatch,
    evaluateAdvancedCondition,
  } = useSearchFiltering();
  
  const { filterTradeItems, filterTradeItemsForAdvancedSearch } = useTradeItemFiltering();

  // Update filtered data when subcontracts change
  useEffect(() => {
    if (advancedSearchConditions.length > 0) {
      handleAdvancedSearch(advancedSearchConditions);
    } else if (searchTerm.trim()) {
      handleSimpleSearch(searchTerm);
    } else {
      setFilteredData(subcontracts);
    }
  }, [subcontracts]);

  const handleSimpleSearch = (value: string) => {
    setSearchTerm(value);
    setAdvancedSearchConditions([]); // Clear advanced search when using simple search
    
    if (!value.trim()) {
      setFilteredData(subcontracts);
      return;
    }

    const searchLower = value.toLowerCase();
    
    const filtered = subcontracts.map(item => {
      // Check basic fields
      const basicFieldsMatch = checkBasicFieldsMatch(item, searchLower);

      // Check trade items
      const tradeItemsMatch = checkTradeItemsMatch(item, searchLower);

      // Check responsibilities
      const responsibilitiesMatch = checkResponsibilitiesMatch(item, searchLower);

      // If basic fields or responsibilities match, return the full subcontract
      if (basicFieldsMatch || responsibilitiesMatch) {
        return item;
      }

      // If trade items match, filter the trade items to show only matching ones
      if (tradeItemsMatch) {
        return filterTradeItems(item, searchLower, true, true);
      }

      return null;
    }).filter(Boolean) as Subcontract[];
    
    setFilteredData(filtered);
  };

  const handleAdvancedSearch = (conditions: SearchCondition[]) => {
    // Advanced search triggered with conditions
    setAdvancedSearchConditions(conditions);
    setSearchTerm(''); // Clear simple search when using advanced search
    
    if (conditions.length === 0) {
      setFilteredData(subcontracts);
      return;
    }

    const filtered = subcontracts.map(item => {
      let hasTradeFilter = false;
      let hasItemFilter = false;
      let tradeFilterValue = '';
      let itemFilterValue = '';
      
      const nonTradeConditionsPassed = conditions.every(condition => {
        switch (condition.field) {
          case 'trade':
            hasTradeFilter = true;
            tradeFilterValue = condition.value.toLowerCase();
            return evaluateAdvancedCondition(item, condition);
          case 'item':
            hasItemFilter = true;
            itemFilterValue = condition.value.toLowerCase();
            return evaluateAdvancedCondition(item, condition);
          default:
            return evaluateAdvancedCondition(item, condition);
        }
      });

      if (!nonTradeConditionsPassed) {
        return null;
      }

      // If there are trade or item filters, filter the trade items
      if (hasTradeFilter || hasItemFilter) {
        return filterTradeItemsForAdvancedSearch(
          item, 
          hasTradeFilter, 
          hasItemFilter, 
          tradeFilterValue, 
          itemFilterValue
        );
      }

      return item;
    }).filter(Boolean) as Subcontract[];
    
    // Filtered results
    setFilteredData(filtered);
  };

  return {
    searchTerm,
    filteredData,
    handleSimpleSearch,
    handleAdvancedSearch,
  };
}
