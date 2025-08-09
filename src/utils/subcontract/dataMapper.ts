
export interface SubcontractImportData {
  'Date of Issuing': string;
  'Project Name': string;
  'Subcontractor Company': string;
  'Type of contract': string;
  'Trades': string;
  'Items': string;
  'QTY': number;
  'Rate': number;
  'wastage': number;
  'Responsibilities': string;
}

export const mapRawDataToSubcontractData = (dataRows: any[][]): SubcontractImportData[] => {
  console.log('Mapping raw data rows:', dataRows);
  
  return dataRows
    .filter(row => {
      const hasData = row && row.length > 0 && row.some(cell => cell && String(cell).trim());
      console.log('Row has data:', hasData, row);
      return hasData;
    })
    .map((row, index) => {
      console.log(`Processing row ${index + 1}:`, row);
      
      const mapped: any = {};
      
      // Map based on column positions with better null handling
      mapped['Date of Issuing'] = row[0] ? String(row[0]).trim() : '';
      mapped['Project Name'] = row[1] ? String(row[1]).trim() : '';
      mapped['Subcontractor Company'] = row[2] ? String(row[2]).trim() : '';
      mapped['Type of contract'] = row[3] ? String(row[3]).trim() : '';
      mapped['Trades'] = row[4] ? String(row[4]).trim() : '';
      mapped['Items'] = row[5] ? String(row[5]).trim() : '';
      mapped['QTY'] = row[6] ? (isNaN(Number(row[6])) ? 0 : Number(row[6])) : 0;
      mapped['Rate'] = row[7] ? (isNaN(Number(row[7])) ? 0 : Number(row[7])) : 0;
      mapped['wastage'] = row[8] ? (isNaN(Number(row[8])) ? 0 : Number(row[8])) : 0;
      mapped['Responsibilities'] = row[9] ? String(row[9]).trim() : '';
      
      console.log(`Mapped row ${index + 1}:`, mapped);
      return mapped as SubcontractImportData;
    });
};

export const processExcelMergedCells = (data: SubcontractImportData[]): SubcontractImportData[] => {
  console.log('Processing merged cells for data:', data);
  
  const processedData: SubcontractImportData[] = [];
  let lastValidValues = {
    'Date of Issuing': '',
    'Project Name': '',
    'Subcontractor Company': '',
    'Type of contract': ''
  };

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    console.log(`Processing merged cells for row ${i + 1}:`, row);

    // For each row, use the current value if it exists, otherwise use the last valid value
    const processedRow: SubcontractImportData = {
      'Date of Issuing': row['Date of Issuing'] || lastValidValues['Date of Issuing'],
      'Project Name': row['Project Name'] || lastValidValues['Project Name'],
      'Subcontractor Company': row['Subcontractor Company'] || lastValidValues['Subcontractor Company'],
      'Type of contract': row['Type of contract'] || lastValidValues['Type of contract'],
      'Trades': row['Trades'] || '',
      'Items': row['Items'] || '',
      'QTY': row['QTY'] || 0,
      'Rate': row['Rate'] || 0,
      'wastage': row['wastage'] || 0,
      'Responsibilities': row['Responsibilities'] || ''
    };

    // Update last valid values if current row has them
    if (row['Date of Issuing']) lastValidValues['Date of Issuing'] = row['Date of Issuing'];
    if (row['Project Name']) lastValidValues['Project Name'] = row['Project Name'];
    if (row['Subcontractor Company']) lastValidValues['Subcontractor Company'] = row['Subcontractor Company'];
    if (row['Type of contract']) lastValidValues['Type of contract'] = row['Type of contract'];

    // Only add rows that have some meaningful data
    if (processedRow['Trades'] || processedRow['Items'] || processedRow['Project Name']) {
      processedData.push(processedRow);
      console.log(`Added processed row ${i + 1}:`, processedRow);
    } else {
      console.log(`Skipped empty row ${i + 1}`);
    }
  }

  console.log('Final processed data:', processedData);
  return processedData;
};

export const groupByContract = (data: SubcontractImportData[]) => {
  const groups: { [key: string]: SubcontractImportData[] } = {};

  data.forEach((row, index) => {
    console.log(`Grouping row ${index + 1}:`, row);
    const key = `${row['Date of Issuing']}_${row['Project Name']}_${row['Subcontractor Company']}_${row['Type of contract']}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(row);
  });

  console.log('Grouped contracts:', groups);
  return groups;
};
