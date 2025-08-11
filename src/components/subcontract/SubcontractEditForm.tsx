
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Subcontract } from '@/types/subcontract';
import { useData } from '@/contexts/DataContext';
import { useSubcontractHelpers } from '@/hooks/subcontract/useSubcontractHelpers';
import { SubcontractEditFields } from './SubcontractEditFields';
import { TradeItemForm } from './TradeItemForm';
import { ResponsibilitiesStep } from './ResponsibilitiesStep';

interface SubcontractEditFormProps {
  subcontract: Subcontract;
  onSave: (id: string, data: Partial<Subcontract>) => Promise<void>;
  onClose: () => void;
}

export function SubcontractEditForm({ subcontract, onSave, onClose }: SubcontractEditFormProps) {
  const { projects, subcontractors, subcontracts, trades, tradeItems, responsibilities } = useData();
  const { getProjectName, getSubcontractorName } = useSubcontractHelpers();
  
  const [formData, setFormData] = useState({
    contractId: '',
    project: '',
    subcontractor: '',
    status: 'draft' as 'draft' | 'pending' | 'active' | 'completed' | 'cancelled',
    totalValue: 0,
    startDate: '',
    endDate: '',
    dateOfIssuing: '',
    description: '',
    pdfUrl: '',
    contractType: 'subcontract' as 'subcontract' | 'ADD',
    parentSubcontractId: ''
  });

  const [selectedTradeItems, setSelectedTradeItems] = useState<any[]>([]);
  const [selectedResponsibilities, setSelectedResponsibilities] = useState<string[]>([]);

  // Filter out projects and subcontractors with empty or invalid IDs
  const validProjects = (projects || []).filter(project => project.id && project.name && project.id.trim() !== '' && project.name.trim() !== '');
  const validSubcontractors = (subcontractors || []).filter(sub => sub.id && sub.companyName && sub.id.trim() !== '' && sub.companyName.trim() !== '');

  useEffect(() => {
    // Setting up form data for subcontract
    if (subcontract) {
      // Calculate total value without wastage
      const calculatedTotal = (subcontract.tradeItems || []).reduce((total, item) => {
        return total + ((item.quantity || 0) * (item.unitPrice || 0));
      }, 0);

      // Calculated total

      setFormData({
        contractId: subcontract.contractId || '',
        project: subcontract.project || '',
        subcontractor: subcontract.subcontractor || '',
        status: subcontract.status || 'draft',
        totalValue: calculatedTotal,
        startDate: subcontract.startDate || '',
        endDate: subcontract.endDate || '',
        dateOfIssuing: subcontract.dateOfIssuing || '',
        description: subcontract.description || '',
        pdfUrl: subcontract.pdfUrl || '',
        contractType: subcontract.contractType || 'subcontract',
        parentSubcontractId: subcontract.parentSubcontractId || ''
      });

      // Set selected trade items and responsibilities with safety checks
      setSelectedTradeItems(subcontract.tradeItems || []);
      setSelectedResponsibilities(subcontract.responsibilities || []);
    }
  }, [subcontract]);

  // Recalculate total when trade items change
  useEffect(() => {
    const calculatedTotal = (selectedTradeItems || []).reduce((total, item) => {
      return total + ((item.quantity || 0) * (item.unitPrice || 0));
    }, 0);
    // Trade items changed, new total calculated
    setFormData(prev => ({ ...prev, totalValue: calculatedTotal }));
  }, [selectedTradeItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form submitted with data
    
    try {
      const updateData = {
        ...formData,
        tradeItems: selectedTradeItems || [],
        responsibilities: selectedResponsibilities || []
      };
      await onSave(subcontract.id, updateData);
      onClose();
    } catch (error) {
      // Error saving subcontract
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="trades">Trade Items ({(selectedTradeItems || []).length})</TabsTrigger>
          <TabsTrigger value="responsibilities">Responsibilities ({(selectedResponsibilities || []).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <SubcontractEditFields
                formData={formData}
                setFormData={setFormData}
                validProjects={validProjects}
                validSubcontractors={validSubcontractors}
                subcontracts={subcontracts || []}
                getProjectName={getProjectName}
                getSubcontractorName={getSubcontractorName}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          <TradeItemForm
            selectedItems={selectedTradeItems || []}
            onItemsChange={(items) => {
              // Trade items changed
              setSelectedTradeItems(items);
            }}
            trades={trades || []}
            tradeItems={tradeItems || []}
          />
        </TabsContent>

        <TabsContent value="responsibilities" className="space-y-4">
          <ResponsibilitiesStep
            selectedResponsibilities={selectedResponsibilities || []}
            onResponsibilitiesChange={(responsibilities) => {
              // Responsibilities changed
              setSelectedResponsibilities(responsibilities);
            }}
            responsibilities={responsibilities || []}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
}
