import mongoose from "mongoose";

const mentorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    domains: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      maxlength: 1000,
      default: "",
    },
    availability: {
      type: String,
      enum: ["open", "limited", "unavailable"],
      default: "open",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

mentorProfileSchema.index({ isApproved: 1, isActive: 1 });

const mentorshipRequestSchema = new mongoose.Schema(
  {
    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

mentorshipRequestSchema.index({ mentee: 1, mentor: 1 });
mentorshipRequestSchema.index({ mentor: 1, status: 1 });

export const MentorProfile = mongoose.model("MentorProfile", mentorProfileSchema);
export const MentorshipRequest = mongoose.model(
  "MentorshipRequest",
  mentorshipRequestSchema
);
