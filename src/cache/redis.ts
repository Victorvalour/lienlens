import { Redis } from 'ioredis';
import { createHash } from 'node:crypto';

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (!redis && process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
    redis.on('error', (err) => {
      console.error('[Redis] Error:', err.message);
    });
  }
  return redis;
}

export function cacheKey(toolName: string, params: unknown): string {
  const hash = createHash('sha256').update(JSON.stringify(params)).digest('hex').slice(0, 16);
  return `lienlens:${toolName}:${hash}`;
}

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const r = getRedis();
    if (!r) return null;
    const data = await r.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch {
    return null;
  }
}

export async function setCached(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    const r = getRedis();
    if (!r) return;
    await r.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    const r = getRedis();
    if (!r) return;
    const keys = await r.keys(pattern);
    if (keys.length > 0) {
      await r.del(...keys);
    }
  } catch {
    // ignore
  }
}
