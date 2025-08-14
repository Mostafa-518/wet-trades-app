
import { subcontractService, subcontractTradeItemService, subcontractResponsibilityService } from '@/services';
import { Subcontract } from '@/types/subcontract';
import { findTradeItemId, findResponsibilityId } from '@/utils/subcontract';

export const updateSubcontractWithTradeItems = async (
  id: string,
  data: Partial<Subcontract>,
  trades: any[],
  tradeItems: any[],
  responsibilities: any[] = []
) => {
  console.log('Updating subcontract:', id, data);
  
  const updatePayload = {
    contract_number: data.contractId,
    project_id: data.project,
    subcontractor_id: data.subcontractor,
    status: data.status,
    total_value: data.totalValue,
    start_date: data.startDate,
    end_date: data.endDate,
    description: data.description || '',
    pdf_url: data.pdfUrl,
  };

  await subcontractService.update(id, updatePayload);

  // Update trade items if provided
  if (data.tradeItems) {
    // Delete existing trade items
    await subcontractTradeItemService.deleteBySubcontractId(id);
    
    // Add new trade items
    if (data.tradeItems.length > 0) {
      const tradeItemsPayload = data.tradeItems.map(item => {
        const tradeId = trades.find(t => t.name === item.trade)?.id;
        const tradeItemId = findTradeItemId(tradeItems, tradeId || '', item.item);
        
        return {
          subcontract_id: id,
          trade_item_id: tradeItemId || '',
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.total,
          wastage_percentage: item.wastagePercentage ?? 0
        };
      }).filter(item => item.trade_item_id);

      if (tradeItemsPayload.length > 0) {
        await subcontractTradeItemService.createMany(tradeItemsPayload);
      }
    }
  }

  // Update responsibilities if provided
  if (data.responsibilities) {
    // Delete existing responsibilities
    await subcontractResponsibilityService.deleteBySubcontractId(id);
    
    // Add new responsibilities
    if (data.responsibilities.length > 0) {
      const responsibilityPayload = data.responsibilities.map(responsibilityName => {
        const responsibilityId = findResponsibilityId(responsibilities, responsibilityName);
        
        return {
          subcontract_id: id,
          responsibility_id: responsibilityId || '',
        };
      }).filter(item => item.responsibility_id);

      if (responsibilityPayload.length > 0) {
        await subcontractResponsibilityService.createMany(responsibilityPayload);
      }
    }
  }
};
