
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Wrench, Package, Plus, Calendar, Tag, FileText, Trash2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

interface TradeDetailViewProps {
  tradeId: string;
  onBack: () => void;
  onEdit: (trade: any) => void;
  onAddItem: (tradeId: string) => void;
  onEditItem: (item: any) => void;
}

export function TradeDetailView({ tradeId, onBack, onEdit, onAddItem, onEditItem }: TradeDetailViewProps) {
  const { trades, tradeItems, deleteTradeItem, subcontracts, projects, subcontractors } = useData();
  
  const trade = (trades || []).find(t => t.id === tradeId);
  const items = (tradeItems || []).filter(item => item.trade_id === tradeId);

  // Find subcontracts that use this trade
  const relatedSubcontracts = (subcontracts || []).filter(subcontract => 
    (subcontract.tradeItems || []).some(item => item.trade === trade?.name)
  );

  // Get unique projects from related subcontracts
  const relatedProjects = (projects || []).filter(project =>
    relatedSubcontracts.some(subcontract => subcontract.project === project.id)
  );

  // Get unique subcontractors from related subcontracts
  const relatedSubcontractors = (subcontractors || []).filter(subcontractor =>
    relatedSubcontracts.some(subcontract => subcontract.subcontractor === subcontractor.id)
  );

  const handleDeleteItem = (itemId: string) => {
    if (deleteTradeItem) {
      deleteTradeItem(itemId);
    }
  };

  const getProjectName = (projectId: string) => {
    const project = (projects || []).find(p => p.id === projectId);
    return project ? project.name : projectId;
  };

  const getSubcontractorName = (subcontractorId: string) => {
    const subcontractor = (subcontractors || []).find(s => s.id === subcontractorId);
    return subcontractor ? subcontractor.companyName : subcontractorId;
  };

  if (!trade) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Package className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold text-muted-foreground">Trade Not Found</h2>
          <p className="text-muted-foreground">The requested trade could not be found.</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trades
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="shadow-sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trades
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{trade.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Tag className="h-3 w-3 mr-1" />
                    {trade.category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created {new Date(trade.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Button onClick={() => onEdit(trade)} className="shadow-sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Trade
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{items.length}</div>
                <div className="text-sm font-medium text-muted-foreground">Total Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-50 p-3 rounded-full">
                <Tag className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{trade.category}</div>
                <div className="text-sm font-medium text-muted-foreground">Category</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 p-3 rounded-full">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{relatedSubcontracts.length}</div>
                <div className="text-sm font-medium text-muted-foreground">Used in Subcontracts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-50 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {new Date(trade.created_at).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
                </div>
                <div className="text-sm font-medium text-muted-foreground">Created</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-100">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Trade Info
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Items ({items.length})
          </TabsTrigger>
          <TabsTrigger value="subcontracts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Subcontracts ({relatedSubcontracts.length})
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Projects ({relatedProjects.length})
          </TabsTrigger>
          <TabsTrigger value="subcontractors" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Subcontractors ({relatedSubcontractors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="shadow-sm">
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench className="h-5 w-5 text-blue-600" />
                Trade Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Trade Name</label>
                    <p className="text-xl font-semibold text-gray-900 mt-1">{trade.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Category</label>
                    <div className="mt-1">
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {trade.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Description</label>
                    <p className="text-lg text-gray-900 mt-1">{trade.description || 'No description provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Created Date</label>
                    <p className="text-lg text-gray-900 mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {new Date(trade.created_at).toLocaleDateString('en', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card className="shadow-sm">
            <CardHeader className="bg-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                  Trade Items
                </CardTitle>
                <Button onClick={() => onAddItem(tradeId)} className="shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {items.length > 0 ? (
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Item Name</TableHead>
                        <TableHead className="font-semibold">Unit</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                        <TableHead className="font-semibold">Created Date</TableHead>
                        <TableHead className="text-right font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <TableCell className="font-medium text-gray-900">{item.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {item.unit}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600 max-w-xs truncate">
                            {item.description || 'No description'}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {new Date(item.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="sm" onClick={() => onEditItem(item)} className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Package className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items Found</h3>
                  <p className="text-gray-500 mb-6">This trade doesn't have any items yet.</p>
                  <Button onClick={() => onAddItem(tradeId)} className="shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Item
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subcontracts">
          <Card className="shadow-sm">
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-blue-600" />
                Related Subcontracts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relatedSubcontracts.length > 0 ? (
                <div className="space-y-4">
                  {relatedSubcontracts.map(subcontract => (
                    <div key={subcontract.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div>
                            <h3 className="font-semibold text-lg text-blue-600">{subcontract.contractId}</h3>
                            <p className="text-sm text-muted-foreground">Project: {getProjectName(subcontract.project)}</p>
                            <p className="text-sm text-muted-foreground">Subcontractor: {getSubcontractorName(subcontract.subcontractor)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Total Value:</span> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(subcontract.totalValue)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Created:</span> {new Date(subcontract.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={subcontract.status === 'active' ? 'default' : 'secondary'}>
                          {subcontract.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">This trade is not used in any subcontracts yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card className="shadow-sm">
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tag className="h-5 w-5 text-blue-600" />
                Related Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relatedProjects.length > 0 ? (
                <div className="space-y-4">
                  {relatedProjects.map(project => (
                    <div key={project.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg text-blue-600">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">Code: {project.code}</p>
                        <p className="text-sm text-muted-foreground">Location: {project.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">This trade is not used in any projects yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subcontractors">
          <Card className="shadow-sm">
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tag className="h-5 w-5 text-blue-600" />
                Related Subcontractors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relatedSubcontractors.length > 0 ? (
                <div className="space-y-4">
                  {relatedSubcontractors.map(subcontractor => (
                    <div key={subcontractor.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg text-blue-600">{subcontractor.companyName}</h3>
                        <p className="text-sm text-muted-foreground">Representative: {subcontractor.representativeName}</p>
                        <p className="text-sm text-muted-foreground">Phone: {subcontractor.phone}</p>
                        <p className="text-sm text-muted-foreground">Email: {subcontractor.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">This trade is not associated with any subcontractors yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
