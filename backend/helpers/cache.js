import Redis from "ioredis";

let redis = null;

export const CACHE_TTL = {
  BATCHES: 86400,
  USERS_STATS: 600,
  SITE_CONTENT: 1800,
  EVENTS_UPCOMING: 300,
  NEWS_LATEST: 300,
};

export const CACHE_KEYS = {
  batchesList: (page, limit) => `jnvtaa:batches:list:${page}:${limit}`,
  batch: (id) => `jnvtaa:batches:${id}`,
  usersStats: () => "jnvtaa:users:stats",
  siteContent: (key) => `jnvtaa:site:${key.toLowerCase()}`,
  eventsUpcoming: () => "jnvtaa:events:upcoming",
  newsLatest: () => "jnvtaa:news:latest",
};

export function getRedisClient() {
  if (redis) return redis;

  const url = process.env.REDIS_URL;
  if (!url) return null;

  redis = new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: true,
  });

  redis.on("error", (err) => {
    console.warn("[Redis]", err.message);
  });

  return redis;
}

export async function getOrSet(key, ttlSeconds, fetchFn) {
  const client = getRedisClient();

  if (client) {
    try {
      const cached = await client.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.warn("[Cache] get failed:", err.message);
    }
  }

  const value = await fetchFn();

  if (client) {
    try {
      await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (err) {
      console.warn("[Cache] set failed:", err.message);
    }
  }

  return value;
}

export async function bust(...keys) {
  const client = getRedisClient();
  if (!client || keys.length === 0) return;

  try {
    await client.del(...keys);
  } catch (err) {
    console.warn("[Cache] bust failed:", err.message);
  }
}

export async function bustPattern(pattern) {
  const client = getRedisClient();
  if (!client) return;

  try {
    let cursor = "0";

    do {
      const [nextCursor, keys] = await client.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } while (cursor !== "0");
  } catch (err) {
    console.warn("[Cache] bustPattern failed:", err.message);
  }
}

export async function bustBatchesCache(batchId) {
  await bustPattern("jnvtaa:batches:*");
  if (batchId) {
    await bust(CACHE_KEYS.batch(batchId));
  }
}
