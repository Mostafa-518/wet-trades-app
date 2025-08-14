
import { SubcontractWithDetails, ReportFilters, ReportTableData } from '@/types/report';

export function processReportData(
  filteredSubcontracts: SubcontractWithDetails[],
  filters: ReportFilters
): ReportTableData[] {
  // Group trade items by item name for the table
  const tradeItemsMap = new Map();
  
  filteredSubcontracts.forEach(subcontract => {
    subcontract.subcontract_trade_items?.forEach(item => {
      // When trade filter is active, only include items from that trade
      if (filters.trades !== 'all' && filters.trades !== 'All') {
        if (item.trade_items?.trades?.name !== filters.trades) {
          return; // Skip this item if it doesn't match the selected trade
        }
      }

      const itemName = item.trade_items?.name || 'Unknown Item';
      const existingItem = tradeItemsMap.get(itemName);
      
      if (existingItem) {
        existingItem.totalAmount += item.total_price || 0;
        existingItem.totalQuantity += item.quantity || 0;
        existingItem.count += 1;
      } else {
        tradeItemsMap.set(itemName, {
          item: itemName,
          averageRate: item.unit_price || 0,
          totalAmount: item.total_price || 0,
          totalQuantity: item.quantity || 0,
          wastage: item.wastage_percentage || 0,
          unit: item.trade_items?.unit || '',
          count: 1
        });
      }
    });
  });

  // Calculate average rates
  const tableData = Array.from(tradeItemsMap.values()).map(item => ({
    ...item,
    averageRate: item.count > 0 ? item.totalAmount / item.totalQuantity : 0
  }));

  return tableData;
}
