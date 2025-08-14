
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Search, Filter, Eye } from 'lucide-react';
import { Subcontract } from '@/types/subcontract';
import { useData } from '@/contexts/DataContext';

interface SubcontractorSubcontractsHistoryProps {
  subcontractorProjects: Subcontract[];
}

export function SubcontractorSubcontractsHistory({ subcontractorProjects }: SubcontractorSubcontractsHistoryProps) {
  const navigate = useNavigate();
  const { projects } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [contractTypeFilter, setContractTypeFilter] = useState('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getContractTypeBadge = (type: string) => {
    switch (type) {
      case 'ADD':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Addendum</Badge>;
      default:
        return <Badge variant="outline">Subcontract</Badge>;
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : projectId;
  };

  const handleSubcontractClick = (subcontractId: string) => {
    navigate(`/subcontracts/${subcontractId}`);
  };

  // Filter subcontracts based on search and filters
  const filteredSubcontracts = (subcontractorProjects || []).filter(subcontract => {
    const matchesSearch = 
      subcontract.contractId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getProjectName(subcontract.project).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subcontract.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || subcontract.status === statusFilter;
    const matchesType = contractTypeFilter === 'all' || subcontract.contractType === contractTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalValue = filteredSubcontracts.reduce((sum, subcontract) => sum + (subcontract.totalValue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Subcontracts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search by contract ID, project, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={contractTypeFilter} onValueChange={setContractTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="subcontract">Subcontract</SelectItem>
                <SelectItem value="ADD">Addendum</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredSubcontracts.length}</div>
              <div className="text-sm text-muted-foreground">Total Subcontracts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {filteredSubcontracts.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Subcontracts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subcontracts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Subcontracts History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSubcontracts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract ID</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubcontracts.map((subcontract, index) => (
                    <TableRow 
                      key={subcontract.id} 
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 cursor-pointer transition-colors`}
                      onClick={() => handleSubcontractClick(subcontract.id)}
                    >
                      <TableCell className="font-medium text-blue-600">
                        {subcontract.contractId}
                      </TableCell>
                      <TableCell>{getProjectName(subcontract.project)}</TableCell>
                      <TableCell>{getContractTypeBadge(subcontract.contractType || 'subcontract')}</TableCell>
                      <TableCell>{getStatusBadge(subcontract.status)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(subcontract.totalValue || 0)}
                      </TableCell>
                      <TableCell>
                        {subcontract.startDate ? new Date(subcontract.startDate).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        {subcontract.endDate ? new Date(subcontract.endDate).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubcontractClick(subcontract.id);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Subcontracts Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || contractTypeFilter !== 'all'
                  ? 'No subcontracts match the current filters.'
                  : 'No subcontracts found for this subcontractor.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
