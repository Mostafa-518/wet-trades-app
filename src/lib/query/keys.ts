// Query key factory for consistent cache management

import { QueryParams } from '@/types/api';
import { EntityId } from '@/types/common';

/**
 * Query key factory provides consistent and hierarchical query keys
 * for better cache invalidation and management
 */
export const queryKeys = {
  // Authentication and user-related queries
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
    permissions: () => [...queryKeys.auth.all, 'permissions'] as const,
  },

  // User management
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (params?: QueryParams) => [...queryKeys.users.lists(), params] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: EntityId) => [...queryKeys.users.details(), id] as const,
    roles: () => [...queryKeys.users.all, 'roles'] as const,
  },

  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (params?: QueryParams) => [...queryKeys.projects.lists(), params] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: EntityId) => [...queryKeys.projects.details(), id] as const,
    statistics: () => [...queryKeys.projects.all, 'statistics'] as const,
    subcontracts: (projectId: EntityId) => [...queryKeys.projects.detail(projectId), 'subcontracts'] as const,
  },

  // Subcontractors
  subcontractors: {
    all: ['subcontractors'] as const,
    lists: () => [...queryKeys.subcontractors.all, 'list'] as const,
    list: (params?: QueryParams) => [...queryKeys.subcontractors.lists(), params] as const,
    details: () => [...queryKeys.subcontractors.all, 'detail'] as const,
    detail: (id: EntityId) => [...queryKeys.subcontractors.details(), id] as const,
    history: (id: EntityId) => [...queryKeys.subcontractors.detail(id), 'history'] as const,
    statistics: (id: EntityId) => [...queryKeys.subcontractors.detail(id), 'statistics'] as const,
  },

  // Subcontracts
  subcontracts: {
    all: ['subcontracts'] as const,
    lists: () => [...queryKeys.subcontracts.all, 'list'] as const,
    list: (params?: QueryParams) => [...queryKeys.subcontracts.lists(), params] as const,
    details: () => [...queryKeys.subcontracts.all, 'detail'] as const,
    detail: (id: EntityId) => [...queryKeys.subcontracts.details(), id] as const,
    responsibilities: (id: EntityId) => [...queryKeys.subcontracts.detail(id), 'responsibilities'] as const,
    tradeItems: (id: EntityId) => [...queryKeys.subcontracts.detail(id), 'trade-items'] as const,
    documents: (id: EntityId) => [...queryKeys.subcontracts.detail(id), 'documents'] as const,
  },

  // Trades
  trades: {
    all: ['trades'] as const,
    lists: () => [...queryKeys.trades.all, 'list'] as const,
    list: (params?: QueryParams) => [...queryKeys.trades.lists(), params] as const,
    details: () => [...queryKeys.trades.all, 'detail'] as const,
    detail: (id: EntityId) => [...queryKeys.trades.details(), id] as const,
    items: (tradeId: EntityId) => [...queryKeys.trades.detail(tradeId), 'items'] as const,
  },

  // Trade Items
  tradeItems: {
    all: ['trade-items'] as const,
    lists: () => [...queryKeys.tradeItems.all, 'list'] as const,
    list: (params?: QueryParams) => [...queryKeys.tradeItems.lists(), params] as const,
    details: () => [...queryKeys.tradeItems.all, 'detail'] as const,
    detail: (id: EntityId) => [...queryKeys.tradeItems.details(), id] as const,
  },

  // Responsibilities
  responsibilities: {
    all: ['responsibilities'] as const,
    lists: () => [...queryKeys.responsibilities.all, 'list'] as const,
    list: (params?: QueryParams) => [...queryKeys.responsibilities.lists(), params] as const,
    details: () => [...queryKeys.responsibilities.all, 'detail'] as const,
    detail: (id: EntityId) => [...queryKeys.responsibilities.details(), id] as const,
  },

  // Alerts
  alerts: {
    all: ['alerts'] as const,
    lists: () => [...queryKeys.alerts.all, 'list'] as const,
    list: (params?: QueryParams) => [...queryKeys.alerts.lists(), params] as const,
    unread: () => [...queryKeys.alerts.all, 'unread'] as const,
    count: () => [...queryKeys.alerts.all, 'count'] as const,
  },

  // Reports
  reports: {
    all: ['reports'] as const,
    subcontracts: (params?: QueryParams) => [...queryKeys.reports.all, 'subcontracts', params] as const,
    projects: (params?: QueryParams) => [...queryKeys.reports.all, 'projects', params] as const,
    financial: (params?: QueryParams) => [...queryKeys.reports.all, 'financial', params] as const,
  },

  // Settings and configuration
  settings: {
    all: ['settings'] as const,
    general: () => [...queryKeys.settings.all, 'general'] as const,
    notifications: () => [...queryKeys.settings.all, 'notifications'] as const,
    permissions: () => [...queryKeys.settings.all, 'permissions'] as const,
  },
} as const;

/**
 * Utility functions for query key management
 */
export const queryKeyUtils = {
  /**
   * Get all keys that match a pattern
   */
  getMatchingKeys: (pattern: readonly unknown[]) => {
    return (queryKey: readonly unknown[]) => {
      return pattern.every((item, index) => queryKey[index] === item);
    };
  },

  /**
   * Invalidate all queries for a specific entity type
   */
  invalidateEntity: (entityType: keyof typeof queryKeys) => {
    return queryKeys[entityType].all;
  },

  /**
   * Invalidate all list queries for an entity
   */
  invalidateEntityLists: (entityType: keyof typeof queryKeys) => {
    const entity = queryKeys[entityType] as any;
    return entity.lists?.() || entity.all;
  },

  /**
   * Invalidate a specific entity detail
   */
  invalidateEntityDetail: (entityType: keyof typeof queryKeys, id: EntityId) => {
    const entity = queryKeys[entityType] as any;
    return entity.detail?.(id) || entity.all;
  },
} as const;

export type QueryKey = typeof queryKeys;