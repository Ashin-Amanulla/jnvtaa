import { asyncHandler, AppError } from "../../middlewares/error.middleware.js";
import User from "../users/users.model.js";
import Event from "../events/events.model.js";
import News from "../news/news.model.js";
import Job from "../jobs/jobs.model.js";
import { sendSuccess } from "../../helpers/response.js";

const SEARCH_LIMIT = 10;

export const globalSearch = asyncHandler(async (req, res, next) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return next(new AppError("Search query must be at least 2 characters", 400));
  }

  const regex = new RegExp(q.trim(), "i");

  const [users, events, news, jobs] = await Promise.all([
    User.find({
      isVerified: true,
      isActive: true,
      $or: [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { profession: regex },
        { company: regex },
        { currentCity: regex },
      ],
    })
      .select("firstName lastName avatar profession company currentCity batch")
      .populate("batch", "year name")
      .limit(SEARCH_LIMIT)
      .lean(),

    Event.find({
      isPublished: true,
      $or: [{ title: regex }, { description: regex }, { tags: regex }],
    })
      .select("title description type date status coverImage location")
      .limit(SEARCH_LIMIT)
      .lean(),

    News.find({
      isPublished: true,
      $or: [{ title: regex }, { excerpt: regex }, { tags: regex }],
    })
      .select("title slug excerpt category coverImage publishedAt")
      .limit(SEARCH_LIMIT)
      .lean(),

    Job.find({
      isPublished: true,
      status: "active",
      $or: [
        { title: regex },
        { company: regex },
        { description: regex },
        { industry: regex },
        { skills: regex },
      ],
    })
      .select("title company location employmentType industry createdAt")
      .limit(SEARCH_LIMIT)
      .lean(),
  ]);

  sendSuccess(
    res,
    200,
    {
      query: q.trim(),
      results: { users, events, news, jobs },
      counts: {
        users: users.length,
        events: events.length,
        news: news.length,
        jobs: jobs.length,
      },
    },
    "Search completed successfully"
  );
});
