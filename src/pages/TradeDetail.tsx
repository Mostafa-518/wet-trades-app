
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TradeDetailView } from '@/components/TradeDetailView';
import { TradeForm } from '@/components/TradeForm';
import { TradeItemForm } from '@/components/TradeItemForm';
import { TradeFormData, TradeItem, TradeItemFormData } from '@/types/trade';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

export function TradeDetail() {
  const { tradeId } = useParams<{ tradeId: string }>();
  const navigate = useNavigate();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<TradeItem | null>(null);
  
  const { trades, updateTrade, addTradeItem, updateTradeItem } = useData();
  const { toast } = useToast();

  const handleBack = () => {
    navigate('/trades');
  };

  const handleEdit = (trade: any) => {
    setShowEditForm(true);
  };

  const handleSaveEdit = (data: TradeFormData) => {
    if (tradeId) {
      updateTrade(tradeId, data);
      toast({
        title: "Trade updated",
        description: "The trade has been updated successfully."
      });
    }
    setShowEditForm(false);
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
  };

  const handleAddItem = (tradeId: string) => {
    setEditingItem(null);
    setShowItemForm(true);
  };

  const handleEditItem = (item: TradeItem) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleSaveItem = (data: TradeItemFormData) => {
    if (editingItem) {
      updateTradeItem(editingItem.id, data);
      toast({
        title: "Trade item updated",
        description: "The trade item has been updated successfully."
      });
    } else {
      addTradeItem(data);
      toast({
        title: "Trade item created",
        description: "A new trade item has been created successfully."
      });
    }
    setShowItemForm(false);
    setEditingItem(null);
  };

  const handleCancelItem = () => {
    setShowItemForm(false);
    setEditingItem(null);
  };

  if (!tradeId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Trade Not Found</h2>
        <p className="text-muted-foreground">The requested trade could not be found.</p>
      </div>
    );
  }

  const trade = trades.find(t => t.id === tradeId);

  if (showEditForm && trade) {
    return (
      <TradeForm
        trade={trade}
        onSubmit={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    );
  }

  if (showItemForm) {
    return (
      <TradeItemForm
        item={editingItem}
        tradeId={tradeId}
        onSubmit={handleSaveItem}
        onCancel={handleCancelItem}
      />
    );
  }

  return (
    <TradeDetailView
      tradeId={tradeId}
      onBack={handleBack}
      onEdit={handleEdit}
      onAddItem={handleAddItem}
      onEditItem={handleEditItem}
    />
  );
}
