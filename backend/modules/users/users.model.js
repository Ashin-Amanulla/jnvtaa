import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: [true, "Batch is required"],
    },
    rollNumber: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    currentCity: {
      type: String,
      trim: true,
    },
    currentCountry: {
      type: String,
      trim: true,
    },
    profession: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    socialLinks: {
      linkedin: String,
      facebook: String,
      twitter: String,
      instagram: String,
    },
    privacySettings: {
      showEmail: {
        type: Boolean,
        default: false,
      },
      showPhone: {
        type: Boolean,
        default: false,
      },
      showLocation: {
        type: Boolean,
        default: true,
      },
      showProfession: {
        type: Boolean,
        default: true,
      },
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profileCompleteness: {
      type: Number,
      default: 0,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Index for search
userSchema.index({ firstName: "text", lastName: "text", email: "text" });
userSchema.index({ batch: 1, currentCity: 1, profession: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Calculate profile completeness
userSchema.pre("save", function (next) {
  const fields = [
    this.firstName,
    this.lastName,
    this.email,
    this.phone,
    this.batch,
    this.dateOfBirth,
    this.avatar,
    this.bio,
    this.currentCity,
    this.profession,
    this.company,
  ];

  const filledFields = fields.filter((field) => field && field !== "").length;
  this.profileCompleteness = Math.round((filledFields / fields.length) * 100);

  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
