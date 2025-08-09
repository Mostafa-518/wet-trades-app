
import jsPDF from 'jspdf';
import { Subcontract } from '@/types/subcontract';

interface PDFGeneratorOptions {
  subcontract: Subcontract;
  projectName: string;
  subcontractorName: string;
  subcontractorData?: any;
}

export const generateSubcontractPDF = async ({ 
  subcontract, 
  projectName, 
  subcontractorName, 
  subcontractorData 
}: PDFGeneratorOptions) => {
  const jsPDFModule = await import('jspdf'); // 👈 dynamic import
  const doc = new jsPDFModule.default();     // 👈 use .default
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Helper function to add text
  const addText = (text: string, x: number, y: number, options?: any) => {
    doc.text(text, x, y, options);
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  addText('SUBCONTRACT AGREEMENT', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  addText(`Contract ID: ${subcontract.contractId}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Contract Information
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  addText('CONTRACT INFORMATION', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  addText(`Project: ${projectName}`, 20, yPosition);
  yPosition += 7;
  addText(`Subcontractor: ${subcontractorName}`, 20, yPosition);
  yPosition += 7;
  addText(`Contract Type: ${subcontract.contractType === 'ADD' ? 'Addendum' : 'Subcontract'}`, 20, yPosition);
  yPosition += 7;
  addText(`Status: ${subcontract.status.charAt(0).toUpperCase() + subcontract.status.slice(1)}`, 20, yPosition);
  yPosition += 7;
  addText(`Total Value: ${formatCurrency(subcontract.totalValue)}`, 20, yPosition);
  yPosition += 7;

  if (subcontract.dateOfIssuing) {
    addText(`Date of Issuing: ${new Date(subcontract.dateOfIssuing).toLocaleDateString()}`, 20, yPosition);
    yPosition += 7;
  }

  if (subcontract.startDate) {
    addText(`Start Date: ${new Date(subcontract.startDate).toLocaleDateString()}`, 20, yPosition);
    yPosition += 7;
  }

  if (subcontract.endDate) {
    addText(`End Date: ${new Date(subcontract.endDate).toLocaleDateString()}`, 20, yPosition);
    yPosition += 7;
  }

  yPosition += 10;

  // Subcontractor Details
  if (subcontractorData) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    addText('SUBCONTRACTOR DETAILS', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    addText(`Company: ${subcontractorData.companyName}`, 20, yPosition);
    yPosition += 7;
    if (subcontractorData.representativeName) {
      addText(`Representative: ${subcontractorData.representativeName}`, 20, yPosition);
      yPosition += 7;
    }
    if (subcontractorData.phone) {
      addText(`Phone: ${subcontractorData.phone}`, 20, yPosition);
      yPosition += 7;
    }
    if (subcontractorData.email) {
      addText(`Email: ${subcontractorData.email}`, 20, yPosition);
      yPosition += 7;
    }
    yPosition += 10;
  }

  // Trade Items
  if (subcontract.tradeItems && subcontract.tradeItems.length > 0) {
    // Check if we need a new page
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    addText('TRADE ITEMS', 20, yPosition);
    yPosition += 10;

    // Table headers
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    addText('Trade', 20, yPosition);
    addText('Item', 60, yPosition);
    addText('Qty', 120, yPosition);
    addText('Unit', 140, yPosition);
    addText('Unit Price', 160, yPosition);
    addText('Total', 180, yPosition);
    yPosition += 7;

    // Draw line under headers
    doc.line(20, yPosition - 2, 200, yPosition - 2);
    yPosition += 3;

    doc.setFont(undefined, 'normal');
    subcontract.tradeItems.forEach((item) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      addText(item.trade || '', 20, yPosition);
      addText(item.item || '', 60, yPosition);
      addText(item.quantity?.toString() || '0', 120, yPosition);
      addText(item.unit || '', 140, yPosition);
      addText(formatCurrency(item.unitPrice || 0), 160, yPosition);
      addText(formatCurrency(item.total || 0), 180, yPosition);
      yPosition += 7;
    });

    yPosition += 10;

    // Total
    doc.setFont(undefined, 'bold');
    doc.line(160, yPosition - 5, 200, yPosition - 5);
    addText(`TOTAL: ${formatCurrency(subcontract.totalValue)}`, 160, yPosition);
    yPosition += 15;
  }

  // Responsibilities
  if (subcontract.responsibilities && subcontract.responsibilities.length > 0) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    addText('RESPONSIBILITIES', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    subcontract.responsibilities.forEach((responsibility, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      addText(`${index + 1}. ${responsibility}`, 20, yPosition);
      yPosition += 7;
    });
  }

  // Description
  if (subcontract.description) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    addText('DESCRIPTION', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const splitDescription = doc.splitTextToSize(subcontract.description, 170);
    doc.text(splitDescription, 20, yPosition);
  }

  // Footer - Fixed the method call
  const pageCount = (doc as any).internal.pages.length - 1; // Fixed: use pages.length instead of getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    addText(`Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`, pageWidth / 2, 285, { align: 'center' });
  }

  // Download the PDF
  const fileName = `${subcontract.contractId}_contract.pdf`;
  doc.save(fileName);
};
