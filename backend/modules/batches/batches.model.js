import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: [true, "Year is required"],
      unique: true,
      min: 1985,
      max: new Date().getFullYear() + 10,
    },
    name: {
      type: String,
      required: [true, "Batch name is required"],
      trim: true,
    },
    passoutYear: {
      type: Number,
      required: [true, "Passout year is required"],
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    groupPhoto: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    reunions: [
      {
        date: Date,
        location: String,
        attendees: Number,
        photos: [String],
        description: String,
      },
    ],
    achievements: [
      {
        title: String,
        description: String,
        date: Date,
      },
    ],
    isActive: {
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

// Virtual for alumni count
batchSchema.virtual("alumniCount", {
  ref: "User",
  localField: "_id",
  foreignField: "batch",
  count: true,
});

// Index for faster queries
batchSchema.index({ year: -1 });

const Batch = mongoose.model("Batch", batchSchema);

export default Batch;
