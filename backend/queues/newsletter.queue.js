import { Queue, Worker } from "bullmq";
import { getRedisClient } from "../helpers/cache.js";
import { sendNewsletterCampaign } from "../services/email.service.js";

const QUEUE_NAME = "newsletter";

let queue = null;
let worker = null;

function getConnection() {
  const client = getRedisClient();
  if (!client) {
    throw new Error("REDIS_URL is required for newsletter queue");
  }
  return client;
}

function getNewsletterQueue() {
  if (!queue) {
    queue = new Queue(QUEUE_NAME, {
      connection: getConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
  }
  return queue;
}

export function startNewsletterWorker() {
  if (!process.env.REDIS_URL) {
    console.warn("[Newsletter] REDIS_URL not set — queue worker disabled");
    return null;
  }

  if (worker) return worker;

  worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { email, subject, body } = job.data;
      await sendNewsletterCampaign(email, subject, body);
    },
    {
      connection: getConnection(),
      concurrency: 5,
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`[Newsletter] Job ${job?.id} failed:`, err.message);
  });

  console.log("[Newsletter] BullMQ worker started");
  return worker;
}

export async function queueNewsletterCampaign(campaign, subscribers) {
  const newsletterQueue = getNewsletterQueue();

  const jobs = subscribers.map((subscriber) => ({
    name: "send-campaign-email",
    data: {
      email: subscriber.email,
      subject: campaign.subject,
      body: campaign.body,
    },
  }));

  await newsletterQueue.addBulk(jobs);
  return subscribers.length;
}
