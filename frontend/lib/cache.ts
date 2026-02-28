/**
 * Simple caching system for API responses
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class Cache {
  private store: Map<string, CacheEntry<any>> = new Map()

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    
    if (!entry) {
      return null
    }

    // Check if cache has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.store.delete(key)
      return null
    }

    return entry.data as T
  }

  clear(key?: string): void {
    if (key) {
      this.store.delete(key)
    } else {
      this.store.clear()
    }
  }

  has(key: string): boolean {
    const entry = this.store.get(key)
    if (!entry) return false
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.store.delete(key)
      return false
    }
    
    return true
  }
}

export const apiCache = new Cache()

// Cache keys
export const CACHE_KEYS = {
  CARS: 'cars',
  CARS_FILTERED: (category?: string, priceRange?: string, search?: string) => 
    `cars_${category || 'all'}_${priceRange || 'all'}_${search || 'all'}`,
  BOOKINGS: 'bookings',
  BOOKING_STATS: 'booking_stats',
  DASHBOARD: 'dashboard',
  SETTINGS: 'settings',
  PAYMENT_CARD: 'payment_card',
}

// Cache durations (in seconds)
export const CACHE_DURATION = {
  CARS: 600, // 10 minutes
  BOOKINGS: 300, // 5 minutes
  BOOKING_STATS: 300, // 5 minutes
  DASHBOARD: 300, // 5 minutes
  SETTINGS: 3600, // 1 hour
  PAYMENT_CARD: 3600, // 1 hour
}
