/**
 * Caching utilities for API responses and data
 * Implements in-memory caching with TTL support
 */

class Cache {
    constructor() {
        this.store = new Map();
    }

    /**
     * Set a value in cache with optional TTL
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
     */
    set(key, value, ttl = 5 * 60 * 1000) {
        const expiresAt = Date.now() + ttl;
        this.store.set(key, {
            value,
            expiresAt,
        });
    }

    /**
     * Get a value from cache
     * @param {string} key - Cache key
     * @returns {any|null} Cached value or null if not found/expired
     */
    get(key) {
        const item = this.store.get(key);

        if (!item) {
            return null;
        }

        // Check if expired
        if (Date.now() > item.expiresAt) {
            this.store.delete(key);
            return null;
        }

        return item.value;
    }

    /**
     * Check if key exists and is not expired
     * @param {string} key - Cache key
     * @returns {boolean}
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Delete a key from cache
     * @param {string} key - Cache key
     */
    delete(key) {
        this.store.delete(key);
    }

    /**
     * Clear all cache
     */
    clear() {
        this.store.clear();
    }

    /**
     * Get cache size
     * @returns {number}
     */
    size() {
        return this.store.size;
    }

    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.store.entries()) {
            if (now > item.expiresAt) {
                this.store.delete(key);
            }
        }
    }
}

// Global cache instance
export const cache = new Cache();

// Run cleanup every 5 minutes
if (typeof window !== 'undefined') {
    setInterval(() => {
        cache.cleanup();
    }, 5 * 60 * 1000);
}

/**
 * Cached fetch wrapper
 * @param {string} url - URL to fetch
 * @param {object} options - Fetch options
 * @param {number} ttl - Cache TTL in milliseconds
 * @returns {Promise<any>}
 */
export async function cachedFetch(url, options = {}, ttl = 5 * 60 * 1000) {
    const cacheKey = `fetch:${url}:${JSON.stringify(options)}`;

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
        return cached;
    }

    // Fetch and cache
    const response = await fetch(url, options);
    const data = await response.json();

    cache.set(cacheKey, data, ttl);

    return data;
}

/**
 * Cache decorator for functions
 * @param {Function} fn - Function to cache
 * @param {number} ttl - Cache TTL in milliseconds
 * @returns {Function}
 */
export function memoize(fn, ttl = 5 * 60 * 1000) {
    return function (...args) {
        const cacheKey = `memoize:${fn.name}:${JSON.stringify(args)}`;

        const cached = cache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const result = fn(...args);

        // Handle promises
        if (result instanceof Promise) {
            return result.then(value => {
                cache.set(cacheKey, value, ttl);
                return value;
            });
        }

        cache.set(cacheKey, result, ttl);
        return result;
    };
}

/**
 * Invalidate cache by pattern
 * @param {string|RegExp} pattern - Pattern to match keys
 */
export function invalidateCache(pattern) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    for (const key of cache.store.keys()) {
        if (regex.test(key)) {
            cache.delete(key);
        }
    }
}

/**
 * Cache statistics
 * @returns {object}
 */
export function getCacheStats() {
    let expired = 0;
    let active = 0;
    const now = Date.now();

    for (const [key, item] of cache.store.entries()) {
        if (now > item.expiresAt) {
            expired++;
        } else {
            active++;
        }
    }

    return {
        total: cache.size(),
        active,
        expired,
    };
}
