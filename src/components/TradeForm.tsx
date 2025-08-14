
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft } from 'lucide-react';
import { Trade, TradeFormData } from '@/types/trade';

interface TradeFormProps {
  trade?: Trade | null;
  onSubmit: (data: TradeFormData) => void;
  onCancel: () => void;
}

export function TradeForm({ trade, onSubmit, onCancel }: TradeFormProps) {
  const form = useForm<TradeFormData>({
    defaultValues: {
      name: trade?.name || '',
      category: trade?.category || '',
      description: trade?.description || ''
    }
  });

  const handleSubmit = (data: TradeFormData) => {
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
            {trade ? 'Edit Trade' : 'Add New Trade'}
          </h1>
          <p className="text-muted-foreground">
            {trade ? 'Update trade information' : 'Create a new trade'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trade Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: 'Trade name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trade Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter trade name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter category" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              <div className="flex gap-4">
                <Button type="submit">
                  {trade ? 'Update Trade' : 'Create Trade'}
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
