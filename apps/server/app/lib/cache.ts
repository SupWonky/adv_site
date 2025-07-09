import { CacheService, InMemoryCache } from "@proj-adv/cache";
import { singelton } from "~/singelton.server";

const cacheService = singelton(
  "cache",
  () => new CacheService(new InMemoryCache())
);

type AsyncMethod = (...args: any[]) => Promise<any>;

export function Cache(
  options: {
    tags?: string[];
    keyGenerator?: (...args: any[]) => string;
    ttl?: number;
  } = {}
) {
  return (
    target: Object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<AsyncMethod>
  ) => {
    if (typeof descriptor.value !== "function") {
      throw new Error("@Cache can only be applied to methods");
    }

    const originalMethod = descriptor.value;

    const wrapped: AsyncMethod = async function (
      this: unknown,
      ...args: any[]
    ): Promise<any> {
      const { tags, keyGenerator, ttl } = options;

      // Generate cache key
      const cacheKeyParts = [target.constructor.name, propertyKey.toString()];

      if (keyGenerator) {
        cacheKeyParts.push(keyGenerator(...args));
      } else {
        // Fallback: generate hash from arguments
        const argsHash = JSON.stringify(args);
        cacheKeyParts.push(argsHash);
      }

      const cacheKey = cacheKeyParts.join(":");

      console.log(cacheKey);

      try {
        return await cacheService.withCache(
          cacheKey,
          () => originalMethod.apply(this, args),
          { ttl, tags }
        );
      } catch (error) {
        // Handle cache errors without breaking functionality
        console.error("Cache error:", error);
        return originalMethod.apply(this, args);
      }
    };

    descriptor.value = wrapped;

    return descriptor;
  };
}

export function invalidateCacheTags(tags: string[]) {
  return cacheService.invalidateTags(tags);
}

export function invalidateCacheKeys(keys: string[]) {
  return cacheService.invalidate(keys);
}
