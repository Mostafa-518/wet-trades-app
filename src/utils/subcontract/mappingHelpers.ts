
import { Subcontract, TradeItem } from '@/types/subcontract';

// This utility maps a DB row to the frontend Subcontract type.
export function mapSubcontractToFrontend(dbRow: any): Subcontract {
  console.log('Mapping DB row to frontend:', dbRow);
  
  // Fallbacks for required fields
  const contractType = dbRow.contractType || dbRow.contract_type || 'subcontract';
  const addendumNumber = dbRow.addendumNumber || dbRow.addendum_number || undefined;
  const parentSubcontractId = dbRow.parentSubcontractId || dbRow.parent_subcontract_id || undefined;

  // Map trade items from database format to frontend format
  let tradeItems: TradeItem[] = [];
  if (dbRow.tradeItems && Array.isArray(dbRow.tradeItems)) {
    tradeItems = dbRow.tradeItems.map((dbTradeItem: any) => {
      console.log('Processing trade item:', dbTradeItem);
      
      // Handle nested trade_items structure from Supabase joins
      const tradeItemData = dbTradeItem.trade_items || dbTradeItem;
      const tradeData = tradeItemData?.trades || {};
      
      const quantity = dbTradeItem.quantity || 0;
      const unitPrice = dbTradeItem.unit_price || 0;
      // Calculate total without wastage: QTY * Rate only
      const total = quantity * unitPrice;
      
      return {
        id: dbTradeItem.id || crypto.randomUUID(),
        trade: tradeData.name || tradeItemData?.trade || 'Unknown Trade',
        item: tradeItemData?.name || 'Unknown Item',
        unit: tradeItemData?.unit || 'Each',
        quantity,
        unitPrice,
        total, // This excludes wastage
        wastagePercentage: dbTradeItem.wastage_percentage || 0
      };
    });
  }

  // Map responsibilities to an array of names (strings), not objects
  let responsibilities: string[] = [];
  if (dbRow.responsibilities && Array.isArray(dbRow.responsibilities)) {
    responsibilities = dbRow.responsibilities
      .map((respObj: any) => {
        // from Supabase join, format is:
        // respObj: { id, subcontract_id, responsibility_id, created_at, responsibilities: { id, name, ... } }
        if (respObj.responsibilities && respObj.responsibilities.name) {
          return respObj.responsibilities.name;
        }
        // fallback for old format or direct string
        if (typeof respObj === "string") return respObj;
        return undefined;
      })
      .filter(Boolean);
  }

  // Calculate total value without wastage
  const totalValue = tradeItems.reduce((sum, item) => sum + (item.total || 0), 0);

  const mapped = {
    id: dbRow.id,
    contractId: dbRow.contractId || dbRow.contract_number || '',
    project: dbRow.project || dbRow.project_id || '',
    subcontractor: dbRow.subcontractor || dbRow.subcontractor_id || '',
    tradeItems,
    responsibilities,
    totalValue, // Calculated without wastage
    status: dbRow.status || 'draft',
    startDate: dbRow.startDate || dbRow.start_date || '',
    endDate: dbRow.endDate || dbRow.end_date || '',
    dateOfIssuing: dbRow.dateOfIssuing || dbRow.date_of_issuing || '',
    description: dbRow.description || '',
    pdfUrl: dbRow.pdfUrl || dbRow.pdf_url || '',
    createdAt: dbRow.createdAt || dbRow.created_at || '',
    updatedAt: dbRow.updatedAt || dbRow.updated_at || '',
    contractType,
    addendumNumber: addendumNumber === null ? undefined : addendumNumber,
    parentSubcontractId: parentSubcontractId === null ? undefined : parentSubcontractId,
  };

  console.log('Mapped subcontract:', mapped);
  return mapped;
}

/**
 * Finds the trade item ID by tradeId and item name.
 * Used for mapping trade/item name to DB ID during subcontract save.
 */
export function findTradeItemId(tradeItems: any[], tradeId: string, itemName: string): string | undefined {
  // tradeItems: typically array of all trade items in the app [{ id, trade_id, name, ... }]
  return (tradeItems || []).find(
    (ti) => ti.trade_id === tradeId && ti.name === itemName
  )?.id;
}

/**
 * Finds the responsibility ID by name.
 * Used for mapping responsibility name to DB ID during subcontract save.
 */
export function findResponsibilityId(responsibilities: any[], responsibilityName: string): string | undefined {
  // responsibilities: typically array of all responsibilities [{ id, name, ... }]
  return (responsibilities || []).find(
    (resp) => resp.name === responsibilityName
  )?.id;
}
