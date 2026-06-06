export const STALE_TIME = {
  DEFAULT: 5 * 60 * 1000,
  BATCHES: Infinity,
  SITE_CONTENT: 30 * 60 * 1000,
  USER_STATS: 10 * 60 * 1000,
  ALUMNI_MAP: 15 * 60 * 1000,
  DIRECTORY: 2 * 60 * 1000,
  GALLERY: 60 * 1000,
  FIFA: 2 * 60 * 1000,
};

export const BATCH_LIST_PARAMS = { limit: 200 };

export const QUERY_KEYS = {
  batchesRoot: ["batches"],
  batches: (params = BATCH_LIST_PARAMS) => ["batches", params],
  batch: (id) => ["batch", id],
  userStats: ["userStats"],
  usersDirectory: (page, appliedFilters) => [
    "users",
    "directory",
    page,
    appliedFilters,
  ],
  usersMap: ["users", "map"],
  siteContent: (key) => ["siteContent", key],
  siteContentRoot: ["siteContent"],
  adminBatches: ["admin", "batches"],
  upcomingEvents: ["upcomingEvents"],
  eventsRoot: ["events"],
  latestNews: ["latestNews"],
  newsRoot: ["news"],
  jobsRoot: ["jobs"],
  galleryFeed: ["gallery", "s3-feed"],
  donationCampaigns: ["donation-campaigns"],
  mentors: ["mentors"],
  fifaCampaign: ["fifa", "campaign"],
  fifaLeaderboard: (track) => ["fifa", "leaderboard", track],
  fifaMyPredictions: ["fifa", "my-predictions"],
  adminFifa: ["admin", "fifa"],
};
