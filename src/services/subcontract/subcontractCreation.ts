
import { subcontractService, subcontractTradeItemService, subcontractResponsibilityService } from '@/services';
import { Subcontract } from '@/types/subcontract';
import { 
  findTradeItemId, 
  findResponsibilityId, 
  generateContractId, 
  validateContractIdUniqueness,
  validateAddendumFormat,
  validateSubcontractFormat,
  getNextAddendumNumber
} from '@/utils/subcontract';
import { useToast } from '@/hooks/use-toast';

// Track generated IDs within the session to prevent duplicates during batch imports
const sessionGeneratedIds = new Set<string>();

export const createSubcontractWithTradeItems = async (
  data: Partial<Subcontract>,
  trades: any[],
  tradeItems: any[],
  toast: ReturnType<typeof useToast>['toast'],
  responsibilities: any[] = [],
  existingContracts: Subcontract[] = [],
  projects: any[] = []
) => {
  console.log('Creating subcontract with data:', data);
  console.log('Existing contracts count:', existingContracts.length);
  console.log('Session generated IDs:', Array.from(sessionGeneratedIds));

  if (!data.project || !data.subcontractor) {
    const error = new Error('Project and subcontractor are required');
    console.error('Validation error:', error);
    toast({
      title: "Project & Subcontractor missing",
      description: "You must select a Project and Subcontractor.",
      variant: "destructive"
    });
    throw error;
  }

  // Generate contract ID if not provided or is temporary
  let contractId = data.contractId;
  let addendumNumber: string | undefined;
  
  if (!contractId || contractId.startsWith('SC-') || contractId.startsWith('TEMP-') || contractId === '') {
    if (data.contractType === 'ADD') {
      // For addendums, we need the parent contract
      if (!data.parentSubcontractId) {
        const error = new Error('Parent contract is required for addendums');
        console.error('Parent contract error:', error);
        toast({
          title: "Parent Contract Missing",
          description: "Please select a parent contract for this addendum.",
          variant: "destructive"
        });
        throw error;
      }

      // Find parent contract to get its contract_number
      const parentContract = existingContracts.find(c => c.id === data.parentSubcontractId);
      if (!parentContract || !parentContract.contractId) {
        const error = new Error('Parent contract not found or missing contract ID');
        console.error('Parent contract not found:', error);
        toast({
          title: "Parent Contract Not Found",
          description: "The selected parent contract could not be found or is missing a contract ID.",
          variant: "destructive"
        });
        throw error;
      }

      // Get next addendum number and generate contract ID
      const nextAddendumNumber = await getNextAddendumNumber(parentContract.contractId, existingContracts);
      contractId = `${parentContract.contractId}-ADD${nextAddendumNumber}`;
      addendumNumber = nextAddendumNumber;
      
      console.log('Generated addendum ID:', contractId, 'with addendum number:', addendumNumber);
    } else {
      // For regular subcontracts
      const project = projects.find(p => p.id === data.project);
      if (!project || !project.code) {
        const error = new Error('Project code is required for contract ID generation');
        console.error('Project code error:', error);
        toast({
          title: "Project Code Missing",
          description: "The selected project doesn't have a valid project code.",
          variant: "destructive"
        });
        throw error;
      }
      
      // Generate contract ID with session tracking
      contractId = await generateContractId(
        'subcontract',
        project.code,
        undefined,
        existingContracts,
        sessionGeneratedIds
      );
      
      console.log('Generated regular contract ID:', contractId);
    }
    
    // Validate uniqueness against both DB and session
    const allExistingIds = new Set([
      ...existingContracts.map(c => c.contractId).filter(Boolean),
      ...sessionGeneratedIds
    ]);
    
    if (allExistingIds.has(contractId)) {
      const error = new Error('Contract ID conflict detected');
      console.error('Contract ID conflict:', error);
      toast({
        title: "Contract ID Conflict",
        description: "Generated contract ID already exists. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
    
    // Add to session tracking
    sessionGeneratedIds.add(contractId);
  }

  // Validate contract ID format
  if (data.contractType === 'ADD') {
    if (!validateAddendumFormat(contractId)) {
      const error = new Error('Invalid addendum contract ID format');
      console.error('Format validation error:', error);
      toast({
        title: "Invalid Addendum Format",
        description: "Addendum contract ID must follow format: [parent-contract-number]-ADDXX",
        variant: "destructive"
      });
      throw error;
    }
  } else {
    // For regular subcontracts
    const project = projects.find(p => p.id === data.project);
    if (project && project.code && !validateSubcontractFormat(contractId, project.code)) {
      const error = new Error('Invalid contract ID format');
      console.error('Format validation error:', error);
      toast({
        title: "Invalid Contract Format",
        description: `Contract ID must follow format: ID-${project.code}-XXXX`,
        variant: "destructive"
      });
      throw error;
    }
  }

  // Create the subcontract payload with proper addendum number handling
  const subcontractPayload = {
    contract_number: contractId,
    project_id: data.project,
    subcontractor_id: data.subcontractor,
    status: data.status || 'draft',
    total_value: data.totalValue || 0,
    start_date: data.startDate,
    end_date: data.endDate,
    description: data.description || '',
    contract_type: data.contractType || 'subcontract',
    addendum_number: data.contractType === 'ADD' ? addendumNumber : null,
    parent_subcontract_id: data.contractType === 'ADD' ? (data.parentSubcontractId || null) : null,
    date_of_issuing: data.dateOfIssuing || null,
  };

  console.log('Supabase insert payload:', subcontractPayload);

  let createdSubcontract;
  try {
    createdSubcontract = await subcontractService.create(subcontractPayload);
    console.log('Subcontract created successfully:', createdSubcontract);
    
    // Add the actual contract ID to our result for tracking
    createdSubcontract.contractId = contractId;
  } catch (error) {
    // Remove from session tracking if creation failed
    sessionGeneratedIds.delete(contractId);
    console.error("Error creating subcontract in Supabase:", error);
    toast({
      title: "Save Failed",
      description: `Could not save subcontract: ${error instanceof Error ? error.message : "Unknown error"}`,
      variant: "destructive"
    });
    throw error;
  }

  // Save trade items if any
  if (data.tradeItems && data.tradeItems.length > 0) {
    console.log('Processing trade items:', data.tradeItems);

    const tradeItemsPayload = data.tradeItems.map((item, index) => {
      const tradeId = trades.find(t => t.name === item.trade)?.id;
      const tradeItemId = findTradeItemId(tradeItems, tradeId || '', item.item);

      console.log(`Trade item ${index}:`, {
        tradeName: item.trade,
        tradeId,
        itemName: item.item,
        tradeItemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        wastagePercentage: item.wastagePercentage ?? 0
      });

      return {
        subcontract_id: createdSubcontract.id,
        trade_item_id: tradeItemId || '',
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.total,
        wastage_percentage: item.wastagePercentage ?? 0
      };
    }).filter(item => item.trade_item_id);

    if (tradeItemsPayload.length > 0) {
      try {
        await subcontractTradeItemService.createMany(tradeItemsPayload);
        console.log('Trade items saved successfully');
      } catch (tradeItemError) {
        console.error('Error saving trade items:', tradeItemError);
        toast({
          title: "Partial Success",
          description: "Subcontract created but some trade items could not be saved.",
          variant: "destructive"
        });
      }
    }
  }

  // Save responsibilities if any
  if (data.responsibilities && data.responsibilities.length > 0) {
    console.log('Processing responsibilities:', data.responsibilities);

    const responsibilityPayload = data.responsibilities.map((responsibilityName) => {
      const responsibilityId = findResponsibilityId(responsibilities, responsibilityName);

      return {
        subcontract_id: createdSubcontract.id,
        responsibility_id: responsibilityId || '',
      };
    }).filter(item => item.responsibility_id);

    if (responsibilityPayload.length > 0) {
      try {
        await subcontractResponsibilityService.createMany(responsibilityPayload);
        console.log('Responsibilities saved successfully');
      } catch (responsibilityError) {
        console.error('Error saving responsibilities:', responsibilityError);
        toast({
          title: "Partial Success",
          description: "Subcontract created but some responsibilities could not be saved.",
          variant: "destructive"
        });
      }
    }
  }

  console.log('Subcontract creation completed successfully');
  return createdSubcontract;
};

// Clear session tracking when needed (e.g., after successful batch import)
export const clearSessionGeneratedIds = () => {
  sessionGeneratedIds.clear();
  console.log('Session generated IDs cleared');
};
