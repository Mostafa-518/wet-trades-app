
import React, { useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, Edit, Trash2, FileDown, Package, Filter, X, Calendar, Building } from 'lucide-react';
import { Trade, TradeSearchFilters, TradeItem } from '@/types/trade';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { TableSelectionCheckbox } from '@/components/TableSelectionCheckbox';
import * as XLSX from 'xlsx';

interface TradesTableProps {
  onCreateNew?: () => void;
  onViewDetail: (tradeId: string) => void;
  onEdit?: (trade: Trade) => void;
  onDelete?: (tradeId: string) => void;
  onBulkDelete?: (tradeIds: string[]) => void;
  onAddItem?: (tradeId: string) => void;
  onEditItem?: (item: TradeItem) => void;
  onDeleteItem?: (itemId: string) => void;
  onBulkDeleteItems?: (itemIds: string[]) => void;
}

export function TradesTable({ 
  onCreateNew, 
  onViewDetail, 
  onEdit, 
  onDelete, 
  onBulkDelete,
  onAddItem, 
  onEditItem, 
  onDeleteItem,
  onBulkDeleteItems
}: TradesTableProps) {
  const { trades, tradeItems, addTrade } = useData();
  const { toast } = useToast();
  const [searchFilters, setSearchFilters] = useState<TradeSearchFilters>({
    name: '',
    category: '',
    description: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);
  const [selectedTradeIds, setSelectedTradeIds] = useState<string[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const filteredTrades = trades.filter(trade => {
    return (
      trade.name.toLowerCase().includes(searchFilters.name.toLowerCase()) &&
      trade.category.toLowerCase().includes(searchFilters.category.toLowerCase()) &&
      trade.description.toLowerCase().includes(searchFilters.description.toLowerCase())
    );
  });

  const handleFilterChange = (field: keyof TradeSearchFilters, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setSearchFilters({
      name: '',
      category: '',
      description: ''
    });
    setShowAdvancedSearch(false);
  };

  const hasActiveFilters = searchFilters.name || searchFilters.category || searchFilters.description;

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        
        const [headers, ...rows] = jsonData;
        let successCount = 0;
        let errorCount = 0;

        for (const row of rows) {
          if (row.length >= 3) {
            try {
              await addTrade({
                name: row[0] || '',
                category: row[1] || '',
                description: row[2] || ''
              });
              successCount++;
            } catch (error) {
              errorCount++;
              console.error('Error importing trade:', error);
            }
          }
        }

        toast({
          title: "Import Complete",
          description: `Successfully imported ${successCount} trades. ${errorCount} errors.`,
        });
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Import Error",
        description: "Failed to read the Excel file.",
        variant: "destructive"
      });
    }
  };

  const getTradeItems = (tradeId: string) => {
    return tradeItems.filter(item => item.trade_id === tradeId);
  };

  const toggleTradeExpansion = (tradeId: string) => {
    setExpandedTradeId(expandedTradeId === tradeId ? null : tradeId);
  };

  const handleSelectAllTrades = (checked: boolean) => {
    if (checked) {
      setSelectedTradeIds(filteredTrades.map(trade => trade.id));
    } else {
      setSelectedTradeIds([]);
    }
  };

  const handleSelectTrade = (tradeId: string, checked: boolean) => {
    if (checked) {
      setSelectedTradeIds(prev => [...prev, tradeId]);
    } else {
      setSelectedTradeIds(prev => prev.filter(id => id !== tradeId));
    }
  };

  const handleSelectAllItems = (tradeId: string, checked: boolean) => {
    const items = getTradeItems(tradeId);
    if (checked) {
      const newItemIds = items.map(item => item.id);
      setSelectedItemIds(prev => [...prev, ...newItemIds]);
    } else {
      const itemIdsToRemove = items.map(item => item.id);
      setSelectedItemIds(prev => prev.filter(id => !itemIdsToRemove.includes(id)));
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItemIds(prev => [...prev, itemId]);
    } else {
      setSelectedItemIds(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleBulkDeleteTrades = () => {
    if (selectedTradeIds.length > 0 && onBulkDelete) {
      onBulkDelete(selectedTradeIds);
      setSelectedTradeIds([]);
    }
  };

  const handleBulkDeleteItems = () => {
    if (selectedItemIds.length > 0 && onBulkDeleteItems) {
      onBulkDeleteItems(selectedItemIds);
      setSelectedItemIds([]);
    }
  };

  const allTradesSelected = filteredTrades.length > 0 && selectedTradeIds.length === filteredTrades.length;
  const someTradesSelected = selectedTradeIds.length > 0 && selectedTradeIds.length < filteredTrades.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls"
        className="hidden"
        onChange={handleFileChange}
        data-testid="import-excel-input"
      />
      
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trades & Items</h1>
              <p className="text-gray-600 mt-1">Manage trades and their associated items</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {filteredTrades.length} trades
                </span>
                <span className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {tradeItems.length} items
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {selectedTradeIds.length > 0 && onBulkDelete && (
              <Button variant="destructive" onClick={handleBulkDeleteTrades} className="shadow-sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {selectedTradeIds.length} Trades
              </Button>
            )}
            {selectedItemIds.length > 0 && onBulkDeleteItems && (
              <Button variant="destructive" onClick={handleBulkDeleteItems} className="shadow-sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {selectedItemIds.length} Items
              </Button>
            )}
            <Button variant="outline" onClick={handleImportClick} className="shadow-sm">
              <FileDown className="h-4 w-4 mr-2" />
              Import Excel
            </Button>
            {onCreateNew && (
              <Button onClick={onCreateNew} className="shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add New Trade
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Search Section */}
      <Card className="shadow-sm">
        <CardHeader className="bg-gray-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              Search Trades
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-600 hover:text-red-700">
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className={showAdvancedSearch ? 'bg-blue-50 text-blue-700' : ''}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showAdvancedSearch ? 'Simple Search' : 'Advanced Search'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Trade Name</label>
                <Input
                  placeholder="Search by trade name..."
                  value={searchFilters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  className="bg-white"
                />
              </div>
              {showAdvancedSearch && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                    <Input
                      placeholder="Search by category..."
                      value={searchFilters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                    <Input
                      placeholder="Search by description..."
                      value={searchFilters.description}
                      onChange={(e) => handleFilterChange('description', e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Results Section */}
      <Card className="shadow-sm">
        <CardHeader className="bg-gray-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Trades ({filteredTrades.length})
            </CardTitle>
            {hasActiveFilters && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Filtered Results
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTrades.length > 0 ? (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12">
                      <TableSelectionCheckbox
                        checked={allTradesSelected}
                        onCheckedChange={handleSelectAllTrades}
                        ariaLabel="Select all trades"
                      />
                    </TableHead>
                    <TableHead className="font-semibold">Trade Name</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold text-center">Items</TableHead>
                    <TableHead className="font-semibold">Created Date</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrades.map((trade, index) => {
                    const items = getTradeItems(trade.id);
                    const isExpanded = expandedTradeId === trade.id;
                    const isSelected = selectedTradeIds.includes(trade.id);
                    
                    return (
                      <React.Fragment key={trade.id}>
                        <TableRow className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
                          <TableCell>
                            <TableSelectionCheckbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleSelectTrade(trade.id, checked)}
                              ariaLabel={`Select trade ${trade.name}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">{trade.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {trade.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600 max-w-xs truncate">{trade.description}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleTradeExpansion(trade.id)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              <Package className="h-4 w-4 mr-1" />
                              {items.length}
                            </Button>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(trade.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="sm" onClick={() => onViewDetail(trade.id)} className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {onEdit && (
                                <Button variant="ghost" size="sm" onClick={() => onEdit(trade)} className="h-8 w-8 p-0">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {onAddItem && (
                                <Button variant="ghost" size="sm" onClick={() => onAddItem(trade.id)} className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              )}
                              {onDelete && (
                                <Button variant="ghost" size="sm" onClick={() => onDelete(trade.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-blue-50 p-6">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Package className="h-4 w-4 text-blue-600" />
                                    Trade Items ({items.length})
                                    {items.length > 0 && (
                                      <TableSelectionCheckbox
                                        checked={items.every(item => selectedItemIds.includes(item.id))}
                                        onCheckedChange={(checked) => handleSelectAllItems(trade.id, checked)}
                                        ariaLabel="Select all items in this trade"
                                      />
                                    )}
                                  </h4>
                                  {onAddItem && (
                                    <Button size="sm" onClick={() => onAddItem(trade.id)} className="shadow-sm">
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add Item
                                    </Button>
                                  )}
                                </div>
                                {items.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {items.map((item) => {
                                      const isItemSelected = selectedItemIds.includes(item.id);
                                      return (
                                        <div key={item.id} className="bg-white p-4 rounded-lg border shadow-sm">
                                          <div className="flex justify-between items-start">
                                            <div className="flex items-start gap-2 flex-1">
                                              <TableSelectionCheckbox
                                                checked={isItemSelected}
                                                onCheckedChange={(checked) => handleSelectItem(item.id, checked)}
                                                ariaLabel={`Select item ${item.name}`}
                                              />
                                              <div className="flex-1">
                                                <div className="font-medium text-gray-900">{item.name}</div>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                  <Badge variant="outline" className="text-xs">
                                                    {item.unit}
                                                  </Badge>
                                                </div>
                                                <div className="text-sm text-gray-600 mt-2">{item.description}</div>
                                                <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                                  <Calendar className="h-3 w-3" />
                                                  {new Date(item.created_at).toLocaleDateString()}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex gap-1 ml-3">
                                              {onEditItem && (
                                                <Button variant="ghost" size="sm" onClick={() => onEditItem(item)} className="h-7 w-7 p-0">
                                                  <Edit className="h-3 w-3" />
                                                </Button>
                                              )}
                                              {onDeleteItem && (
                                                <Button variant="ghost" size="sm" onClick={() => onDeleteItem(item.id)} className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-center py-8">
                                    <div className="bg-white rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                                      <Package className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500">No items found for this trade.</p>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Building className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Trades Found</h3>
              <p className="text-gray-500 mb-6">
                {hasActiveFilters ? 'No trades match your search criteria.' : 'Get started by creating your first trade.'}
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              ) : onCreateNew ? (
                <Button onClick={onCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Trade
                </Button>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
