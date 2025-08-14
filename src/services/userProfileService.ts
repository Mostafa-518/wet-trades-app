
import { BaseService } from './base/BaseService';
import { UserProfile, UserProfileInsert, UserProfileUpdate } from './types';

export class UserProfileService extends BaseService<UserProfile, UserProfileInsert, UserProfileUpdate> {
  constructor() {
    super('user_profiles');
  }
}

export const userProfileService = new UserProfileService();
