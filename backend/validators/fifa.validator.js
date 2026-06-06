import Joi from "joi";

const objectId = Joi.string().hex().length(24);

const winner = Joi.string().valid("teamA", "draw", "teamB");

// Optional exact score — both halves required together if either is given.
const scoreFields = {
  predictedTeamAScore: Joi.number().integer().min(0),
  predictedTeamBScore: Joi.number().integer().min(0),
};

// --- Student (no account) ---

export const studentRegisterSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Name is required",
  }),
  rollNumber: Joi.string().min(1).max(40).required().messages({
    "string.empty": "Roll number is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email",
    "string.empty": "Email is required",
  }),
  classSection: Joi.string().max(20).allow("", null),
});

export const studentLookupSchema = Joi.object({
  rollNumber: Joi.string().min(1).max(40).required(),
  email: Joi.string().email().required(),
});

export const studentPredictSchema = Joi.object({
  rollNumber: Joi.string().min(1).max(40).required(),
  email: Joi.string().email().required(),
  matchId: objectId.required(),
  predictedWinner: winner.required(),
  ...scoreFields,
});

// --- Alumni (authenticated) ---

export const alumniPredictSchema = Joi.object({
  matchId: objectId.required(),
  predictedWinner: winner.required(),
  ...scoreFields,
});

// --- Admin ---

export const campaignSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  description: Joi.string().max(2000).allow("", null),
  status: Joi.string().valid("upcoming", "active", "completed"),
  startDate: Joi.date().allow(null),
  endDate: Joi.date().allow(null),
  registrationCloseAt: Joi.date().allow(null),
});

export const updateCampaignSchema = campaignSchema.fork(
  ["name"],
  (s) => s.optional()
);

export const matchSchema = Joi.object({
  campaign: objectId.required(),
  teamA: Joi.string().min(1).max(60).required(),
  teamB: Joi.string().min(1).max(60).required(),
  kickoffAt: Joi.date().required(),
  predictionLockAt: Joi.date().allow(null),
  stage: Joi.string().valid("group", "r16", "qf", "sf", "final"),
});

export const updateMatchSchema = Joi.object({
  teamA: Joi.string().min(1).max(60),
  teamB: Joi.string().min(1).max(60),
  kickoffAt: Joi.date(),
  predictionLockAt: Joi.date().allow(null),
  stage: Joi.string().valid("group", "r16", "qf", "sf", "final"),
  status: Joi.string().valid("scheduled", "locked", "completed"),
});

export const matchResultSchema = Joi.object({
  resultTeamAScore: Joi.number().integer().min(0).required(),
  resultTeamBScore: Joi.number().integer().min(0).required(),
});
