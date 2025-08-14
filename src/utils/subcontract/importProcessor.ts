
import { useToast } from '@/hooks/use-toast';
import { SubcontractImportData, groupByContract } from './dataMapper';
import { validateRow, validateContractData } from './importValidator';
import { generateContractId } from './contractIdGenerator';

export const processImportData = async (
  data: SubcontractImportData[],
  addSubcontract: (data: any) => Promise<any>,
  projects: any[],
  subcontractors: any[],
  toast: ReturnType<typeof useToast>['toast']
) => {
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];
  const generatedContractIds = new Set<string>(); // Track IDs generated in this session

  console.log('Starting import process with data:', data);
  console.log('Available projects:', projects.map(p => ({ id: p.id, name: p.name, code: p.code })));
  console.log('Available subcontractors:', subcontractors.map(s => ({ id: s.id, name: s.companyName })));

  // Group data by contract (same Date of Issuing, Project Name, Subcontractor Company, Type of contract)
  const contractGroups = groupByContract(data);
  console.log('Contract groups:', Object.keys(contractGroups));

  for (const [groupKey, groupData] of Object.entries(contractGroups)) {
    try {
      console.log(`Processing contract group: ${groupKey}`);
      
      // Use the first row for contract details
      const contractRow = groupData[0];
      console.log('Contract row:', contractRow);
      
      // Validate contract-level data
      const contractErrors = validateContractData(contractRow);
      if (contractErrors.length > 0) {
        errorCount++;
        errors.push(`Contract "${groupKey}": ${contractErrors.join(', ')}`);
        console.error(`Contract validation failed for ${groupKey}:`, contractErrors);
        continue;
      }

      // Find project ID with case-insensitive and flexible matching
      const projectName = contractRow['Project Name'].trim();
      const project = projects.find(p => 
        p.name && p.name.toLowerCase().trim() === projectName.toLowerCase()
      );
      
      if (!project) {
        errorCount++;
        const availableProjects = projects.map(p => p.name).join(', ');
        errors.push(`Contract "${groupKey}": Project "${projectName}" not found. Available projects: ${availableProjects}`);
        console.error(`Project not found: "${projectName}". Available:`, projects.map(p => p.name));
        continue;
      }

      // Check if project has a code
      if (!project.code) {
        errorCount++;
        errors.push(`Contract "${groupKey}": Project "${projectName}" doesn't have a project code required for contract ID generation`);
        console.error(`Project "${projectName}" missing code:`, project);
        continue;
      }

      // Find subcontractor ID with case-insensitive and flexible matching
      const subcontractorName = contractRow['Subcontractor Company'].trim();
      const subcontractor = subcontractors.find(s => 
        s.companyName && s.companyName.toLowerCase().trim() === subcontractorName.toLowerCase()
      );
      
      if (!subcontractor) {
        errorCount++;
        const availableSubcontractors = subcontractors.map(s => s.companyName).join(', ');
        errors.push(`Contract "${groupKey}": Subcontractor "${subcontractorName}" not found. Available subcontractors: ${availableSubcontractors}`);
        console.error(`Subcontractor not found: "${subcontractorName}". Available:`, subcontractors.map(s => s.companyName));
        continue;
      }

      console.log(`Found project: ${project.name} (ID: ${project.id}, Code: ${project.code})`);
      console.log(`Found subcontractor: ${subcontractor.companyName} (ID: ${subcontractor.id})`);

      // Process all trade items for this contract
      const tradeItemsList = [];
      let hasValidTradeItems = false;
      const rowErrors: string[] = [];

      for (let i = 0; i < groupData.length; i++) {
        const row = groupData[i];
        console.log(`Processing trade item row ${i + 1}:`, row);
        
        // Skip rows that don't have trade data
        if (!row['Trades'] && !row['Items'] && !row['QTY'] && !row['Rate']) {
          console.log(`Skipping row ${i + 1} - no trade data`);
          continue;
        }

        const rowValidationErrors = validateRow(row, i + 1);
        if (rowValidationErrors.length > 0) {
          rowErrors.push(`Row ${i + 1}: ${rowValidationErrors.join(', ')}`);
          console.error(`Row validation failed for row ${i + 1}:`, rowValidationErrors);
          continue;
        }

        // Create trade item with better defaults
        const quantity = Number(row['QTY']) || 1;
        const unitPrice = Number(row['Rate']) || 0;
        const wastage = Number(row['wastage']) || 0;
        
        const tradeItem = {
          id: `imported-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
          trade: row['Trades'].trim(),
          item: row['Items'].trim(),
          unit: 'unit', // Default unit
          quantity: quantity,
          unitPrice: unitPrice,
          total: quantity * unitPrice,
          wastagePercentage: wastage
        };

        console.log(`Created trade item:`, tradeItem);
        tradeItemsList.push(tradeItem);
        hasValidTradeItems = true;
      }

      if (!hasValidTradeItems) {
        errorCount++;
        const errorMsg = rowErrors.length > 0 
          ? `No valid trade items found. Errors: ${rowErrors.join('; ')}`
          : 'No valid trade items found';
        errors.push(`Contract "${groupKey}": ${errorMsg}`);
        console.error(`No valid trade items for contract ${groupKey}. Row errors:`, rowErrors);
        continue;
      }

      // Calculate total value
      const totalValue = tradeItemsList.reduce((sum, item) => sum + item.total, 0);
      console.log(`Total contract value: ${totalValue}`);

      // Parse responsibilities from the first row
      const responsibilityList = contractRow['Responsibilities'] 
        ? contractRow['Responsibilities'].split(',').map(r => r.trim()).filter(r => r.length > 0)
        : [];

      // Parse date with flexible formats
      let dateOfIssuing = new Date().toISOString().split('T')[0]; // Default to today
      if (contractRow['Date of Issuing'] && contractRow['Date of Issuing'].trim()) {
        const dateStr = contractRow['Date of Issuing'].trim();
        const dateFormats = [
          dateStr,
          dateStr.replace(/\//g, '-'),
          dateStr.replace(/\./g, '-'),
          dateStr.replace(/\s+/g, '-')
        ];
        
        for (const format of dateFormats) {
          const date = new Date(format);
          if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
            dateOfIssuing = date.toISOString().split('T')[0];
            break;
          }
        }
      }

      // Normalize contract type
      let contractType: 'subcontract' | 'ADD' = 'subcontract';
      if (contractRow['Type of contract']) {
        const typeStr = contractRow['Type of contract'].trim().toLowerCase();
        if (typeStr === 'add' || typeStr === 'addendum') {
          contractType = 'ADD';
        }
      }

      // Generate unique contract ID for this import session
      let attempts = 0;
      let uniqueContractId = '';
      const maxAttempts = 100; // Prevent infinite loops
      
      do {
        attempts++;
        if (attempts > maxAttempts) {
          throw new Error(`Failed to generate unique contract ID after ${maxAttempts} attempts`);
        }
        
        // Generate contract ID (this will be auto-generated based on existing contracts in DB)
        // We'll let the creation service handle this and track the generated ID
        uniqueContractId = `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      } while (generatedContractIds.has(uniqueContractId));
      
      // Add to our tracking set
      generatedContractIds.add(uniqueContractId);

      // Create subcontract data - let the creation service auto-generate the actual contract ID
      const subcontractData = {
        project: project.id,
        subcontractor: subcontractor.id,
        tradeItems: tradeItemsList,
        responsibilities: responsibilityList,
        totalValue,
        status: 'draft' as const,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateOfIssuing: dateOfIssuing,
        description: `Imported ${contractType === 'ADD' ? 'addendum' : 'subcontract'} for ${project.name} with ${subcontractor.companyName}`,
        contractType: contractType,
        // Don't set contractId here - let the creation service auto-generate it with proper sequential numbering
        parentSubcontractId: contractType === 'ADD' ? undefined : undefined // Will be handled in creation if needed
      };

      console.log('Final subcontract data:', subcontractData);

      const result = await addSubcontract(subcontractData);
      
      // Track the actual generated contract ID
      if (result && result.contractId) {
        generatedContractIds.add(result.contractId);
        console.log(`Successfully imported contract: ${groupKey} with ID: ${result.contractId}`);
      }
      
      successCount++;
      
    } catch (error) {
      errorCount++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Contract "${groupKey}": ${errorMessage}`);
      console.error(`Error importing contract ${groupKey}:`, error);
    }
  }

  // Show detailed results
  console.log(`Import completed: ${successCount} success, ${errorCount} errors`);
  console.log('All errors:', errors);

  if (successCount > 0) {
    toast({
      title: "Import completed",
      description: `Successfully imported ${successCount} subcontract(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}`
    });
  }

  if (errors.length > 0) {
    console.error('Import errors:', errors);
    // Show first few errors in toast for user feedback
    const errorPreview = errors.slice(0, 3).join('\n');
    const moreErrors = errors.length > 3 ? `\n...and ${errors.length - 3} more errors` : '';
    
    toast({
      title: "Import errors",
      description: `${errorCount} contracts failed to import:\n${errorPreview}${moreErrors}\n\nCheck console for full details.`,
      variant: "destructive"
    });
  }
};
