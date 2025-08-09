
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/contexts/DataContext';
import { parseExcelFile, validateExcelFile, createExcelTemplate } from '@/utils/excel/excelParser';
import { mapRawDataToSubcontractData, processExcelMergedCells } from '@/utils/subcontract/dataMapper';
import { processImportData } from '@/utils/subcontract/importProcessor';
import { clearSessionGeneratedIds } from '@/services/subcontract/subcontractCreation';
import * as XLSX from 'xlsx';

export function useSubcontractsImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const { addSubcontract, projects, subcontractors } = useData();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected for upload:', file.name, file.size, file.type);

    // Validate file
    const validationError = validateExcelFile(file);
    if (validationError) {
      console.error('File validation failed:', validationError);
      toast({
        title: "Invalid file",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    try {
      setIsImporting(true);
      console.log('Starting import process...');
      
      // Parse Excel file
      const rawData = await parseExcelFile(file);
      console.log('Parsed raw data:', rawData);
      
      if (!rawData || rawData.length <= 1) {
        console.warn('No data found in file');
        toast({
          title: "No data found",
          description: "The Excel file appears to be empty or contains only headers.",
          variant: "destructive"
        });
        return;
      }

      // Skip header row and map data
      const dataRows = rawData.slice(1);
      console.log('Data rows after skipping header:', dataRows);
      
      const mappedData = mapRawDataToSubcontractData(dataRows);
      console.log('Mapped data:', mappedData);

      if (mappedData.length === 0) {
        console.warn('No valid rows found after mapping');
        toast({
          title: "No valid data",
          description: "No valid rows found in the Excel file.",
          variant: "destructive"
        });
        return;
      }

      // Process merged cells
      const processedData = processExcelMergedCells(mappedData);
      console.log('Processed data with merged cells:', processedData);

      if (processedData.length === 0) {
        console.warn('No valid data after processing merged cells');
        toast({
          title: "No valid data",
          description: "No valid subcontract data found in the file after processing.",
          variant: "destructive"
        });
        return;
      }

      console.log('Setting import data and showing preview');
      setImportData(processedData);
      setShowPreview(true);
      
      toast({
        title: "File processed",
        description: `Found ${processedData.length} records ready for import.`,
      });
      
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Import failed",
        description: `Failed to parse Excel file: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const processImport = async (data: any[]) => {
    console.log('Starting import process with data:', data);
    setIsImporting(true);
    setShowPreview(false);
    
    try {
      // Clear any previous session IDs before starting new import
      clearSessionGeneratedIds();
      
      await processImportData(data, addSubcontract, projects, subcontractors, toast);
      console.log('Import process completed successfully');
      
      // Clear session IDs after successful import
      clearSessionGeneratedIds();
    } catch (error) {
      console.error('Import processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Import failed",
        description: `An error occurred while processing the import: ${errorMessage}`,
        variant: "destructive"
      });
      // Clear session IDs even on error to prevent issues with next import
      clearSessionGeneratedIds();
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    console.log('Downloading template...');
    try {
      const templateData = [
        {
          'Date of Issuing': '2024-01-15',
          'Project Name': 'Sample Project',
          'Subcontractor Company': 'Sample Company',
          'Type of contract': 'subcontract',
          'Trades': 'Masonry',
          'Items': 'Brick Work',
          'QTY': 100,
          'Rate': 50,
          'wastage': 5,
          'Responsibilities': 'Material supply, Labor'
        }
      ];

      const workbook = createExcelTemplate(templateData);
      XLSX.writeFile(workbook, 'subcontract_import_template.xlsx');
      
      toast({
        title: "Template downloaded",
        description: "Excel template has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error downloading template:', error);
      toast({
        title: "Download failed",
        description: "Failed to download template file.",
        variant: "destructive"
      });
    }
  };

  return {
    isImporting,
    importData,
    showPreview,
    setShowPreview,
    handleFileUpload,
    processImport,
    downloadTemplate
  };
}
