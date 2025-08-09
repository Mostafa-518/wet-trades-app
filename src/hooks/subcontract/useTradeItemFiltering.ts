
import { Subcontract } from '@/types/subcontract';

export function useTradeItemFiltering() {
  const filterTradeItems = (subcontract: Subcontract, searchLower: string, isTradeFilter: boolean, isItemFilter: boolean) => {
    if (!subcontract.tradeItems || subcontract.tradeItems.length === 0) {
      return subcontract;
    }

    let filteredTradeItems = subcontract.tradeItems;

    if (isTradeFilter || isItemFilter) {
      filteredTradeItems = subcontract.tradeItems.filter(tradeItem => {
        if (isTradeFilter) {
          return tradeItem.trade && tradeItem.trade.toLowerCase().includes(searchLower);
        }
        if (isItemFilter) {
          return tradeItem.item && tradeItem.item.toLowerCase().includes(searchLower);
        }
        return false;
      });
    }

    return {
      ...subcontract,
      tradeItems: filteredTradeItems
    };
  };

  const filterTradeItemsForAdvancedSearch = (
    item: Subcontract, 
    hasTradeFilter: boolean, 
    hasItemFilter: boolean, 
    tradeFilterValue: string, 
    itemFilterValue: string
  ) => {
    let filteredTradeItems = item.tradeItems || [];
    
    if (hasTradeFilter && hasItemFilter) {
      // Both trade and item filters must match on the same trade item
      filteredTradeItems = filteredTradeItems.filter(tradeItem => {
        const tradeMatch = tradeItem.trade && tradeItem.trade.toLowerCase().includes(tradeFilterValue);
        const itemMatch = tradeItem.item && tradeItem.item.toLowerCase().includes(itemFilterValue);
        return tradeMatch && itemMatch;
      });
    } else if (hasTradeFilter) {
      filteredTradeItems = filteredTradeItems.filter(tradeItem => 
        tradeItem.trade && tradeItem.trade.toLowerCase().includes(tradeFilterValue)
      );
    } else if (hasItemFilter) {
      filteredTradeItems = filteredTradeItems.filter(tradeItem => 
        tradeItem.item && tradeItem.item.toLowerCase().includes(itemFilterValue)
      );
    }

    return {
      ...item,
      tradeItems: filteredTradeItems
    };
  };

  return {
    filterTradeItems,
    filterTradeItemsForAdvancedSearch,
  };
}
