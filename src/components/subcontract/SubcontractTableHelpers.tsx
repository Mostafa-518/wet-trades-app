
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0
  }).format(amount ?? 0);
};

// Calculate total without wastage: QTY * Rate only
export const calculateTotalWithoutWastage = (quantity: number, unitPrice: number) => {
  return (quantity || 0) * (unitPrice || 0);
};

// Ensure responsibilities come as a comma separated string, safe against object/array forms
export const formatResponsibilities = (responsibilities: any) => {
  if (Array.isArray(responsibilities) && responsibilities.length > 0) {
    // If values are objects with name, extract; else print as string
    return responsibilities.map(r => {
      if (typeof r === 'string') return r;
      if (r && typeof r === 'object' && 'name' in r) return r.name;
      return '';
    }).filter(Boolean).join(', ');
  }
  return '-';
};

// Format date from string YYYY-MM-DD to "Month, YYYY"
export const formatDate = (isoDate: string | undefined) => {
  if (!isoDate) return '-';
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return isoDate;
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${month}, ${year}`;
  } catch {
    return isoDate;
  }
};
