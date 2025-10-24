const g: any = typeof window !== 'undefined' ? window : globalThis;
const key = '__YIMINGHE_ASYNC_CACHE';

interface CacheItem<T = any> {
  time: number;
  ok?: Promise<T>;
  p?: Promise<T>;
}

const globalCache: Map<string, CacheItem> = (g[key] = g[key] || new Map());

export function getCacheItem<T = any>(key: string): CacheItem<T> | undefined {
  return globalCache.get(key);
}

export function cacheAsync<T extends (...args: any[]) => any>(
  keyFn: (...args: Parameters<T>) => string,
  expire: number,
  fn: T,
): T & { removeCache: (...args: Parameters<T>) => void } {
  const fn2: any = function (...args: any) {
    const key = keyFn(...args);
    let cache = globalCache.get(key);
    const now = Date.now();
    if ((cache && cache.time + expire < now) || (!cache?.p && !cache?.ok)) {
      const p = fn(...args);
      cache = {
        ...cache,
        time: now,
        p,
      };
      globalCache.set(key, cache);
      p.then(() => {
        const item = globalCache.get(key);
        if (item) {
          item.ok = p;
        }
      }, () => {
        const item = globalCache.get(key);
        if (item) {
          item.p = undefined;
        }
      })
    }
    return (cache.ok || cache.p) as Promise<any>;
  }

  fn2.removeCache = (...args: any) => {
    const key = keyFn(...args);
    globalCache.delete(key);
  };

  return fn2;
}
