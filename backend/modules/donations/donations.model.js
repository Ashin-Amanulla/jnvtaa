import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DonationCampaign",
      required: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 1,
    },
    currency: {
      type: String,
      default: "INR",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "upi", "netbanking", "wallet", "other"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    goal: {
      type: Number,
      required: [true, "Goal amount is required"],
      min: 1,
    },
    raised: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    category: {
      type: String,
      enum: [
        "scholarship",
        "infrastructure",
        "event",
        "emergency",
        "general",
        "other",
      ],
      default: "general",
    },
    coverImage: {
      type: String,
      default: "",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "paused", "cancelled"],
      default: "active",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
campaignSchema.virtual("donationsCount", {
  ref: "Donation",
  localField: "_id",
  foreignField: "campaign",
  count: true,
});

campaignSchema.virtual("progress").get(function () {
  return Math.min((this.raised / this.goal) * 100, 100);
});

const Donation = mongoose.model("Donation", donationSchema);
const DonationCampaign = mongoose.model("DonationCampaign", campaignSchema);

export { Donation, DonationCampaign };
