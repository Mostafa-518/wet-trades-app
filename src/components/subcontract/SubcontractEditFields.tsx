
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ParentSubcontractSelector } from './ParentSubcontractSelector';

interface FormData {
  contractId: string;
  project: string;
  subcontractor: string;
  status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled';
  totalValue: number;
  startDate: string;
  endDate: string;
  dateOfIssuing: string;
  description: string;
  contractType: 'subcontract' | 'ADD';
  parentSubcontractId: string;
}

interface SubcontractEditFieldsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  validProjects: any[];
  validSubcontractors: any[];
  subcontracts: any[];
  getProjectName: (id: string) => string;
  getSubcontractorName: (id: string) => string;
}

export function SubcontractEditFields({
  formData,
  setFormData,
  validProjects,
  validSubcontractors,
  subcontracts,
  getProjectName,
  getSubcontractorName
}: SubcontractEditFieldsProps) {
  return (
    <>
      <div>
        <Label htmlFor="contractId">Contract ID</Label>
        <Input
          id="contractId"
          value={formData.contractId}
          onChange={(e) => setFormData(prev => ({ ...prev, contractId: e.target.value }))}
          placeholder="Enter contract ID"
        />
      </div>

      <div>
        <Label htmlFor="contractType">Contract Type</Label>
        <Select
          value={formData.contractType}
          onValueChange={(value: 'subcontract' | 'ADD') => setFormData(prev => ({ ...prev, contractType: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="subcontract">Subcontract</SelectItem>
            <SelectItem value="ADD">Addendum</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.contractType === 'ADD' && (
        <ParentSubcontractSelector
          subcontracts={subcontracts}
          value={formData.parentSubcontractId}
          onChange={(parentId) => setFormData(prev => ({ ...prev, parentSubcontractId: parentId }))}
          getProjectName={getProjectName}
          getSubcontractorName={getSubcontractorName}
        />
      )}

      <div>
        <Label htmlFor="project">Project</Label>
        <Select
          value={formData.project}
          onValueChange={(value) => setFormData(prev => ({ ...prev, project: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {validProjects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.name} - {project.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="subcontractor">Subcontractor</Label>
        <Select
          value={formData.subcontractor}
          onValueChange={(value) => setFormData(prev => ({ ...prev, subcontractor: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select subcontractor" />
          </SelectTrigger>
          <SelectContent>
            {validSubcontractors.map(sub => (
              <SelectItem key={sub.id} value={sub.id}>
                {sub.companyName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled') => setFormData(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="totalValue">Total Value (Calculated without wastage)</Label>
        <Input
          id="totalValue"
          type="number"
          value={formData.totalValue}
          readOnly
          className="bg-gray-50"
          placeholder="Auto-calculated from trade items"
        />
        <p className="text-sm text-muted-foreground mt-1">
          This value is calculated as QTY × Rate for all trade items (excluding wastage)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="dateOfIssuing">Date of Issuing</Label>
        <Input
          id="dateOfIssuing"
          type="date"
          value={formData.dateOfIssuing}
          onChange={(e) => setFormData(prev => ({ ...prev, dateOfIssuing: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter description"
          rows={3}
        />
      </div>
    </>
  );
}
