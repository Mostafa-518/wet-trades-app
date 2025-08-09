
import { BaseService } from './base/BaseService';
import { Responsibility, ResponsibilityInsert, ResponsibilityUpdate } from './types';

export class ResponsibilityService extends BaseService<Responsibility, ResponsibilityInsert, ResponsibilityUpdate> {
  constructor() {
    super('responsibilities');
  }
}

export const responsibilityService = new ResponsibilityService();
