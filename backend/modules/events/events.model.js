import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: [
        "reunion",
        "annual_meet",
        "virtual",
        "social",
        "workshop",
        "other",
      ],
      default: "other",
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    endDate: {
      type: Date,
    },
    location: {
      venue: String,
      address: String,
      city: String,
      country: String,
      isVirtual: {
        type: Boolean,
        default: false,
      },
      virtualLink: String,
    },
    coverImage: {
      type: String,
      default: "",
    },
    gallery: [String],
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetBatches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
      },
    ],
    registrationRequired: {
      type: Boolean,
      default: true,
    },
    maxAttendees: {
      type: Number,
    },
    registrationDeadline: {
      type: Date,
    },
    attendees: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["registered", "confirmed", "attended", "cancelled"],
          default: "registered",
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for attendees count
eventSchema.virtual("attendeesCount").get(function () {
  return this.attendees.filter((a) => a.status !== "cancelled").length;
});

// Index for faster queries
eventSchema.index({ date: -1, status: 1 });
eventSchema.index({ title: "text", description: "text" });

const Event = mongoose.model("Event", eventSchema);

export default Event;
