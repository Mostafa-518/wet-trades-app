
import React, { createContext, useContext } from 'react';
import { useTrades } from '@/hooks/useTrades';
import { useTradeItems } from '@/hooks/useTradeItems';
import { Trade, TradeFormData, TradeItem, TradeItemFormData } from '@/types/trade';

interface TradeContextType {
  trades: Trade[];
  addTrade: (data: TradeFormData) => Promise<void>;
  updateTrade: (id: string, data: TradeFormData) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  bulkDeleteTrades: (ids: string[]) => Promise<void>;
  tradeItems: TradeItem[];
  addTradeItem: (data: TradeItemFormData) => Promise<void>;
  updateTradeItem: (id: string, data: TradeItemFormData) => Promise<void>;
  deleteTradeItem: (id: string) => Promise<void>;
  bulkDeleteTradeItems: (ids: string[]) => Promise<void>;
  isLoading: boolean;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export function TradeProvider({ children }: { children: React.ReactNode }) {
  const {
    trades,
    addTrade,
    updateTrade,
    deleteTrade,
    bulkDeleteTrades,
    isLoading: tradesLoading
  } = useTrades();

  const {
    tradeItems,
    addTradeItem,
    updateTradeItem,
    deleteTradeItem,
    bulkDeleteTradeItems,
    isLoading: tradeItemsLoading
  } = useTradeItems();

  const isLoading = tradesLoading || tradeItemsLoading;

  const value: TradeContextType = {
    trades: trades || [],
    addTrade,
    updateTrade,
    deleteTrade,
    bulkDeleteTrades,
    tradeItems: tradeItems || [],
    addTradeItem,
    updateTradeItem,
    deleteTradeItem,
    bulkDeleteTradeItems,
    isLoading
  };

  return (
    <TradeContext.Provider value={value}>
      {children}
    </TradeContext.Provider>
  );
}

export function useTradeContext() {
  const context = useContext(TradeContext);
  if (context === undefined) {
    throw new Error('useTradeContext must be used within a TradeProvider');
  }
  return context;
}
