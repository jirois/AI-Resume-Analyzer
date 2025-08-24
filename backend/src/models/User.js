import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const subscriptionSchema = new mongoose.Schema({
  plan: {
    type: String,
    enum: ["free", "pro", "enterprise"],
    default: "free",
  },
  status: {
    type: String,
    enum: ["active", "inactive", "cancelled", "past_due"],
    default: "active",
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: function () {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    },
  },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  usage: {
    resumesUploaded: {
      type: Number,
      default: 0,
    },
    analysesPerformed: {
      type: Number,
      default: 0,
    },
    lastReset: {
      type: Date,
      default: Date.now,
    },
  },
  limits: {
    resumesPerMonth: {
      type: Number,
      default: 3,
    },
    analysesPerformed: {
      type: Number,
      default: 10,
    },
    maxFileSize: {
      type: Number,
      default: 5 * 1024 * 1024, // 5MB
    },
  },
});

const profileSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
    maxlength: [50, "First name cannot exceed 50 characters"],
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
    maxlength: [50, "Last name cannot exceed 50 characters"],
  },
  profilePicture: {
    url: String,
    publicId: String, // Cloudinary public ID for deletion
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        return !v || /^\+?[\d\s\-\(\)]+$/.test(v);
      },
      message: "Invalid phone number format",
    },
  },
  location: {
    city: String,
    state: String,
    country: String,
    timezone: String,
  },
  preferences: {
    language: {
      type: String,
      default: "en",
    },

    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      analysis: {
        type: Boolean,
        default: true,
      },
      marketing: {
        type: Boolean,
        default: false,
      },
    },
    theme: {
      type: String,
      enum: ["light", "dark", "auto"],
      default: "auto",
    },
  },
});

const securitySchema = new mongoose.Schema({
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerified: {
    type: Boolean,
    default: false,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: String,
});

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email) {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
        },
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    profile: {
      type: profileSchema,
      required: true,
    },
    subscription: {
      type: subscriptionSchema,
      default: () => ({}),
    },
    security: {
      type: securitySchema,
      default: () => ({}),
    },
    savedResumes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resume",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createAt: {
      type: Date,
      default: Date.now,
    },
    updateAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.security.passwordResetToken;
        delete ret.security.emailVerificationToken;
        delete ret.security.twoFactorSecret;
        return ret;
      },
    },
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ "subscription.plan": 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1 });

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Virtual for account lock status
userSchema.virtual("isLocked").get(function () {
  return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
});

// Pre-save middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      userId: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

userSchema.methods.canUploadResume = function () {
  const { resumesUploaded, lastReset } = this.subscription.usage;
  const { resumesPerMonth } = this.subscription.limits;

  // Reset monthly usage if needed
  const now = new Date();
  const resetDate = new Date(lastReset);

  if (
    now.getMonth() !== resetDate.getMonth() ||
    now.getFullYear() !== resetDate.getFullYear()
  ) {
    this.subscription.usage.resumesUploaded = 0;
    this.subscription.usage.lastReset = now;
  }
  return resumesUploaded < resumesPerMonth;
};

userSchema.methods.canPerformAnalysis = function () {
  const { analysesPerformed, lastReset } = this.subscription.usage;
  const { analysesPerMonth } = this.subscription.limits;

  // Reset monthly usage if needed
  const now = new Date();
  const resetDate = new Date(lastReset);

  if (
    now.getMonth() !== resetDate.getMonth() ||
    now.getFullYear() !== resetDate.getFullYear()
  ) {
    this.subscription.usage.analysesPerformed = 0;
    this.subscription.usage.lastReset = now;
  }

  return analysesPerformed < analysesPerMonth;
};

userSchema.methods.incrementUsage = async function (type) {
  if (type === "resume") {
    this.subscription.usage.resumesUploaded += 1;
  } else if (type === "analysis") {
    this.subscription.usage.analysesPerformed += 1;
  }
  await this.save();
};

export default mongoose.model("User", userSchema);
