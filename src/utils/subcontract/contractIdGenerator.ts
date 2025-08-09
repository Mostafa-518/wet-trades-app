
import { Subcontract } from '@/types/subcontract';

/**
 * Generates the next addendum number for a given parent contract
 * Uses the contract_number field to find existing addendums
 */
export async function getNextAddendumNumber(
  parentContractNumber: string,
  existingContracts: Subcontract[] = []
): Promise<string> {
  console.log('Getting next addendum number for parent contract:', parentContractNumber);
  
  // Find existing addendums for this parent contract using the contract_number pattern
  const addendumPattern = new RegExp(`^${parentContractNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-ADD(\\d{2})$`);
  
  const existingAddendums = existingContracts.filter(contract => {
    const match = contract.contractId && contract.contractId.match(addendumPattern);
    return match && contract.contractType === 'ADD';
  });
  
  console.log('Found existing addendums:', existingAddendums.length);
  
  // Find the highest addendum number
  let maxAddendumNumber = 0;
  existingAddendums.forEach(contract => {
    if (contract.contractId) {
      const match = contract.contractId.match(addendumPattern);
      if (match) {
        const addendumNum = parseInt(match[1], 10);
        if (addendumNum > maxAddendumNumber) {
          maxAddendumNumber = addendumNum;
        }
      }
    }
  });
  
  // Generate next addendum number (ADD01, ADD02, etc.)
  const nextAddendumNumber = (maxAddendumNumber + 1).toString().padStart(2, '0');
  console.log('Next addendum number:', nextAddendumNumber);
  
  return nextAddendumNumber;
}

/**
 * Generates a unique contract ID based on the contract type and project
 * Format: ID-[project-code]-XXXX for subcontracts
 * Format: [parent-contract-number]-ADDXX for addendums
 */
export async function generateContractId(
  contractType: 'subcontract' | 'ADD',
  projectCode: string,
  parentSubcontractId?: string,
  existingContracts: Subcontract[] = [],
  generatedIdsInSession: Set<string> = new Set()
): Promise<string> {
  console.log('Generating contract ID:', { contractType, projectCode, parentSubcontractId });
  console.log('Existing contracts for ID generation:', existingContracts.length);
  console.log('Generated IDs in session:', Array.from(generatedIdsInSession));
  
  if (contractType === 'ADD') {
    if (!parentSubcontractId) {
      throw new Error('Parent contract ID is required for addendums');
    }
    
    // Find the parent contract to get its contract_number
    const parentContract = existingContracts.find(contract => contract.id === parentSubcontractId);
    if (!parentContract || !parentContract.contractId) {
      throw new Error('Parent contract not found or missing contract ID');
    }
    
    const parentContractNumber = parentContract.contractId;
    console.log('Parent contract number:', parentContractNumber);
    
    // Get the next addendum number for this parent contract
    const nextAddendumNumber = await getNextAddendumNumber(parentContractNumber, existingContracts);
    const generatedId = `${parentContractNumber}-ADD${nextAddendumNumber}`;
    
    console.log('Generated addendum ID:', generatedId);
    return generatedId;
  } else {
    // For regular subcontracts: ID-[project-code]-XXXX
    // Find existing subcontracts for this project (including both DB and session)
    const projectPattern = `ID-${projectCode}-`;
    
    // Get all existing contract IDs for this project
    const allProjectContractIds = new Set<string>();
    
    // Add existing contracts from database
    existingContracts.forEach(contract => {
      if (contract.contractId && 
          contract.contractId.startsWith(projectPattern) && 
          contract.contractType === 'subcontract') {
        allProjectContractIds.add(contract.contractId);
      }
    });
    
    // Add contracts generated in this session
    generatedIdsInSession.forEach(contractId => {
      if (contractId.startsWith(projectPattern)) {
        allProjectContractIds.add(contractId);
      }
    });
    
    console.log('All project contract IDs:', Array.from(allProjectContractIds));
    
    // Find the highest sequential number for this project
    let maxNumber = 0;
    allProjectContractIds.forEach(contractId => {
      const match = contractId.match(new RegExp(`^ID-${projectCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d{4})$`));
      if (match) {
        const number = parseInt(match[1], 10);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    });
    
    // Generate next sequential number
    const nextNumber = (maxNumber + 1).toString().padStart(4, '0');
    const generatedId = `ID-${projectCode}-${nextNumber}`;
    
    console.log('Generated subcontract ID:', generatedId);
    return generatedId;
  }
}
