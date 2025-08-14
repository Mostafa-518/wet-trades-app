
import { BaseService } from './base/BaseService';
import { Subcontractor, SubcontractorInsert, SubcontractorUpdate } from './types';

export class SubcontractorService extends BaseService<Subcontractor, SubcontractorInsert, SubcontractorUpdate> {
  constructor() {
    super('subcontractors');
  }
}

export const subcontractorService = new SubcontractorService();
