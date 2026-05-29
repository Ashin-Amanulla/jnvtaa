import mongoose from "mongoose";
import crypto from "crypto";

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    status: {
      type: String,
      enum: ["pending", "active", "unsubscribed"],
      default: "pending",
    },
    confirmToken: {
      type: String,
      select: false,
    },
    source: {
      type: String,
      default: "website",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

subscriberSchema.pre("save", function (next) {
  if (this.isNew && !this.confirmToken) {
    this.confirmToken = crypto.randomBytes(32).toString("hex");
  }
  next();
});

const campaignSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    sentAt: {
      type: Date,
    },
    recipientCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "sent"],
      default: "draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Subscriber = mongoose.model("Subscriber", subscriberSchema);
export const Campaign = mongoose.model("Campaign", campaignSchema);
