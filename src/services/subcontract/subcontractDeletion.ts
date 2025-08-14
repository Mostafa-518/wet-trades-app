
import { subcontractService, subcontractTradeItemService, subcontractResponsibilityService } from '@/services';

export const deleteSubcontractWithTradeItems = async (id: string) => {
  // Delete responsibilities first
  await subcontractResponsibilityService.deleteBySubcontractId(id);
  // Delete trade items
  await subcontractTradeItemService.deleteBySubcontractId(id);
  // Delete the subcontract
  await subcontractService.delete(id);
};

export const deleteManySubcontractsWithTradeItems = async (ids: string[]) => {
  for (const id of ids) {
    await subcontractResponsibilityService.deleteBySubcontractId(id);
    await subcontractTradeItemService.deleteBySubcontractId(id);
    await subcontractService.delete(id);
  }
};
