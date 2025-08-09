
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft } from 'lucide-react';
import { TradeItem, TradeItemFormData } from '@/types/trade';
import { useData } from '@/contexts/DataContext';

interface TradeItemFormProps {
  item?: TradeItem | null;
  tradeId?: string;
  onSubmit: (data: TradeItemFormData) => void;
  onCancel: () => void;
}

export function TradeItemForm({ item, tradeId, onSubmit, onCancel }: TradeItemFormProps) {
  const { trades } = useData();
  
  const form = useForm<TradeItemFormData>({
    defaultValues: {
      trade_id: item?.trade_id || tradeId || '',
      name: item?.name || '',
      unit: item?.unit || '',
      description: item?.description || ''
    }
  });

  const handleSubmit = (data: TradeItemFormData) => {
    onSubmit(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {item ? 'Edit Trade Item' : 'Add New Trade Item'}
          </h1>
          <p className="text-muted-foreground">
            {item ? 'Update trade item information' : 'Create a new trade item'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trade Item Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="trade_id"
                  rules={{ required: 'Trade is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trade *</FormLabel>
                      <FormControl>
                        <select {...field} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="">Select Trade</option>
                          {trades.map(trade => (
                            <option key={trade.id} value={trade.id}>{trade.name}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: 'Item name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter item name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  rules={{ required: 'Unit is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Each, Sqm, Set, Linear Meter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit">
                  {item ? 'Update Item' : 'Create Item'}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
