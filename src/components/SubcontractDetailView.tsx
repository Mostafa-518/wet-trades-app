import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Download, Building2, User, Calendar, FileText, Package, DollarSign } from 'lucide-react';
import { Subcontract } from '@/types/subcontract';
import { SubcontractTradeItemsTable } from '@/components/subcontract/SubcontractTradeItemsTable';
import { SubcontractResponsibilities } from '@/components/subcontract/SubcontractResponsibilities';
import { SubcontractDescription } from '@/components/subcontract/SubcontractDescription';
import { useData } from '@/contexts/DataContext';
import { generateSubcontractPDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

interface SubcontractDetailViewProps {
  subcontract: Subcontract;
  onBack: () => void;
  onEdit: () => void;
}

export function SubcontractDetailView({ subcontract, onBack, onEdit }: SubcontractDetailViewProps) {
  const { projects, subcontractors } = useData();
  const { toast } = useToast();
  
  const projectData = projects.find(p => p.id === subcontract.project);
  const subcontractorData = subcontractors.find(s => s.id === subcontract.subcontractor);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleDownloadPDF = () => {
    try {
      generateSubcontractPDF({
        subcontract,
        projectName: projectData?.name || 'Unknown Project',
        subcontractorName: subcontractorData?.companyName || 'Unknown Subcontractor',
        subcontractorData
      });
      
      toast({
        title: "PDF Generated",
        description: "Contract PDF has been downloaded successfully"
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'active': { color: 'bg-blue-100 text-blue-800', label: 'Active' },
      'completed': { color: 'bg-green-100 text-green-800', label: 'Completed' },
      'cancelled': { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      'overbudget': { color: 'bg-red-100 text-red-800', label: 'Over Budget' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getContractTypeBadge = (contractType: string, addendumNumber?: string) => {
    if (contractType === 'ADD') {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Addendum
          </Badge>
          {addendumNumber && (
            <span className="text-sm text-muted-foreground">#{addendumNumber}</span>
          )}
        </div>
      );
    }
    return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Subcontract</Badge>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="shadow-sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Subcontracts
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{subcontract.contractId}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {getContractTypeBadge(subcontract.contractType, subcontract.addendumNumber)}
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {projectData?.name || 'Unknown Project'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(subcontract.status)}
            <Button variant="outline" onClick={onEdit} className="shadow-sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF} className="shadow-sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-50 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(subcontract.totalValue)}
                </div>
                <div className="text-sm font-medium text-muted-foreground">Contract Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 p-3 rounded-full">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {subcontract.tradeItems.length}
                </div>
                <div className="text-sm font-medium text-muted-foreground">Trade Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {getStatusBadge(subcontract.status)}
                </div>
                <div className="text-sm font-medium text-muted-foreground">Status</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-50 p-3 rounded-full">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {subcontract.responsibilities.length}
                </div>
                <div className="text-sm font-medium text-muted-foreground">Responsibilities</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Trade Items
          </TabsTrigger>
          <TabsTrigger value="responsibilities" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Responsibilities
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contract Information */}
            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Contract Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Contract ID</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{subcontract.contractId}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Contract Type</label>
                  <div className="mt-1">
                    {getContractTypeBadge(subcontract.contractType, subcontract.addendumNumber)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Value</label>
                  <p className="text-lg font-semibold text-green-600 mt-1">{formatCurrency(subcontract.totalValue)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</label>
                  <div className="mt-1">{getStatusBadge(subcontract.status)}</div>
                </div>
                {subcontract.dateOfIssuing && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Date of Issuing</label>
                    <p className="text-lg text-gray-900 mt-1">{new Date(subcontract.dateOfIssuing).toLocaleDateString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project & Subcontractor Information */}
            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Project & Subcontractor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Project</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{projectData?.name || 'Unknown Project'}</p>
                  {projectData && (
                    <p className="text-sm text-muted-foreground">{projectData.code} • {projectData.location}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Subcontractor</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{subcontractorData?.companyName || 'Unknown Subcontractor'}</p>
                  {subcontractorData && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Representative: {subcontractorData.representativeName}</p>
                      <p>Phone: {subcontractorData.phone}</p>
                      <p>Email: {subcontractorData.email}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {subcontract.description && (
            <SubcontractDescription description={subcontract.description} />
          )}
        </TabsContent>

        <TabsContent value="items">
          <SubcontractTradeItemsTable 
            tradeItems={subcontract.tradeItems} 
            totalValue={subcontract.totalValue} 
          />
        </TabsContent>

        <TabsContent value="responsibilities">
          <SubcontractResponsibilities responsibilities={subcontract.responsibilities} />
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="shadow-sm">
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Contract Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {subcontract.startDate && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Start Date</label>
                      <p className="text-lg text-gray-900 mt-1">{new Date(subcontract.startDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {subcontract.endDate && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">End Date</label>
                      <p className="text-lg text-gray-900 mt-1">{new Date(subcontract.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Created</label>
                    <p className="text-lg text-gray-900 mt-1">{new Date(subcontract.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Last Updated</label>
                    <p className="text-lg text-gray-900 mt-1">{new Date(subcontract.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
