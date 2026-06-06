import Redis from "ioredis";

let redis = null;

export const CACHE_TTL = {
  BATCHES: 86400,
  USERS_STATS: 600,
  SITE_CONTENT: 1800,
  EVENTS_UPCOMING: 300,
  EVENTS_LIST: 300,
  NEWS_LATEST: 300,
  NEWS_LIST: 300,
  JOBS_LIST: 300,
  GALLERY_FEED: 300,
  DONATION_CAMPAIGNS: 600,
  MENTORS: 600,
};

function hashParams(params) {
  return (
    Object.entries(params)
      .filter(([, value]) => value != null && value !== "")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("|") || "default"
  );
}

export const CACHE_KEYS = {
  batchesList: (page, limit) => `jnvtaa:batches:list:${page}:${limit}`,
  batch: (id) => `jnvtaa:batches:${id}`,
  usersStats: () => "jnvtaa:users:stats",
  siteContent: (key) => `jnvtaa:site:${key.toLowerCase()}`,
  eventsUpcoming: () => "jnvtaa:events:upcoming",
  eventsList: (params) => `jnvtaa:events:list:${hashParams(params)}`,
  newsLatest: () => "jnvtaa:news:latest",
  newsList: (params) => `jnvtaa:news:list:${hashParams(params)}`,
  jobsList: (params) => `jnvtaa:jobs:list:${hashParams(params)}`,
  galleryFeed: () => "jnvtaa:gallery:s3-feed",
  donationCampaigns: (params) => `jnvtaa:donations:campaigns:${hashParams(params)}`,
  mentors: () => "jnvtaa:mentorship:mentors",
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

export async function getOrSet(key, ttlSeconds, fetchFn, options = {}) {
  const { shouldCache = () => true } = options;
  const client = getRedisClient();

  if (client) {
    try {
      const cached = await client.get(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (shouldCache(parsed)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("[Cache] get failed:", err.message);
    }
  }

  const value = await fetchFn();

  if (client && shouldCache(value)) {
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

export async function bustEventsCache() {
  await bust(CACHE_KEYS.eventsUpcoming());
  await bustPattern("jnvtaa:events:list:*");
}

export async function bustNewsCache() {
  await bust(CACHE_KEYS.newsLatest());
  await bustPattern("jnvtaa:news:list:*");
}

export async function bustJobsCache() {
  await bustPattern("jnvtaa:jobs:list:*");
}

export async function bustGalleryCache() {
  await bust(CACHE_KEYS.galleryFeed());
}

export async function bustDonationCampaignsCache() {
  await bustPattern("jnvtaa:donations:campaigns:*");
}

export async function bustMentorsCache() {
  await bust(CACHE_KEYS.mentors());
}

export async function bustUserStatsAndBatches(batchId) {
  await bust(CACHE_KEYS.usersStats());
  await bustBatchesCache(batchId);
}
