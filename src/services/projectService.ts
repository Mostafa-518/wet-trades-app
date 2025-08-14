
import { BaseService } from './base/BaseService';
import { Project, ProjectInsert, ProjectUpdate } from './types';

export class ProjectService extends BaseService<Project, ProjectInsert, ProjectUpdate> {
  constructor() {
    super('projects');
  }
}

export const projectService = new ProjectService();
