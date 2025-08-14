
import * as XLSX from 'xlsx';

export interface ExcelParseOptions {
  header?: number;
  defval?: string;
  raw?: boolean;
}

export const parseExcelFile = async (file: File): Promise<any[][]> => {
  console.log('Starting to parse Excel file:', file.name, file.size);
  
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('No worksheets found in the Excel file');
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    console.log('Raw worksheet:', worksheet);
    
    // Parse as array of arrays first to handle merged cells better
    const rawData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      raw: false
    });

    console.log('Raw data as arrays:', rawData);
    
    if (!rawData || rawData.length === 0) {
      throw new Error('No data found in the Excel file');
    }
    
    return rawData as any[][];
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const validateExcelFile = (file: File): string | null => {
  console.log('Validating Excel file:', file.name, file.type, file.size);
  
  // Validate file type
  const validExtensions = ['.xlsx', '.xls'];
  const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  
  if (!hasValidExtension) {
    return "Please upload an Excel file (.xlsx or .xls)";
  }

  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return "Please upload a file smaller than 10MB";
  }

  // Check if file is empty
  if (file.size === 0) {
    return "The uploaded file is empty";
  }

  return null;
};

export const createExcelTemplate = (templateData: any[]) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Subcontracts');
    return workbook;
  } catch (error) {
    console.error('Error creating Excel template:', error);
    throw new Error('Failed to create Excel template');
  }
};
