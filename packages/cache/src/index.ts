interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
}

class CacheService {
  private cache: CacheProvider;

  constructor(provider: CacheProvider) {
    this.cache = provider;
  }

  async withCache<T>(key: string, cachedFn: () => Promise<T>): Promise<T> {
    const hit = await this.cache.get<T>(key);

    if (hit) {
      return hit;
    }

    const data = await cachedFn();
    await this.cache.set(key, data);
    return data;
  }

  async invalidate(keys: string[]) {
    const operations = keys.map((key) => {
      return this.cache.del(key);
    });

    await Promise.all(operations);
  }
}

class InMemoryCache implements CacheProvider {
  private store = new Map<string, { value: any; exp?: number }>();

  async get<T>(key: string): Promise<T | null> {
    const data = this.store.get(key);

    if (!data) {
      return null;
    }

    if (data.exp && data.exp > Date.now()) {
      this.store.delete(key);
      return null;
    }

    return data.value;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    this.store.set(key, { value, exp: ttl ? Date.now() + ttl : undefined });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

export { CacheProvider, CacheService, InMemoryCache };
