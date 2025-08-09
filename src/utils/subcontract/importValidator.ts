
import { SubcontractImportData } from './dataMapper';

export const validateRow = (row: SubcontractImportData, index: number): string[] => {
  const errors: string[] = [];

  console.log(`Validating row ${index}:`, row);

  // Only validate contract-level fields if they're present (for header rows)
  // Allow empty fields for continuation rows (trade items under the same contract)
  const hasContractData = row['Project Name'] || row['Subcontractor Company'] || row['Type of contract'];
  
  if (hasContractData) {
    // Required fields validation for contract-level data
    if (!row['Project Name'] || !row['Project Name'].trim()) {
      errors.push('Project Name is required');
    }
    if (!row['Subcontractor Company'] || !row['Subcontractor Company'].trim()) {
      errors.push('Subcontractor Company is required');
    }
    if (!row['Type of contract'] || !row['Type of contract'].trim()) {
      errors.push('Type of contract is required');
    }
  }

  // Validate trade items - these should be present for all rows that have data
  const hasTradeData = row['Trades'] || row['Items'] || row['QTY'] || row['Rate'];
  if (hasTradeData) {
    if (!row['Trades'] || !row['Trades'].trim()) {
      errors.push('Trades is required when trade data is present');
    }
    if (!row['Items'] || !row['Items'].trim()) {
      errors.push('Items is required when trade data is present');
    }
  }

  // Numeric validations - only validate if values are provided
  const qtyValue = row['QTY'];
  if (qtyValue !== undefined && qtyValue !== null && String(qtyValue).trim() !== '') {
    const qty = Number(qtyValue);
    if (isNaN(qty)) {
      errors.push(`QTY must be a valid number, got: "${qtyValue}"`);
    } else if (qty < 0) {
      errors.push('QTY must be a non-negative number');
    }
  }
  
  const rateValue = row['Rate'];
  if (rateValue !== undefined && rateValue !== null && String(rateValue).trim() !== '') {
    const rate = Number(rateValue);
    if (isNaN(rate)) {
      errors.push(`Rate must be a valid number, got: "${rateValue}"`);
    } else if (rate < 0) {
      errors.push('Rate must be a non-negative number');
    }
  }
  
  const wastageValue = row['wastage'];
  if (wastageValue !== undefined && wastageValue !== null && String(wastageValue).trim() !== '') {
    const wastage = Number(wastageValue);
    if (isNaN(wastage)) {
      errors.push(`Wastage must be a valid number, got: "${wastageValue}"`);
    } else if (wastage < 0 || wastage > 100) {
      errors.push('Wastage must be a number between 0 and 100');
    }
  }

  // Date validation - be more flexible with date formats
  if (row['Date of Issuing'] && row['Date of Issuing'].trim()) {
    const dateStr = row['Date of Issuing'].trim();
    
    // Try multiple date formats
    const dateFormats = [
      dateStr,
      dateStr.replace(/\//g, '-'),
      dateStr.replace(/\./g, '-'),
      dateStr.replace(/\s+/g, '-')
    ];
    
    let validDate = false;
    for (const format of dateFormats) {
      const date = new Date(format);
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
        validDate = true;
        break;
      }
    }
    
    if (!validDate) {
      errors.push(`Date of Issuing must be a valid date, got: "${dateStr}". Try formats like YYYY-MM-DD, MM/DD/YYYY, or DD.MM.YYYY`);
    }
  }

  // Contract type validation - be case insensitive and more flexible
  if (row['Type of contract'] && row['Type of contract'].trim()) {
    const contractType = row['Type of contract'].trim().toLowerCase();
    const validTypes = ['subcontract', 'add', 'addendum'];
    if (!validTypes.includes(contractType)) {
      errors.push(`Type of contract must be one of: ${validTypes.join(', ')}, got: "${row['Type of contract']}"`);
    }
  }

  if (errors.length > 0) {
    console.log(`Validation errors for row ${index}:`, errors);
  }
  return errors;
};

export const validateContractData = (row: SubcontractImportData): string[] => {
  const errors: string[] = [];

  console.log('Validating contract data:', row);

  if (!row['Project Name'] || !row['Project Name'].trim()) {
    errors.push('Project Name is required');
  }
  if (!row['Subcontractor Company'] || !row['Subcontractor Company'].trim()) {
    errors.push('Subcontractor Company is required');
  }
  if (!row['Type of contract'] || !row['Type of contract'].trim()) {
    errors.push('Type of contract is required');
  }

  // Date validation with better error messages
  if (row['Date of Issuing'] && row['Date of Issuing'].trim()) {
    const dateStr = row['Date of Issuing'].trim();
    
    // Try multiple date formats
    const dateFormats = [
      dateStr,
      dateStr.replace(/\//g, '-'),
      dateStr.replace(/\./g, '-'),
      dateStr.replace(/\s+/g, '-')
    ];
    
    let validDate = false;
    for (const format of dateFormats) {
      const date = new Date(format);
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
        validDate = true;
        break;
      }
    }
    
    if (!validDate) {
      errors.push(`Invalid date format: "${dateStr}". Please use YYYY-MM-DD, MM/DD/YYYY, or DD.MM.YYYY`);
    }
  }

  // Contract type validation - more flexible
  if (row['Type of contract'] && row['Type of contract'].trim()) {
    const contractType = row['Type of contract'].trim().toLowerCase();
    const validTypes = ['subcontract', 'add', 'addendum'];
    if (!validTypes.includes(contractType)) {
      errors.push(`Invalid contract type: "${row['Type of contract']}". Must be one of: ${validTypes.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    console.log('Contract validation errors:', errors);
  }
  return errors;
};
