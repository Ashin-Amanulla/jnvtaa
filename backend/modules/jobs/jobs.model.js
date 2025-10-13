import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    requirements: {
      type: String,
    },
    location: {
      city: String,
      country: String,
      isRemote: {
        type: Boolean,
        default: false,
      },
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "freelance"],
      default: "full-time",
    },
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "executive"],
      default: "mid",
    },
    industry: {
      type: String,
      trim: true,
    },
    skills: [String],
    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: "INR",
      },
      isNegotiable: {
        type: Boolean,
        default: true,
      },
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicationUrl: {
      type: String,
    },
    applicationEmail: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "closed", "filled"],
      default: "active",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
jobSchema.virtual("applicationsCount").get(function () {
  return this.applications.length;
});

// Index
jobSchema.index({ title: "text", description: "text", company: "text" });
jobSchema.index({ createdAt: -1 });

const Job = mongoose.model("Job", jobSchema);

export default Job;
