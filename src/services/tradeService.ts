
import { BaseService } from './base/BaseService';
import { Trade, TradeInsert, TradeUpdate } from './types';

export class TradeService extends BaseService<Trade, TradeInsert, TradeUpdate> {
  constructor() {
    super('trades');
  }
}

export const tradeService = new TradeService();
