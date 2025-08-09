// API response caching with TTL and invalidation strategies

import { CacheConfig } from '@/types/api';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  etag?: string;
  lastModified?: string;
}

/**
 * In-memory cache for API responses
 */
class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 100; // Maximum number of cache entries

  /**
   * Generate cache key from URL and params
   */
  private generateKey(url: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${url}:${paramString}`;
  }

  /**
   * Check if cache entry is valid
   */
  private isValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Ensure cache doesn't exceed max size
   */
  private evictIfNeeded(): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entries (simple LRU)
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove 20% of oldest entries
      const toRemove = Math.floor(this.maxSize * 0.2);
      for (let i = 0; i < toRemove && i < entries.length; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  /**
   * Get cached data
   */
  get<T>(url: string, params?: Record<string, any>): T | null {
    this.cleanup();
    
    const key = this.generateKey(url, params);
    const entry = this.cache.get(key);
    
    if (!entry || !this.isValid(entry)) {
      return null;
    }
    
    return entry.data;
  }

  /**
   * Set cached data
   */
  set<T>(
    url: string, 
    data: T, 
    config: CacheConfig,
    params?: Record<string, any>,
    headers?: Record<string, string>
  ): void {
    if (!config.enabled) return;
    
    this.evictIfNeeded();
    
    const key = this.generateKey(url, params);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: config.ttl,
      etag: headers?.etag,
      lastModified: headers?.['last-modified'],
    };
    
    this.cache.set(key, entry);
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidate(pattern: string | RegExp): void {
    for (const key of this.cache.keys()) {
      if (typeof pattern === 'string') {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      } else {
        if (pattern.test(key)) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * Clear specific cache entry
   */
  clear(url: string, params?: Record<string, any>): void {
    const key = this.generateKey(url, params);
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    this.cleanup();
    
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    
    return {
      totalEntries: entries.length,
      validEntries: entries.filter(e => this.isValid(e)).length,
      expiredEntries: entries.filter(e => !this.isValid(e)).length,
      totalSize: JSON.stringify(Array.from(this.cache.entries())).length,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : null,
    };
  }

  /**
   * Check if entry exists and is valid
   */
  has(url: string, params?: Record<string, any>): boolean {
    const key = this.generateKey(url, params);
    const entry = this.cache.get(key);
    return entry !== undefined && this.isValid(entry);
  }

  /**
   * Get cache entry metadata
   */
  getMetadata(url: string, params?: Record<string, any>) {
    const key = this.generateKey(url, params);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    return {
      timestamp: entry.timestamp,
      ttl: entry.ttl,
      isValid: this.isValid(entry),
      age: Date.now() - entry.timestamp,
      etag: entry.etag,
      lastModified: entry.lastModified,
    };
  }
}

/**
 * Global cache instance
 */
export const apiCache = new ApiCache();

/**
 * Cache configuration presets
 */
export const cachePresets = {
  // Short cache for frequently changing data
  short: {
    enabled: true,
    ttl: 30 * 1000, // 30 seconds
    staleWhileRevalidate: true,
    maxAge: 60 * 1000, // 1 minute
  },
  
  // Medium cache for moderately changing data
  medium: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    staleWhileRevalidate: true,
    maxAge: 15 * 60 * 1000, // 15 minutes
  },
  
  // Long cache for rarely changing data
  long: {
    enabled: true,
    ttl: 30 * 60 * 1000, // 30 minutes
    staleWhileRevalidate: true,
    maxAge: 60 * 60 * 1000, // 1 hour
  },
  
  // No cache
  none: {
    enabled: false,
    ttl: 0,
    staleWhileRevalidate: false,
    maxAge: 0,
  },
} satisfies Record<string, CacheConfig>;

/**
 * Cache invalidation helpers
 */
export const cacheInvalidation = {
  // Invalidate all user-related cache
  invalidateUser: () => {
    apiCache.invalidate('/users');
    apiCache.invalidate('/profile');
    apiCache.invalidate('/auth');
  },
  
  // Invalidate project-related cache
  invalidateProjects: () => {
    apiCache.invalidate('/projects');
  },
  
  // Invalidate subcontractor-related cache
  invalidateSubcontractors: () => {
    apiCache.invalidate('/subcontractors');
  },
  
  // Invalidate subcontract-related cache
  invalidateSubcontracts: () => {
    apiCache.invalidate('/subcontracts');
  },
  
  // Invalidate all caches
  invalidateAll: () => {
    apiCache.clearAll();
  },
};

export default apiCache;