
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { TradeItem } from '@/types/subcontract';
import { Trade } from '@/types/trade';
import { TradeItem as TradeItemType } from '@/types/trade';

interface TradeItemFormProps {
  selectedItems: TradeItem[];
  onItemsChange: (items: TradeItem[]) => void;
  trades: Trade[];
  tradeItems: TradeItemType[];
}

export function TradeItemForm({ selectedItems, onItemsChange, trades, tradeItems }: TradeItemFormProps) {
  const [formData, setFormData] = useState({
    trade: '',
    item: '',
    quantity: '',
    unitPrice: '',
    wastagePercentage: '0'
  });

  const getTradeItems = (tradeId: string) => {
    return tradeItems?.filter(item => item.trade_id === tradeId) || [];
  };

  const getSelectedTradeItem = () => {
    if (!formData.trade || !formData.item) return null;
    return tradeItems?.find(item => item.trade_id === formData.trade && item.name === formData.item) || null;
  };

  const handleAddItem = () => {
    const selectedTradeItem = getSelectedTradeItem();
    const selectedTrade = trades?.find(t => t.id === formData.trade);
    
    const quantity = parseFloat(formData.quantity);
    const unitPrice = parseFloat(formData.unitPrice);
    const wastagePercentage = parseFloat(formData.wastagePercentage) || 0;
    
    if (!selectedTradeItem || !selectedTrade || quantity <= 0 || unitPrice <= 0) {
      return;
    }

    const total = quantity * unitPrice; // Total without wastage

    const newItem: TradeItem = {
      id: `temp-${Date.now()}`,
      trade: selectedTrade.name,
      item: selectedTradeItem.name,
      unit: selectedTradeItem.unit || '',
      quantity: quantity,
      unitPrice: unitPrice,
      total: total,
      wastagePercentage: wastagePercentage
    };

    onItemsChange([...(selectedItems || []), newItem]);
    
    // Reset form
    setFormData({
      trade: '',
      item: '',
      quantity: '',
      unitPrice: '',
      wastagePercentage: '0'
    });
  };

  const handleRemoveItem = (id: string) => {
    onItemsChange((selectedItems || []).filter(item => item.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Trade Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Trade</Label>
              <Select 
                value={formData.trade} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, trade: value, item: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trade" />
                </SelectTrigger>
                <SelectContent>
                  {(trades || []).map(trade => (
                    <SelectItem key={trade.id} value={trade.id}>
                      {trade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Item</Label>
              <Select 
                value={formData.item} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, item: value }))}
                disabled={!formData.trade}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {getTradeItems(formData.trade).map(item => (
                    <SelectItem key={item.id} value={item.name}>
                      {item.name} ({item.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <Label>Unit Price (EGP)</Label>
              <Input
                type="number"
                value={formData.unitPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                placeholder="Enter unit price"
              />
            </div>

            <div>
              <Label>Wastage %</Label>
              <Input
                type="number"
                value={formData.wastagePercentage}
                onChange={(e) => setFormData(prev => ({ ...prev, wastagePercentage: e.target.value }))}
                placeholder="Enter wastage percentage"
                min="0"
              />
            </div>
          </div>

          <Button 
            onClick={handleAddItem} 
            className="w-full"
            disabled={!formData.trade || !formData.item || !formData.quantity || !formData.unitPrice}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardContent>
      </Card>

      {/* Selected Items List */}
      {(selectedItems || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Items ({(selectedItems || []).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(selectedItems || []).map((item) => {
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.trade} - {item.item}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)}
                        {(item.wastagePercentage || 0) > 0 && (
                          <span className="ml-2 text-orange-600">
                            (Wastage: {item.wastagePercentage}%)
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        Total: {formatCurrency(item.total)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-lg font-bold text-green-800">
                Contract Total: {formatCurrency((selectedItems || []).reduce((sum, item) => sum + item.total, 0))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
