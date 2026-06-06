import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Campaign name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "completed"],
      default: "upcoming",
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    registrationCloseAt: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const matchSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FifaCampaign",
      required: true,
    },
    teamA: {
      type: String,
      required: [true, "Team A is required"],
      trim: true,
    },
    teamB: {
      type: String,
      required: [true, "Team B is required"],
      trim: true,
    },
    kickoffAt: {
      type: Date,
      required: [true, "Kickoff time is required"],
    },
    // Predictions lock at this time. Defaults to kickoff - 1h if not provided.
    predictionLockAt: {
      type: Date,
    },
    stage: {
      type: String,
      enum: ["group", "r16", "qf", "sf", "final"],
      default: "group",
    },
    resultTeamAScore: {
      type: Number,
      min: 0,
    },
    resultTeamBScore: {
      type: Number,
      min: 0,
    },
    resultEntered: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["scheduled", "locked", "completed"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

// Default the lock time to one hour before kickoff when not explicitly set.
matchSchema.pre("validate", function (next) {
  if (!this.predictionLockAt && this.kickoffAt) {
    this.predictionLockAt = new Date(this.kickoffAt.getTime() - 60 * 60 * 1000);
  }
  next();
});

matchSchema.index({ campaign: 1, kickoffAt: 1 });

// Lightweight student participant — no User account.
const studentSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FifaCampaign",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, "Roll number is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    classSection: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Roll number is the anti-cheat anchor: one entry per roll number per campaign.
// (User.rollNumber is NOT unique, so uniqueness must live here.)
studentSchema.index({ campaign: 1, rollNumber: 1 }, { unique: true });

const predictionSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FifaCampaign",
      required: true,
    },
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FifaMatch",
      required: true,
    },
    participantType: {
      type: String,
      enum: ["student", "alumni"],
      required: true,
    },
    // Exactly one of these is set depending on participantType.
    participantUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    participantStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FifaStudent",
    },
    predictedWinner: {
      type: String,
      enum: ["teamA", "draw", "teamB"],
      required: [true, "Predicted winner is required"],
    },
    predictedTeamAScore: {
      type: Number,
      min: 0,
    },
    predictedTeamBScore: {
      type: Number,
      min: 0,
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
    scored: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// One prediction per participant per match (sparse so the unused ref is ignored).
predictionSchema.index(
  { match: 1, participantUser: 1 },
  { unique: true, partialFilterExpression: { participantUser: { $exists: true } } }
);
predictionSchema.index(
  { match: 1, participantStudent: 1 },
  {
    unique: true,
    partialFilterExpression: { participantStudent: { $exists: true } },
  }
);

const FifaCampaign = mongoose.model("FifaCampaign", campaignSchema);
const FifaMatch = mongoose.model("FifaMatch", matchSchema);
const FifaStudent = mongoose.model("FifaStudent", studentSchema);
const FifaPrediction = mongoose.model("FifaPrediction", predictionSchema);

export { FifaCampaign, FifaMatch, FifaStudent, FifaPrediction };
