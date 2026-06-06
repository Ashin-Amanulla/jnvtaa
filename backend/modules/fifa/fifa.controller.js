import { asyncHandler, AppError } from "../../middlewares/error.middleware.js";
import {
  FifaCampaign,
  FifaMatch,
  FifaStudent,
  FifaPrediction,
} from "./fifa.model.js";
import { sendSuccess } from "../../helpers/response.js";
import {
  getOrSet,
  CACHE_KEYS,
  CACHE_TTL,
  bustFifaCache,
} from "../../helpers/cache.js";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

// The single campaign participants currently play in. We treat the most
// recent active (or, failing that, most recent) campaign as "the" campaign.
async function resolveActiveCampaign() {
  return (
    (await FifaCampaign.findOne({ status: "active" }).sort({ createdAt: -1 })) ||
    (await FifaCampaign.findOne().sort({ createdAt: -1 }))
  );
}

function isLocked(match) {
  const lockAt = match.predictionLockAt || match.kickoffAt;
  return Date.now() >= new Date(lockAt).getTime();
}

// Score a single prediction against a completed match. Pure — returns points.
//   correct exact score -> 3 (supersedes the winner point, not additive)
//   correct winner/draw -> 1
//   wrong               -> 0
function scorePrediction(prediction, match) {
  const { resultTeamAScore: a, resultTeamBScore: b } = match;
  const actualWinner = a > b ? "teamA" : a < b ? "teamB" : "draw";

  if (prediction.predictedWinner !== actualWinner) return 0;

  const exactGiven =
    prediction.predictedTeamAScore != null &&
    prediction.predictedTeamBScore != null;
  const exactCorrect =
    exactGiven &&
    prediction.predictedTeamAScore === a &&
    prediction.predictedTeamBScore === b;

  return exactCorrect ? 3 : 1;
}

// Build the editable / locked view of all matches for a participant, merged
// with whatever predictions they've already made.
function buildMatchView(matches, predictionsByMatch) {
  return matches.map((m) => {
    const p = predictionsByMatch.get(String(m._id));
    return {
      _id: m._id,
      teamA: m.teamA,
      teamB: m.teamB,
      kickoffAt: m.kickoffAt,
      predictionLockAt: m.predictionLockAt,
      stage: m.stage,
      locked: isLocked(m),
      resultEntered: m.resultEntered,
      resultTeamAScore: m.resultTeamAScore,
      resultTeamBScore: m.resultTeamBScore,
      prediction: p
        ? {
            predictedWinner: p.predictedWinner,
            predictedTeamAScore: p.predictedTeamAScore,
            predictedTeamBScore: p.predictedTeamBScore,
            pointsAwarded: p.pointsAwarded,
            scored: p.scored,
          }
        : null,
    };
  });
}

// Aggregate predictions into a sorted leaderboard with tiebreaks and the
// hot-streak flag. Works for either track.
function buildLeaderboard(predictions, matchesById, labelFor) {
  const byParticipant = new Map();

  for (const p of predictions) {
    const key = p.participantStudent
      ? `s:${p.participantStudent._id}`
      : `a:${p.participantUser?._id}`;
    if (!byParticipant.has(key)) {
      byParticipant.set(key, {
        key,
        ...labelFor(p),
        joinedAt: p._participantJoinedAt,
        points: 0,
        exactScores: 0,
        correctWinners: 0,
        predictions: [],
      });
    }
    byParticipant.get(key).predictions.push(p);
  }

  const rows = [];
  for (const entry of byParticipant.values()) {
    // Order this participant's scored predictions chronologically by kickoff
    // so the hot-streak reflects match order, not insertion order.
    const scored = entry.predictions
      .filter((p) => p.scored)
      .sort((x, y) => {
        const mx = matchesById.get(String(x.match));
        const my = matchesById.get(String(y.match));
        return new Date(mx.kickoffAt) - new Date(my.kickoffAt);
      });

    let streak = 0;
    let currentStreak = 0;
    for (const p of scored) {
      entry.points += p.pointsAwarded;
      if (p.pointsAwarded >= 3) entry.exactScores += 1;
      if (p.pointsAwarded >= 1) {
        entry.correctWinners += 1;
        currentStreak += 1;
        streak = Math.max(streak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    rows.push({
      name: entry.name,
      group: entry.group,
      points: entry.points,
      exactScores: entry.exactScores,
      correctWinners: entry.correctWinners,
      hotStreak: currentStreak >= 3,
      longestStreak: streak,
      joinedAt: entry.joinedAt,
    });
  }

  // Tiebreak: points -> exact scores -> correct winners -> earliest joined.
  rows.sort(
    (a, b) =>
      b.points - a.points ||
      b.exactScores - a.exactScores ||
      b.correctWinners - a.correctWinners ||
      new Date(a.joinedAt) - new Date(b.joinedAt)
  );

  return rows.map((r, i) => ({ rank: i + 1, ...r }));
}

/* -------------------------------------------------------------------------- */
/*  Public / participant                                                       */
/* -------------------------------------------------------------------------- */

export const getActiveCampaign = asyncHandler(async (req, res) => {
  const data = await getOrSet(
    CACHE_KEYS.fifaCampaign(),
    CACHE_TTL.FIFA_CAMPAIGN,
    async () => {
      const campaign = await resolveActiveCampaign();
      if (!campaign) return { campaign: null, matches: [] };
      const matches = await FifaMatch.find({ campaign: campaign._id }).sort({
        kickoffAt: 1,
      });
      return { campaign, matches };
    }
  );

  // `locked` is time-sensitive, so compute it fresh outside the cache.
  const matches = (data.matches || []).map((m) => ({
    ...m,
    locked: isLocked(m),
  }));

  sendSuccess(res, 200, { campaign: data.campaign, matches }, "Campaign retrieved");
});

export const getLeaderboard = asyncHandler(async (req, res, next) => {
  const track = req.query.track === "alumni" ? "alumni" : "student";

  const data = await getOrSet(
    CACHE_KEYS.fifaLeaderboard({ track }),
    CACHE_TTL.FIFA_LEADERBOARD,
    async () => {
      const campaign = await resolveActiveCampaign();
      if (!campaign) return { rows: [] };

      const matches = await FifaMatch.find({
        campaign: campaign._id,
        resultEntered: true,
      });
      const matchesById = new Map(matches.map((m) => [String(m._id), m]));

      const query = {
        campaign: campaign._id,
        participantType: track,
        scored: true,
      };

      let predictions;
      let labelFor;

      if (track === "alumni") {
        predictions = await FifaPrediction.find(query).populate({
          path: "participantUser",
          select: "firstName lastName batch createdAt",
          populate: { path: "batch", select: "year passoutYear" },
        });
        // drop predictions whose user vanished
        predictions = predictions.filter((p) => p.participantUser);
        predictions.forEach((p) => {
          p._participantJoinedAt = p.participantUser.createdAt || p.createdAt;
        });
        labelFor = (p) => ({
          name: `${p.participantUser.firstName} ${p.participantUser.lastName}`.trim(),
          group: p.participantUser.batch?.passoutYear
            ? `Batch ${p.participantUser.batch.passoutYear}`
            : null,
        });
      } else {
        predictions = await FifaPrediction.find(query).populate({
          path: "participantStudent",
          select: "name classSection createdAt",
        });
        predictions = predictions.filter((p) => p.participantStudent);
        predictions.forEach((p) => {
          p._participantJoinedAt =
            p.participantStudent.createdAt || p.createdAt;
        });
        labelFor = (p) => ({
          name: p.participantStudent.name,
          group: p.participantStudent.classSection || null,
        });
      }

      return { rows: buildLeaderboard(predictions, matchesById, labelFor) };
    }
  );

  sendSuccess(res, 200, { track, leaderboard: data.rows }, "Leaderboard retrieved");
});

export const registerStudent = asyncHandler(async (req, res, next) => {
  const campaign = await resolveActiveCampaign();
  if (!campaign) return next(new AppError("No active campaign", 400));

  if (
    campaign.registrationCloseAt &&
    Date.now() >= new Date(campaign.registrationCloseAt).getTime()
  ) {
    return next(new AppError("Registration is closed", 400));
  }

  const { name, rollNumber, email, classSection } = req.body;

  try {
    const student = await FifaStudent.create({
      campaign: campaign._id,
      name,
      rollNumber,
      email,
      classSection,
    });
    sendSuccess(
      res,
      201,
      { student: { _id: student._id, name: student.name } },
      "Registered successfully"
    );
  } catch (err) {
    if (err.code === 11000) {
      return next(
        new AppError("This roll number is already registered", 409)
      );
    }
    throw err;
  }
});

// Look up a student by roll + email and return their match/prediction view.
async function findStudentOrThrow(campaign, rollNumber, email, next) {
  const student = await FifaStudent.findOne({
    campaign: campaign._id,
    rollNumber,
    email: email.toLowerCase(),
  });
  if (!student) {
    next(
      new AppError(
        "No registration found for that roll number and email",
        404
      )
    );
    return null;
  }
  return student;
}

export const getMatchesForStudent = asyncHandler(async (req, res, next) => {
  const campaign = await resolveActiveCampaign();
  if (!campaign) return next(new AppError("No active campaign", 400));

  const student = await findStudentOrThrow(
    campaign,
    req.body.rollNumber,
    req.body.email,
    next
  );
  if (!student) return;

  const matches = await FifaMatch.find({ campaign: campaign._id }).sort({
    kickoffAt: 1,
  });
  const preds = await FifaPrediction.find({
    campaign: campaign._id,
    participantStudent: student._id,
  });
  const byMatch = new Map(preds.map((p) => [String(p.match), p]));

  sendSuccess(
    res,
    200,
    {
      student: { _id: student._id, name: student.name },
      matches: buildMatchView(matches, byMatch),
    },
    "Matches retrieved"
  );
});

export const submitStudentPrediction = asyncHandler(async (req, res, next) => {
  const campaign = await resolveActiveCampaign();
  if (!campaign) return next(new AppError("No active campaign", 400));

  const student = await findStudentOrThrow(
    campaign,
    req.body.rollNumber,
    req.body.email,
    next
  );
  if (!student) return;

  const match = await FifaMatch.findOne({
    _id: req.body.matchId,
    campaign: campaign._id,
  });
  if (!match) return next(new AppError("Match not found", 404));
  if (isLocked(match))
    return next(new AppError("Predictions are locked for this match", 400));

  const prediction = await upsertPrediction({
    campaign,
    match,
    participantType: "student",
    refField: "participantStudent",
    refId: student._id,
    body: req.body,
  });

  sendSuccess(res, 200, { prediction }, "Prediction saved");
});

/* -------------------------------------------------------------------------- */
/*  Alumni (authenticated)                                                      */
/* -------------------------------------------------------------------------- */

export const getMyAlumniPredictions = asyncHandler(async (req, res, next) => {
  const campaign = await resolveActiveCampaign();
  if (!campaign) return next(new AppError("No active campaign", 400));

  const matches = await FifaMatch.find({ campaign: campaign._id }).sort({
    kickoffAt: 1,
  });
  const preds = await FifaPrediction.find({
    campaign: campaign._id,
    participantUser: req.user._id,
  });
  const byMatch = new Map(preds.map((p) => [String(p.match), p]));

  sendSuccess(
    res,
    200,
    { matches: buildMatchView(matches, byMatch) },
    "Predictions retrieved"
  );
});

export const submitAlumniPrediction = asyncHandler(async (req, res, next) => {
  const campaign = await resolveActiveCampaign();
  if (!campaign) return next(new AppError("No active campaign", 400));

  const match = await FifaMatch.findOne({
    _id: req.body.matchId,
    campaign: campaign._id,
  });
  if (!match) return next(new AppError("Match not found", 404));
  if (isLocked(match))
    return next(new AppError("Predictions are locked for this match", 400));

  const prediction = await upsertPrediction({
    campaign,
    match,
    participantType: "alumni",
    refField: "participantUser",
    refId: req.user._id,
    body: req.body,
  });

  sendSuccess(res, 200, { prediction }, "Prediction saved");
});

// Shared upsert for both tracks.
async function upsertPrediction({
  campaign,
  match,
  participantType,
  refField,
  refId,
  body,
}) {
  const update = {
    campaign: campaign._id,
    match: match._id,
    participantType,
    [refField]: refId,
    predictedWinner: body.predictedWinner,
    predictedTeamAScore: body.predictedTeamAScore ?? undefined,
    predictedTeamBScore: body.predictedTeamBScore ?? undefined,
    // editing an unscored prediction; results aren't in yet (match isn't locked)
    pointsAwarded: 0,
    scored: false,
  };

  return FifaPrediction.findOneAndUpdate(
    { match: match._id, [refField]: refId },
    update,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

/* -------------------------------------------------------------------------- */
/*  Admin                                                                       */
/* -------------------------------------------------------------------------- */

export const createCampaign = asyncHandler(async (req, res) => {
  const campaign = await FifaCampaign.create({
    ...req.body,
    createdBy: req.user._id,
  });
  await bustFifaCache();
  sendSuccess(res, 201, { campaign }, "Campaign created");
});

export const updateCampaign = asyncHandler(async (req, res, next) => {
  const campaign = await FifaCampaign.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!campaign) return next(new AppError("Campaign not found", 404));
  await bustFifaCache();
  sendSuccess(res, 200, { campaign }, "Campaign updated");
});

export const createMatch = asyncHandler(async (req, res) => {
  const match = await FifaMatch.create(req.body);
  await bustFifaCache();
  sendSuccess(res, 201, { match }, "Match created");
});

export const updateMatch = asyncHandler(async (req, res, next) => {
  const match = await FifaMatch.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!match) return next(new AppError("Match not found", 404));
  await bustFifaCache();
  sendSuccess(res, 200, { match }, "Match updated");
});

export const deleteMatch = asyncHandler(async (req, res, next) => {
  const match = await FifaMatch.findByIdAndDelete(req.params.id);
  if (!match) return next(new AppError("Match not found", 404));
  await FifaPrediction.deleteMany({ match: match._id });
  await bustFifaCache();
  sendSuccess(res, 200, {}, "Match deleted");
});

export const enterMatchResult = asyncHandler(async (req, res, next) => {
  const match = await FifaMatch.findById(req.params.id);
  if (!match) return next(new AppError("Match not found", 404));

  match.resultTeamAScore = req.body.resultTeamAScore;
  match.resultTeamBScore = req.body.resultTeamBScore;
  match.resultEntered = true;
  match.status = "completed";
  await match.save();

  // Recompute scoring for every prediction on this match (idempotent).
  const predictions = await FifaPrediction.find({ match: match._id });
  await Promise.all(
    predictions.map((p) => {
      p.pointsAwarded = scorePrediction(p, match);
      p.scored = true;
      return p.save();
    })
  );

  await bustFifaCache();
  sendSuccess(
    res,
    200,
    { match, scoredCount: predictions.length },
    "Result entered and predictions scored"
  );
});

export const listStudents = asyncHandler(async (req, res) => {
  const campaign = await resolveActiveCampaign();
  const students = campaign
    ? await FifaStudent.find({ campaign: campaign._id }).sort({ createdAt: -1 })
    : [];
  sendSuccess(res, 200, { students }, "Students retrieved");
});

export const deleteStudent = asyncHandler(async (req, res, next) => {
  const student = await FifaStudent.findByIdAndDelete(req.params.id);
  if (!student) return next(new AppError("Student not found", 404));
  await FifaPrediction.deleteMany({ participantStudent: student._id });
  await bustFifaCache();
  sendSuccess(res, 200, {}, "Student removed");
});
