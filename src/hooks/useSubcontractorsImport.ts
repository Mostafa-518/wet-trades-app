
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SubcontractorFormData } from '@/types/subcontractor';
import { useData } from '@/contexts/DataContext';
import * as XLSX from 'xlsx';

export function useSubcontractorsImport() {
  const { addSubcontractor } = useData();
  const { toast } = useToast();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState<SubcontractorFormData[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Starting file upload

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          raw: false
        });

        // Processing Excel data
        
        const rows = jsonData as any[][];

        const mappedData: SubcontractorFormData[] = rows
          .filter((row, index) => {
            const hasData = row && row.length > 0 && row.some(cell => cell && String(cell).trim());
            return hasData;
          })
          .map((row, index) => {
            // Processing row
            
            const mappedItem = {
              companyName: String(row[0] || '').trim(), // Company Name
              representativeName: String(row[1] || '').trim(), // Representative Name
              commercialRegistration: String(row[2] || '').trim(), // Commercial Registration
              taxCardNo: String(row[3] || '').trim(), // Tax Card No.
              phone: String(row[4] || '').trim(), // Phone Contact
              email: String(row[5] || '').trim(), // Mail
            };
            
            return mappedItem;
          })
          .filter(item => {
            const isValid = item.companyName && item.companyName.length > 0;
            return isValid;
          });

        if (mappedData.length === 0) {
          toast({
            title: "No Data Found", 
            description: "No valid company names found in the Excel file. Please ensure your data contains company names in the first column.",
            variant: "destructive"
          });
          return;
        }
        
        setImportData(mappedData);
        setShowImportDialog(true);
        
        toast({
          title: "File Processed",
          description: `Found ${mappedData.length} records to import`,
        });
        
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: "Import Error",
          description: "Failed to parse Excel file. Please check the format and try again.",
          variant: "destructive"
        });
      }
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      toast({
        title: "File Read Error",
        description: "Failed to read the Excel file. Please try again.",
        variant: "destructive"
      });
    };
    
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  const handleImport = async (data: SubcontractorFormData[]) => {
    if (!data || data.length === 0) {
      toast({
        title: "Import Error",
        description: "No data to import",
        variant: "destructive"
      });
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const [index, item] of data.entries()) {
      try {
        if (!item.companyName || !item.companyName.trim()) {
          errors.push(`Row ${index + 1}: Missing company name`);
          errorCount++;
          continue;
        }

        const subcontractorData: SubcontractorFormData = {
          companyName: item.companyName.trim(),
          representativeName: item.representativeName?.trim() || '',
          commercialRegistration: item.commercialRegistration?.trim() || '',
          taxCardNo: item.taxCardNo?.trim() || '',
          email: item.email?.trim() || '',
          phone: item.phone?.trim() || ''
        };
        await addSubcontractor(subcontractorData);
        successCount++;
      } catch (error) {
        // Error importing item
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Row ${index + 1}: ${item.companyName || 'Unknown'} - ${errorMessage}`);
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast({
        title: "Import Completed",
        description: `${successCount} subcontractor${successCount !== 1 ? 's' : ''} imported successfully${errorCount > 0 ? `. ${errorCount} failed.` : ''}`,
      });
    } else {
      toast({
        title: "Import Failed", 
        description: errorCount > 0 ? `All ${errorCount} items failed to import. Please check the data format.` : "No items could be imported.",
        variant: "destructive"
      });
    }

    setShowImportDialog(false);
    setImportData([]);
  };

  const downloadTemplate = () => {
    const template = [
      ['Company Name', 'Representative Name', 'Commercial Registration', 'Tax Card No.', 'Phone Contact', 'Mail'],
      ['Sample Company Ltd.', 'John Doe', 'CR-001-2024', 'TAX-001-2024', '+20 100 123 4567', 'john@example.com']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subcontractors Template');
    XLSX.writeFile(wb, 'subcontractors_template.xlsx');
  };

  

  return {
    showImportDialog,
    setShowImportDialog,
    importData,
    setImportData,
    handleFileUpload,
    handleImport,
    downloadTemplate
  };
}
