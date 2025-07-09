interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(
    key: string,
    value: T,
    options?: { ttl?: number; tags?: string[] }
  ): Promise<void>;
  del(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
  getKeysByTag(tags: string[]): Promise<string[]>;
}

class CacheService {
  private cache: CacheProvider;
  private pending = new Map<string, Promise<any>>();

  constructor(provider: CacheProvider) {
    this.cache = provider;
  }

  async withCache<T>(
    key: string,
    cachedFn: () => Promise<T>,
    options: {
      ttl?: number;
      forceRefresh?: boolean;
      tags?: string[];
    } = {}
  ): Promise<T> {
    if (this.pending.has(key)) {
      return this.pending.get(key) as Promise<T>;
    }

    const { ttl, forceRefresh = false, tags } = options;

    if (!forceRefresh) {
      const hit = await this.cache.get<T>(key);
      if (hit !== null) return hit;
    }

    try {
      const promise = cachedFn();
      this.pending.set(key, promise);
      const data = await promise;

      await this.cache.set(key, data, { ttl, tags });
      return data;
    } finally {
      this.pending.delete(key);
    }
  }

  async invalidate(keys: string[]): Promise<void> {
    await Promise.allSettled(keys.map((key) => this.cache.del(key)));
  }

  async invalidateTags(tags: string[]): Promise<void> {
    const keys = await this.cache.getKeysByTag(tags);
    await Promise.allSettled(keys.map((key) => this.cache.del(key)));
  }
}

class InMemoryCache implements CacheProvider {
  private store = new Map<
    string,
    {
      value: any;
      exp?: number;
      tags?: string[];
    }
  >();

  private tagIndex = new Map<string, Set<string>>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.exp && entry.exp < Date.now()) {
      this.deleteKey(key);
      return null;
    }

    return entry.value as T;
  }

  async set<T>(
    key: string,
    value: T,
    options: { ttl?: number; tags?: string[] } = {}
  ): Promise<void> {
    const { ttl, tags } = options;
    const exp = ttl ? Date.now() + ttl : undefined;

    // Clean up existing tags
    const existing = this.store.get(key);
    existing?.tags?.forEach((tag) => {
      this.removeFromTagIndex(tag, key);
    });

    // Add new tags
    tags?.forEach((tag) => {
      this.addToTagIndex(tag, key);
    });

    this.store.set(key, { value, exp, tags });
  }

  async del(key: string): Promise<void> {
    this.deleteKey(key);
  }

  async has(key: string): Promise<boolean> {
    const entry = this.store.get(key);
    if (!entry) return false;

    if (entry.exp && entry.exp < Date.now()) {
      this.deleteKey(key);
      return false;
    }

    return true;
  }

  async getKeysByTag(tags: string[]): Promise<string[]> {
    const keys: string[] = [];
    for (const tag of tags) {
      const foundKeys = this.tagIndex.get(tag);
      if (foundKeys) {
        keys.push(...Array.from(foundKeys.keys()));
      }
    }
    return keys;
  }

  private deleteKey(key: string): void {
    const entry = this.store.get(key);
    if (!entry) return;

    if (entry.tags) {
      entry.tags.forEach((tag) => {
        this.removeFromTagIndex(tag, key);
      });
    }

    this.store.delete(key);
  }

  private addToTagIndex(tag: string, key: string): void {
    if (!this.tagIndex.has(tag)) {
      this.tagIndex.set(tag, new Set());
    }
    this.tagIndex.get(tag)!.add(key);
  }

  private removeFromTagIndex(tag: string, key: string): void {
    const taggedKeys = this.tagIndex.get(tag);
    if (!taggedKeys) return;

    taggedKeys.delete(key);
    if (taggedKeys.size === 0) {
      this.tagIndex.delete(tag);
    }
  }
}

export { type CacheProvider, CacheService, InMemoryCache };
