
import { Subcontract } from '@/types/subcontract';

/**
 * Validates that a contract ID is unique among existing contracts
 */
export function validateContractIdUniqueness(
  contractId: string,
  existingContracts: Subcontract[]
): boolean {
  const isDuplicate = existingContracts.some(contract => contract.contractId === contractId);
  console.log('Contract ID uniqueness check:', { contractId, isDuplicate: isDuplicate });
  return !isDuplicate;
}

/**
 * Validates addendum contract ID format
 * Expected format: [parent-contract-number]-ADDXX (e.g., ID-0504-0001-ADD01)
 */
export function validateAddendumFormat(contractId: string): boolean {
  const addendumPattern = /^.+-ADD\d{2}$/;
  return addendumPattern.test(contractId);
}

/**
 * Validates regular subcontract ID format
 * Expected format: ID-[project-code]-XXXX (e.g., ID-0504-0001)
 */
export function validateSubcontractFormat(contractId: string, projectCode: string): boolean {
  const subcontractPattern = new RegExp(`^ID-${projectCode}-\\d{4}$`);
  return subcontractPattern.test(contractId);
}
