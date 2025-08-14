
import * as XLSX from 'xlsx';
import { ReportTableData } from '@/types/report';

export const exportTableToExcel = (tableData: ReportTableData[], filters: any) => {
  try {
    // Prepare data for Excel
    const excelData = tableData.map((row, index) => ({
      'Item': row.item,
      'Average Rate': row.averageRate.toFixed(2),
      'Total Amount': row.totalAmount,
      'Total Quantity': row.totalQuantity,
      'Wastage %': row.wastage,
      'Unit': row.unit,
      'Count': row.count
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Add main data sheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, 'Report Data');
    
    // Add filters sheet
    const filtersData = [
      { Filter: 'Month', Value: filters.month || 'All' },
      { Filter: 'Year', Value: filters.year || 'All' },
      { Filter: 'Location', Value: filters.location || 'All' },
      { Filter: 'Trades', Value: filters.trades || 'All' },
      { Filter: 'Project Name', Value: filters.projectName || 'All' },
      { Filter: 'Project Code', Value: filters.projectCode || 'All' },
      { Filter: 'Present Data', Value: filters.presentData || 'by-project' },
      { Filter: 'Facilities', Value: filters.facilities?.join(', ') || 'None' }
    ];
    
    const filtersWs = XLSX.utils.json_to_sheet(filtersData);
    XLSX.utils.book_append_sheet(wb, filtersWs, 'Applied Filters');
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `report-table-${timestamp}.xlsx`;
    
    // Download file
    XLSX.writeFile(wb, filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Error exporting table to Excel:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const exportGraphsToPDF = async (filters: any) => {
  try {
    // Get the graphs container
    const graphsContainer = document.querySelector('[data-graphs-container]');
    
    if (!graphsContainer) {
      throw new Error('Graphs container not found');
    }
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }
    
    // Clone the graphs content
    const clonedContent = graphsContainer.cloneNode(true) as HTMLElement;
    
    // Create HTML structure for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Report Graphs</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              background: white;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .filters {
              margin-bottom: 20px;
              padding: 10px;
              background: #f5f5f5;
              border-radius: 5px;
            }
            .filter-item {
              display: inline-block;
              margin: 5px 10px;
              padding: 3px 8px;
              background: #dbeafe;
              border-radius: 3px;
              font-size: 12px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body>
          <div class="header">
            <h1>Report Graphs</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="filters">
            <h3>Applied Filters:</h3>
            ${Object.entries(filters)
              .filter(([key, value]) => 
                value && value !== 'all' && value !== 'All' && 
                (Array.isArray(value) ? value.length > 0 : true)
              )
              .map(([key, value]) => {
                const displayValue = Array.isArray(value) ? value.join(', ') : value;
                return `<span class="filter-item">${key}: ${displayValue}</span>`;
              })
              .join('')
            }
          </div>
          
          <div class="graphs-content">
            ${clonedContent.innerHTML}
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    }, 1000);
    
    return { success: true };
  } catch (error) {
    console.error('Error exporting graphs to PDF:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
