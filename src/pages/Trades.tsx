
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TradesTable } from '@/components/TradesTable';
import { TradeForm } from '@/components/TradeForm';
import { TradeItemForm } from '@/components/TradeItemForm';
import { Trade, TradeFormData, TradeItem, TradeItemFormData } from '@/types/trade';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function Trades() {
  const navigate = useNavigate();
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [editingItem, setEditingItem] = useState<TradeItem | null>(null);
  const [selectedTradeId, setSelectedTradeId] = useState<string>('');
  
  const { addTrade, updateTrade, deleteTrade, bulkDeleteTrades, addTradeItem, updateTradeItem, deleteTradeItem, bulkDeleteTradeItems } = useData();
  const { toast } = useToast();
  const { profile } = useAuth();
  const canModify = profile?.role !== 'viewer';

  const handleCreateNewTrade = () => {
    if (!canModify) return;
    setEditingTrade(null);
    setShowTradeForm(true);
  };

  const handleViewDetail = (tradeId: string) => {
    navigate(`/trades/${tradeId}`);
  };

  const handleEditTrade = (trade: Trade) => {
    if (!canModify) return;
    setEditingTrade(trade);
    setShowTradeForm(true);
  };

  const handleDeleteTrade = (tradeId: string) => {
    if (!canModify) return;
    deleteTrade(tradeId);
    toast({
      title: "Trade deleted",
      description: "The trade has been removed successfully."
    });
  };

  const handleBulkDeleteTrades = (tradeIds: string[]) => {
    if (!canModify) return;
    bulkDeleteTrades(tradeIds);
    toast({
      title: "Trades deleted",
      description: `${tradeIds.length} trades have been removed successfully.`
    });
  };

  const handleSaveTrade = (data: TradeFormData) => {
    if (editingTrade) {
      updateTrade(editingTrade.id, data);
      toast({
        title: "Trade updated",
        description: "The trade has been updated successfully."
      });
    } else {
      addTrade(data);
      toast({
        title: "Trade created",
        description: "A new trade has been created successfully."
      });
    }
    setShowTradeForm(false);
    setEditingTrade(null);
  };

  const handleCancelTrade = () => {
    setShowTradeForm(false);
    setEditingTrade(null);
  };

  const handleAddItem = (tradeId: string) => {
    if (!canModify) return;
    setSelectedTradeId(tradeId);
    setEditingItem(null);
    setShowItemForm(true);
  };

  const handleEditItem = (item: TradeItem) => {
    if (!canModify) return;
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!canModify) return;
    deleteTradeItem(itemId);
    toast({
      title: "Trade item deleted",
      description: "The trade item has been removed successfully."
    });
  };

  const handleBulkDeleteItems = (itemIds: string[]) => {
    if (!canModify) return;
    bulkDeleteTradeItems(itemIds);
    toast({
      title: "Trade items deleted",
      description: `${itemIds.length} trade items have been removed successfully.`
    });
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
    setSelectedTradeId('');
  };

  const handleCancelItem = () => {
    setShowItemForm(false);
    setEditingItem(null);
    setSelectedTradeId('');
  };

  if (showTradeForm) {
    return (
      <TradeForm
        trade={editingTrade}
        onSubmit={handleSaveTrade}
        onCancel={handleCancelTrade}
      />
    );
  }

  if (showItemForm) {
    return (
      <TradeItemForm
        item={editingItem}
        tradeId={selectedTradeId}
        onSubmit={handleSaveItem}
        onCancel={handleCancelItem}
      />
    );
  }

  return (
    <TradesTable 
      onCreateNew={canModify ? handleCreateNewTrade : undefined}
      onViewDetail={handleViewDetail}
      onEdit={canModify ? handleEditTrade : undefined}
      onDelete={canModify ? handleDeleteTrade : undefined}
      onBulkDelete={canModify ? handleBulkDeleteTrades : undefined}
      onAddItem={canModify ? handleAddItem : undefined}
      onEditItem={canModify ? handleEditItem : undefined}
      onDeleteItem={canModify ? handleDeleteItem : undefined}
      onBulkDeleteItems={canModify ? handleBulkDeleteItems : undefined}
    />
  );
}
